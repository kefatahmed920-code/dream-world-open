/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const app = express();
app.use(express.json());

// Enable CORS so external frontends (e.g. GitHub Pages) can communicate with this backend
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (_req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

const server = http.createServer(app);

// ----------------------------------------------------
// MULTIPLAYER ROOM & CLIENT STATE
// ----------------------------------------------------
interface ConnectedClient {
  ws: WebSocket;
  id: string;
  name: string;
  room: string;
  isAlive: boolean;
  position: [number, number, number];
  rotationY: number;
  speed: number;
  isAirborne: boolean;
  isDriving: boolean;
  appearance: unknown;
  joinedAt: number;
}

const MAX_ROOM_CAPACITY = 50;
const clients = new Map<string, ConnectedClient>();
const rooms = new Map<string, Set<string>>(); // roomName -> Set of clientIds
const privateRoomCodes = new Map<string, string>(); // 6-digit code -> roomName

import fs from 'fs';

// Data storage helpers for persistence
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {}
}

const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Interface for Leaderboard
interface LeaderboardPlayer {
  rank?: number;
  uid?: string;
  name: string;
  level: number;
  taka: number;
  quests: number;
  isOnline: boolean;
  updatedAt?: number;
}

// Initial default leaderboard
const defaultLeaderboard: LeaderboardPlayer[] = [
  { rank: 1, name: 'Tanvir_Pro', level: 24, taka: 45200, quests: 18, isOnline: true },
  { rank: 2, name: 'Afnan_Dhaka', level: 21, taka: 38900, quests: 15, isOnline: true },
  { rank: 3, name: 'Sadia_Rider', level: 19, taka: 31400, quests: 14, isOnline: false },
  { rank: 4, name: 'Sami_Bandarban', level: 17, taka: 26800, quests: 12, isOnline: true },
  { rank: 5, name: 'Farhan_Explorer', level: 15, taka: 21500, quests: 10, isOnline: false },
  { rank: 6, name: 'Nusrat_Chit', level: 14, taka: 18200, quests: 9, isOnline: false },
  { rank: 7, name: 'Rifat_Speed', level: 13, taka: 16500, quests: 8, isOnline: true },
  { rank: 8, name: 'Ananya_Dhaka', level: 11, taka: 14200, quests: 7, isOnline: false },
];

let globalLeaderboard: LeaderboardPlayer[] = [...defaultLeaderboard];

// Load leaderboard from disk if available
try {
  if (fs.existsSync(LEADERBOARD_FILE)) {
    const raw = fs.readFileSync(LEADERBOARD_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      globalLeaderboard = parsed;
    }
  }
} catch {
  // Use default
}

function saveLeaderboard() {
  try {
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(globalLeaderboard, null, 2), 'utf-8');
  } catch {}
}

// User Accounts Storage
interface ServerUserRecord {
  uid: string;
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: number;
  lastLoginAt: number;
  stats: {
    level: number;
    taka: number;
    questsCompleted: number;
    distanceExploredKm: number;
  };
}

const serverUsers = new Map<string, ServerUserRecord>(); // email -> record
const usersByUid = new Map<string, ServerUserRecord>(); // uid -> record

// Load users from disk
try {
  if (fs.existsSync(USERS_FILE)) {
    const rawUsers = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsedUsers: ServerUserRecord[] = JSON.parse(rawUsers);
    if (Array.isArray(parsedUsers)) {
      for (const u of parsedUsers) {
        serverUsers.set(u.email.toLowerCase(), u);
        usersByUid.set(u.uid, u);
      }
    }
  }
} catch {}

function saveUsers() {
  try {
    const list = Array.from(serverUsers.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch {}
}

// Helper: Broadcast to everyone in a room except optionally the sender
function broadcastToRoom(room: string, payload: unknown, excludeClientId?: string) {
  const clientIds = rooms.get(room);
  if (!clientIds) return;

  const msg = JSON.stringify(payload);
  for (const cid of clientIds) {
    if (cid === excludeClientId) continue;
    const client = clients.get(cid);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(msg);
    }
  }
}

// ----------------------------------------------------
// WEBSOCKET SERVER SETUP (/ws/game)
// ----------------------------------------------------
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  try {
    const host = request.headers.host || 'localhost';
    const url = new URL(request.url || '', `http://${host}`);
    if (url.pathname === '/ws/game') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  } catch {
    socket.destroy();
  }
});

wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
  // Parse URL query params
  const host = req.headers.host || 'localhost';
  const parsedUrl = new URL(req.url || '', `http://${host}`);
  const reqRoom = parsedUrl.searchParams.get('room') || 'Dhaka-Hub-1';
  const reqId = parsedUrl.searchParams.get('id') || `p_${Math.random().toString(36).substring(2, 8)}`;
  const reqName = decodeURIComponent(parsedUrl.searchParams.get('name') || 'Explorer');

  // Check Room Capacity Limit (50 players)
  let targetRoom = reqRoom;
  const currentMembers = rooms.get(targetRoom);
  if (currentMembers && currentMembers.size >= MAX_ROOM_CAPACITY) {
    // If public room is full, route to an overflow public room
    if (!targetRoom.startsWith('private_')) {
      let overflowIdx = 2;
      while (rooms.get(`Dhaka-Hub-${overflowIdx}`) && (rooms.get(`Dhaka-Hub-${overflowIdx}`)?.size || 0) >= MAX_ROOM_CAPACITY) {
        overflowIdx++;
      }
      targetRoom = `Dhaka-Hub-${overflowIdx}`;
    } else {
      // Private room is full
      ws.send(JSON.stringify({ type: 'error', message: 'Room is full (Maximum 50 players reached)' }));
      ws.close(1008, 'Room full');
      return;
    }
  }

  // Register client
  const client: ConnectedClient = {
    ws,
    id: reqId,
    name: reqName,
    room: targetRoom,
    isAlive: true,
    position: [6, 0, 12],
    rotationY: 0,
    speed: 0,
    isAirborne: false,
    isDriving: false,
    appearance: null,
    joinedAt: Date.now(),
  };

  clients.set(reqId, client);

  if (!rooms.has(targetRoom)) {
    rooms.set(targetRoom, new Set());
  }
  rooms.get(targetRoom)!.add(reqId);

  // Send Welcome message with room info & list of currently active players in this room
  const existingRoomPlayers: unknown[] = [];
  for (const cid of rooms.get(targetRoom)!) {
    if (cid !== reqId) {
      const other = clients.get(cid);
      if (other) {
        existingRoomPlayers.push({
          id: other.id,
          name: other.name,
          position: other.position,
          rotationY: other.rotationY,
          speed: other.speed,
          isAirborne: other.isAirborne,
          isDriving: other.isDriving,
          appearance: other.appearance,
        });
      }
    }
  }

  ws.send(JSON.stringify({
    type: 'welcome',
    clientId: reqId,
    room: targetRoom,
    capacity: MAX_ROOM_CAPACITY,
    memberCount: rooms.get(targetRoom)!.size,
    existingPlayers: existingRoomPlayers,
  }));

  // Notify everyone else in the room
  broadcastToRoom(targetRoom, {
    type: 'player_joined',
    senderId: reqId,
    name: reqName,
    room: targetRoom,
    memberCount: rooms.get(targetRoom)!.size,
  }, reqId);

  // Handle incoming messages
  ws.on('message', (messageBuffer: Buffer) => {
    try {
      const data = JSON.parse(messageBuffer.toString());

      if (data.type === 'ping') {
        client.isAlive = true;
        ws.send(JSON.stringify({ type: 'pong', time: Date.now() }));
        return;
      }

      if (data.type === 'update') {
        client.position = data.position || client.position;
        client.rotationY = data.rotationY !== undefined ? data.rotationY : client.rotationY;
        client.speed = data.speed || 0;
        client.isAirborne = !!data.isAirborne;
        client.isDriving = !!data.isDriving;
        client.appearance = data.appearance || client.appearance;

        // Relay to room peers
        broadcastToRoom(client.room, {
          type: 'update',
          senderId: client.id,
          name: client.name,
          position: client.position,
          rotationY: client.rotationY,
          speed: client.speed,
          isAirborne: client.isAirborne,
          isDriving: client.isDriving,
          appearance: client.appearance,
        }, client.id);
        return;
      }

      if (data.type === 'chat') {
        // Sanitize and broadcast chat
        const text = String(data.text || '').substring(0, 160);
        broadcastToRoom(client.room, {
          type: 'chat',
          senderId: client.id,
          name: client.name,
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        return;
      }

      if (data.type === 'switch_room') {
        const newRoom = String(data.room || 'Dhaka-Hub-1');
        // Remove from old room
        const oldSet = rooms.get(client.room);
        if (oldSet) {
          oldSet.delete(client.id);
          broadcastToRoom(client.room, {
            type: 'player_left',
            senderId: client.id,
            name: client.name,
          });
        }

        // Join new room
        client.room = newRoom;
        if (!rooms.has(newRoom)) rooms.set(newRoom, new Set());
        rooms.get(newRoom)!.add(client.id);

        ws.send(JSON.stringify({
          type: 'room_switched',
          room: newRoom,
          memberCount: rooms.get(newRoom)!.size,
        }));
      }
    } catch {
      // Ignore malformed payloads
    }
  });

  ws.on('close', () => {
    // Remove client
    clients.delete(reqId);
    const roomSet = rooms.get(targetRoom);
    if (roomSet) {
      roomSet.delete(reqId);
      if (roomSet.size === 0) {
        rooms.delete(targetRoom);
      } else {
        broadcastToRoom(targetRoom, {
          type: 'player_left',
          senderId: reqId,
          name: reqName,
          memberCount: roomSet.size,
        });
      }
    }
  });

  ws.on('error', () => {
    try {
      ws.close();
    } catch {}
  });
});

// Periodic Heartbeat check every 30 seconds
const heartbeatInterval = setInterval(() => {
  for (const [id, client] of clients.entries()) {
    if (!client.isAlive) {
      client.ws.terminate();
      clients.delete(id);
      continue;
    }
    client.isAlive = false;
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.ping();
    }
  }
}, 30000);

wss.on('close', () => clearInterval(heartbeatInterval));

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    game: 'DREAM WORLD: 3D Open-World Adventure',
    uptimeSeconds: Math.floor(process.uptime()),
    activePlayers: clients.size,
    activeRooms: rooms.size,
    maxRoomCapacity: MAX_ROOM_CAPACITY,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/stats', (_req: Request, res: Response) => {
  const publicRoomsList: { name: string; players: number; max: number }[] = [];
  for (const [roomName, members] of rooms.entries()) {
    publicRoomsList.push({
      name: roomName,
      players: members.size,
      max: MAX_ROOM_CAPACITY,
    });
  }

  res.json({
    totalOnline: clients.size,
    rooms: publicRoomsList,
    leaderboardTop: globalLeaderboard.slice(0, 5),
  });
});

app.get('/api/leaderboard', (_req: Request, res: Response) => {
  res.json({
    leaderboard: globalLeaderboard,
    totalPlayersTracked: globalLeaderboard.length + 1200,
  });
});

app.post('/api/leaderboard', (req: Request, res: Response) => {
  const { name, level, taka, quests, uid } = req.body;
  if (!name || typeof taka !== 'number') {
    res.status(400).json({ success: false, message: 'Invalid payload: name and taka are required' });
    return;
  }

  const cleanName = String(name).trim().substring(0, 24);
  const cleanLevel = Math.max(1, Number(level) || 1);
  const cleanTaka = Math.max(0, Math.floor(Number(taka) || 0));
  const cleanQuests = Math.max(0, Math.floor(Number(quests) || 0));

  // Find existing player
  const existingIdx = globalLeaderboard.findIndex(
    (p) => (uid && p.uid === uid) || p.name.toLowerCase() === cleanName.toLowerCase()
  );

  const updatedEntry: LeaderboardPlayer = {
    uid: uid || undefined,
    name: cleanName,
    level: cleanLevel,
    taka: cleanTaka,
    quests: cleanQuests,
    isOnline: true,
    updatedAt: Date.now(),
  };

  if (existingIdx !== -1) {
    globalLeaderboard[existingIdx] = {
      ...globalLeaderboard[existingIdx],
      ...updatedEntry,
      taka: Math.max(globalLeaderboard[existingIdx].taka, cleanTaka),
      level: Math.max(globalLeaderboard[existingIdx].level, cleanLevel),
      quests: Math.max(globalLeaderboard[existingIdx].quests, cleanQuests),
    };
  } else {
    globalLeaderboard.push(updatedEntry);
  }

  // Sort descending by taka, then by level
  globalLeaderboard.sort((a, b) => b.taka - a.taka || b.level - a.level);

  // Recalculate ranks
  globalLeaderboard.forEach((p, idx) => {
    p.rank = idx + 1;
  });

  // Keep top 60
  if (globalLeaderboard.length > 60) {
    globalLeaderboard = globalLeaderboard.slice(0, 60);
  }

  saveLeaderboard();

  res.json({
    success: true,
    entry: updatedEntry,
    leaderboard: globalLeaderboard,
  });
});

// Authentication Endpoints
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '');
  const cleanName = String(displayName || '').trim().substring(0, 24) || 'Explorer';

  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    return;
  }
  if (!cleanPassword || cleanPassword.length < 6) {
    res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    return;
  }

  if (serverUsers.has(cleanEmail)) {
    res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    return;
  }

  // Generate unique UID
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randCode = '';
  for (let i = 0; i < 6; i++) randCode += chars.charAt(Math.floor(Math.random() * chars.length));
  const uid = `DW-${randCode}`;

  const record: ServerUserRecord = {
    uid,
    email: cleanEmail,
    passwordHash: Buffer.from(cleanPassword).toString('base64'),
    displayName: cleanName,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
    stats: {
      level: 1,
      taka: 500,
      questsCompleted: 0,
      distanceExploredKm: 0,
    },
  };

  serverUsers.set(cleanEmail, record);
  usersByUid.set(uid, record);
  saveUsers();

  const { passwordHash: _, ...safeAccount } = record;
  res.json({
    success: true,
    account: { ...safeAccount, isGuest: false },
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '');

  const record = serverUsers.get(cleanEmail);
  if (!record || record.passwordHash !== Buffer.from(cleanPassword).toString('base64')) {
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
    return;
  }

  record.lastLoginAt = Date.now();
  saveUsers();

  const { passwordHash: _, ...safeAccount } = record;
  res.json({
    success: true,
    account: { ...safeAccount, isGuest: false },
  });
});

app.post('/api/auth/profile', (req: Request, res: Response) => {
  const { uid, updates } = req.body;
  if (!uid || !usersByUid.has(uid)) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const record = usersByUid.get(uid)!;
  if (updates?.displayName) {
    record.displayName = String(updates.displayName).trim().substring(0, 24);
  }
  if (updates?.stats) {
    record.stats = {
      ...record.stats,
      ...updates.stats,
    };
  }

  saveUsers();

  const { passwordHash: _, ...safeAccount } = record;
  res.json({
    success: true,
    account: { ...safeAccount, isGuest: false },
  });
});

app.get('/api/auth/profile/:uid', (req: Request, res: Response) => {
  const uid = req.params.uid;
  const record = usersByUid.get(uid);
  if (!record) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const { passwordHash: _, ...safeAccount } = record;
  res.json({
    success: true,
    account: { ...safeAccount, isGuest: false },
  });
});

// Generate or validate 6-digit private room code
app.post('/api/rooms/create-private', (req: Request, res: Response) => {
  const roomName = `private_${Math.random().toString(36).substring(2, 7)}`;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  privateRoomCodes.set(code, roomName);

  res.json({
    success: true,
    room: roomName,
    code,
    expiresInMinutes: 60,
  });
});

app.post('/api/rooms/verify-code', (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code || !privateRoomCodes.has(code)) {
    res.status(404).json({ success: false, message: 'Invalid or expired room code' });
    return;
  }
  const roomName = privateRoomCodes.get(code)!;
  const members = rooms.get(roomName)?.size || 0;
  if (members >= MAX_ROOM_CAPACITY) {
    res.status(400).json({ success: false, message: 'Private room is full' });
    return;
  }
  res.json({ success: true, room: roomName, members, max: MAX_ROOM_CAPACITY });
});

// ----------------------------------------------------
// DEV MIDDLEWARE (VITE) VS PRODUCTION STATIC SERVING
// ----------------------------------------------------
async function setupServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend from dist
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`[DREAM WORLD SERVER] Listening on http://localhost:${PORT}`);
    console.log(`[DREAM WORLD WEBSOCKET] Endpoint ready at ws://localhost:${PORT}/ws/game`);
  });
}

setupServer();
