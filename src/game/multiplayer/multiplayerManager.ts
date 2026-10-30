/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CharacterRig, CharacterAppearance } from '../character/characterModel';
import { NetworkConfig } from '../config/networkConfig';

export interface RemotePlayerState {
  id: string;
  name: string;
  position: [number, number, number];
  rotationY: number;
  speed: number;
  isAirborne: boolean;
  isDriving: boolean;
  vehicleType?: string;
  appearance: CharacterAppearance;
  lastUpdate: number;
  inPrivateHome?: boolean;
  chatBubble?: { text: string; expiresAt: number };
}

export class RemotePlayerActor {
  public id: string;
  public name: string;
  public rig: CharacterRig;
  public targetPos = new THREE.Vector3();
  public targetRotY = 0;
  public currentSpeed = 0;
  public isAirborne = false;
  public isDriving = false;
  public inPrivateHome = false;
  public nametagMesh: THREE.Sprite;

  constructor(state: RemotePlayerState, scene: THREE.Scene) {
    this.id = state.id;
    this.name = state.name;
    this.inPrivateHome = !!state.inPrivateHome;
    this.rig = new CharacterRig(state.appearance);

    this.rig.group.position.set(state.position[0], state.position[1], state.position[2]);
    this.targetPos.set(state.position[0], state.position[1], state.position[2]);
    this.targetRotY = state.rotationY;

    // Create 3D floating canvas nametag
    this.nametagMesh = this.createNametagSprite(state.name);
    this.nametagMesh.position.y = 2.15;
    this.rig.group.add(this.nametagMesh);

    scene.add(this.rig.group);
  }

  private createNametagSprite(name: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Background pill
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
    ctx.roundRect(16, 12, 224, 40, 20);
    ctx.fill();

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Name text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      depthTest: false,
      transparent: true,
    });

    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.8, 0.45, 1.0);
    return sprite;
  }

  public update(delta: number) {
    // Smooth position interpolation
    this.rig.group.position.lerp(this.targetPos, 1 - Math.exp(-12 * delta));

    // Smooth rotation interpolation
    this.rig.group.rotation.y = THREE.MathUtils.damp(
      this.rig.group.rotation.y,
      this.targetRotY,
      12,
      delta,
    );

    // Update animations
    this.rig.updateAnimation(delta, this.currentSpeed, this.isAirborne, this.isDriving);
  }

  public setVisibility(visible: boolean) {
    this.rig.group.visible = visible;
  }

  public destroy(scene: THREE.Scene) {
    scene.remove(this.rig.group);
  }
}

export type MultiplayerConnectionState =
  | 'disconnected'
  | 'discovering'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed';

export class MultiplayerManager {
  public isConnected = false;
  public isOnlineMode = false;
  public connectionStatus: MultiplayerConnectionState = 'disconnected';
  public connectionMessage = 'Offline';
  public localPlayerId: string;
  public localPlayerName = 'Explorer';
  public currentRoom = 'Dhaka-Hub-1';
  public serverPlayerCount = 1;
  public latencyMs = 0;
  public locationState: 'PRIVATE_HOME' | 'SHARED_CITY' = 'PRIVATE_HOME';
  public remotePlayers: Map<string, RemotePlayerActor> = new Map();

  private scene: THREE.Scene;
  private socket: WebSocket | null = null;
  private channel: BroadcastChannel | null = null;
  private sendTimer = 0;
  private pingTimer = 0;
  private lastPingSentAt = 0;
  private reconnectTimeoutId: number | null = null;
  private retryCount = 0;
  private maxRetries = 15;
  private lastLocalState: {
    pos: THREE.Vector3;
    rotY: number;
    speed: number;
    air: boolean;
    drive: boolean;
    app: CharacterAppearance;
  } | null = null;

  public onPlayerJoined?: (name: string) => void;
  public onPlayerLeft?: (name: string) => void;
  public onChatMessage?: (sender: string, text: string) => void;
  public onConnectionChanged?: (connected: boolean, playerCount: number, message?: string) => void;
  public onVoiceSignal?: (senderId: string, signal: unknown) => void;
  public onVoiceStatus?: (senderId: string, isMuted: boolean, isSpeaking: boolean) => void;
  public onRoomJoined?: (room: string) => void;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.localPlayerId = 'p_' + Math.random().toString(36).substring(2, 9);

    const savedName = localStorage.getItem('dream_player_name');
    if (savedName) {
      this.localPlayerName = savedName;
    } else {
      const names = ['Tanvir', 'Afnan', 'Sami', 'Nafis', 'Sadia', 'Farhan', 'Rifat'];
      this.localPlayerName = names[Math.floor(Math.random() * names.length)];
      localStorage.setItem('dream_player_name', this.localPlayerName);
    }
  }

  /**
   * Starts online multiplayer, automatically connecting to the production backend
   */
  public async startOnlineMultiplayer(room?: string, playerName?: string) {
    this.isOnlineMode = true;
    if (this.reconnectTimeoutId) {
      window.clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    if (playerName) {
      this.localPlayerName = playerName;
      localStorage.setItem('dream_player_name', playerName);
    }

    // Auto-discover room with capacity if not explicitly provided or if default Hub-1
    if (!room || room === 'Dhaka-Hub-1') {
      this.connectionStatus = 'discovering';
      this.connectionMessage = 'Checking room capacity...';
      try {
        const statsUrl = NetworkConfig.getApiUrl('/api/stats');
        const res = await Promise.race([
          fetch(statsUrl),
          new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500)),
        ]);
        if (res.ok) {
          const stats = await res.json();
          if (Array.isArray(stats.rooms) && stats.rooms.length > 0) {
            // Pick first room with available capacity (< max)
            const available = stats.rooms.find(
              (r: { name: string; players: number; max: number }) => r.players < (r.max || 50)
            );
            if (available) {
              this.currentRoom = available.name;
            } else {
              this.currentRoom = `Dhaka-Hub-${stats.rooms.length + 1}`;
            }
          }
        }
      } catch {
        // Default to Dhaka-Hub-1 if stats request timed out
        this.currentRoom = 'Dhaka-Hub-1';
      }
    } else {
      this.currentRoom = room;
    }

    // Connect to WebSocket backend
    this.connectSocket();
  }

  /**
   * Connects to the WebSocket server using NetworkConfig (defaults to Render backend)
   */
  private connectSocket() {
    // 1. Initialize BroadcastChannel for same-browser multi-tab testing
    try {
      if (this.channel) {
        this.channel.close();
      }
      this.channel = new BroadcastChannel(`dream_multiplayer_${this.currentRoom}`);
      this.channel.onmessage = (event) => {
        this.handleNetworkMessage(event.data);
      };
    } catch {
      // BroadcastChannel unavailable in some environments
    }

    // 2. Open WebSocket
    try {
      if (this.socket) {
        try {
          this.socket.close();
        } catch {}
        this.socket = null;
      }

      const wsUrl = NetworkConfig.getGameWebSocketUrl({
        room: this.currentRoom,
        id: this.localPlayerId,
        name: encodeURIComponent(this.localPlayerName),
      });

      this.connectionStatus = 'connecting';
      this.connectionMessage = 'Connecting to Render backend...';
      this.onConnectionChanged?.(false, this.serverPlayerCount, this.connectionMessage);

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.retryCount = 0;
        this.connectionStatus = 'connected';
        this.connectionMessage = 'Connected to production server';
        this.broadcastJoin();
        this.serverPlayerCount = Math.max(1, this.remotePlayers.size + 1);
        this.onConnectionChanged?.(true, this.serverPlayerCount, this.connectionMessage);

        // Send initial ping immediately to measure true latency
        this.sendPing();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleNetworkMessage(data);
        } catch {}
      };

      this.socket.onclose = () => {
        const wasOpen = this.isConnected;
        this.isConnected = false;

        if (this.isOnlineMode) {
          this.connectionStatus = 'reconnecting';
          this.retryCount++;
          const delaySec = Math.min(10, 3 + this.retryCount * 2);
          this.connectionMessage = `Reconnecting in ${delaySec}s (Render free tier may take 30-40s to wake up)...`;
          this.onConnectionChanged?.(false, 1, this.connectionMessage);

          if (this.reconnectTimeoutId) window.clearTimeout(this.reconnectTimeoutId);
          this.reconnectTimeoutId = window.setTimeout(() => {
            if (this.isOnlineMode) {
              this.connectSocket();
            }
          }, delaySec * 1000);
        } else {
          this.connectionStatus = 'disconnected';
          this.connectionMessage = 'Disconnected';
          this.onConnectionChanged?.(false, 1, 'Disconnected');
        }
      };

      this.socket.onerror = () => {
        this.isConnected = false;
        if (this.isOnlineMode) {
          this.connectionStatus = 'reconnecting';
          this.connectionMessage = 'Server connecting / spinning up...';
        }
      };
    } catch (err) {
      this.isConnected = false;
      this.connectionStatus = 'failed';
      this.connectionMessage = 'Connection failed';
      this.onConnectionChanged?.(false, 1, 'Connection failed');
    }
  }

  private sendPing() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.lastPingSentAt = Date.now();
      try {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      } catch {}
    }
  }

  public stopOnlineMultiplayer() {
    this.isOnlineMode = false;
    this.isConnected = false;
    this.connectionStatus = 'disconnected';
    this.connectionMessage = 'Offline';

    if (this.reconnectTimeoutId) {
      window.clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    // Send leave message
    this.sendMessage({
      type: 'leave',
      senderId: this.localPlayerId,
      name: this.localPlayerName,
    });

    if (this.socket) {
      try {
        this.socket.close();
      } catch {}
      this.socket = null;
    }

    if (this.channel) {
      try {
        this.channel.close();
      } catch {}
      this.channel = null;
    }

    // Clear remote actors
    for (const actor of this.remotePlayers.values()) {
      actor.destroy(this.scene);
    }
    this.remotePlayers.clear();
    this.serverPlayerCount = 1;
    this.onConnectionChanged?.(false, 1, 'Offline');
  }

  private sendMessage(msg: unknown) {
    if (!this.isOnlineMode) return;
    const jsonStr = JSON.stringify(msg);

    // BroadcastChannel for local cross-tab sync
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch {}
    }

    // WebSocket to Render backend
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(jsonStr);
      } catch {}
    }
  }

  private broadcastJoin() {
    this.sendMessage({
      type: 'join',
      senderId: this.localPlayerId,
      name: this.localPlayerName,
    });
  }

  public sendChat(text: string) {
    if (!this.isOnlineMode) return;
    this.sendMessage({
      type: 'chat',
      senderId: this.localPlayerId,
      name: this.localPlayerName,
      text,
    });
    this.onChatMessage?.(this.localPlayerName, text);
  }

  public sendVoiceSignal(targetId: string | null, signal: unknown) {
    if (!this.isOnlineMode) return;
    this.sendMessage({
      type: 'voice-signal',
      senderId: this.localPlayerId,
      name: this.localPlayerName,
      targetId,
      signal,
    });
  }

  public sendVoiceStatus(isMuted: boolean, isSpeaking: boolean) {
    if (!this.isOnlineMode) return;
    this.sendMessage({
      type: 'voice-status',
      senderId: this.localPlayerId,
      name: this.localPlayerName,
      isMuted,
      isSpeaking,
    });
  }

  public getConnectedPlayersList(): { id: string; name: string; isSelf: boolean; isOnline: boolean }[] {
    const list = [
      { id: this.localPlayerId, name: `${this.localPlayerName} (You)`, isSelf: true, isOnline: true },
    ];
    for (const [id, actor] of this.remotePlayers.entries()) {
      list.push({ id, name: actor.name, isSelf: false, isOnline: true });
    }
    return list;
  }

  public sendLocalState(
    position: THREE.Vector3,
    rotationY: number,
    speed: number,
    isAirborne: boolean,
    isDriving: boolean,
    appearance: CharacterAppearance,
  ) {
    if (!this.isOnlineMode) return;

    this.lastLocalState = {
      pos: position.clone(),
      rotY: rotationY,
      speed,
      air: isAirborne,
      drive: isDriving,
      app: appearance,
    };

    this.sendMessage({
      type: 'update',
      senderId: this.localPlayerId,
      name: this.localPlayerName,
      position: [position.x, position.y, position.z],
      rotationY,
      speed,
      isAirborne,
      isDriving,
      appearance,
      inPrivateHome: this.locationState === 'PRIVATE_HOME',
      time: Date.now(),
    });
  }

  private handleNetworkMessage(data: Record<string, unknown>) {
    if (!data) return;

    // Handle Server Welcome packet
    if (data.type === 'welcome') {
      if (typeof data.room === 'string') {
        this.currentRoom = data.room;
      }
      if (typeof data.memberCount === 'number') {
        this.serverPlayerCount = data.memberCount;
      }
      this.onRoomJoined?.(this.currentRoom);

      // Populate existing room players immediately
      if (Array.isArray(data.existingPlayers)) {
        for (const p of data.existingPlayers) {
          if (p && p.id && p.id !== this.localPlayerId && !this.remotePlayers.has(p.id)) {
            const state: RemotePlayerState = {
              id: p.id,
              name: p.name || 'Explorer',
              position: p.position || [6, 0, 12],
              rotationY: p.rotationY || 0,
              speed: p.speed || 0,
              isAirborne: !!p.isAirborne,
              isDriving: !!p.isDriving,
              appearance: p.appearance as CharacterAppearance,
              inPrivateHome: !!p.inPrivateHome,
              lastUpdate: Date.now(),
            };
            const actor = new RemotePlayerActor(state, this.scene);
            this.remotePlayers.set(p.id, actor);
          }
        }
      }

      this.onConnectionChanged?.(true, this.serverPlayerCount, this.connectionMessage);
      return;
    }

    // Handle Ping Pong latency response
    if (data.type === 'pong') {
      if (this.lastPingSentAt > 0) {
        this.latencyMs = Math.max(1, Date.now() - this.lastPingSentAt);
      }
      return;
    }

    // Ignore self messages
    if (data.senderId === this.localPlayerId) return;

    const senderId = data.senderId as string;
    const name = (data.name as string) || 'Player';

    // Handle Player Join (support both server 'player_joined' and client 'join')
    if (data.type === 'player_joined' || data.type === 'join') {
      if (typeof data.memberCount === 'number') {
        this.serverPlayerCount = data.memberCount;
      } else {
        this.serverPlayerCount = this.remotePlayers.size + 1;
      }

      if (!this.remotePlayers.has(senderId)) {
        this.onPlayerJoined?.(name);
      }

      // Reply with our presence so the new player immediately sees us
      if (this.lastLocalState) {
        this.sendLocalState(
          this.lastLocalState.pos,
          this.lastLocalState.rotY,
          this.lastLocalState.speed,
          this.lastLocalState.air,
          this.lastLocalState.drive,
          this.lastLocalState.app,
        );
      }
      this.onConnectionChanged?.(this.isConnected, this.serverPlayerCount, this.connectionMessage);
      return;
    }

    // Handle Player Leave (support both server 'player_left' and client 'leave')
    if (data.type === 'player_left' || data.type === 'leave') {
      if (typeof data.memberCount === 'number') {
        this.serverPlayerCount = data.memberCount;
      } else {
        this.serverPlayerCount = Math.max(1, this.remotePlayers.size);
      }

      const actor = this.remotePlayers.get(senderId);
      if (actor) {
        actor.destroy(this.scene);
        this.remotePlayers.delete(senderId);
        this.onPlayerLeft?.(name);
        this.onConnectionChanged?.(this.isConnected, this.serverPlayerCount, this.connectionMessage);
      }
      return;
    }

    // Handle Chat
    if (data.type === 'chat') {
      this.onChatMessage?.(name, data.text as string);
      return;
    }

    // Handle Voice Signal (offer / answer / ice-candidate)
    if (data.type === 'voice-signal') {
      this.onVoiceSignal?.(senderId, data.signal);
      return;
    }

    // Handle Voice Status (isMuted / isSpeaking)
    if (data.type === 'voice-status') {
      this.onVoiceStatus?.(senderId, !!data.isMuted, !!data.isSpeaking);
      return;
    }

    // Handle Player Transform / Appearance Update
    if (data.type === 'update') {
      let actor = this.remotePlayers.get(senderId);
      if (!actor) {
        // Create new remote actor
        const state: RemotePlayerState = {
          id: senderId,
          name,
          position: data.position as [number, number, number],
          rotationY: data.rotationY as number,
          speed: data.speed as number,
          isAirborne: data.isAirborne as boolean,
          isDriving: data.isDriving as boolean,
          appearance: data.appearance as CharacterAppearance,
          inPrivateHome: !!data.inPrivateHome,
          lastUpdate: Date.now(),
        };
        actor = new RemotePlayerActor(state, this.scene);
        this.remotePlayers.set(senderId, actor);
        this.onPlayerJoined?.(name);
        this.serverPlayerCount = Math.max(this.serverPlayerCount, this.remotePlayers.size + 1);
        this.onConnectionChanged?.(this.isConnected, this.serverPlayerCount, this.connectionMessage);
      }

      // Update target transform and private home state
      const pos = data.position as [number, number, number];
      actor.targetPos.set(pos[0], pos[1], pos[2]);
      actor.targetRotY = data.rotationY as number;
      actor.currentSpeed = data.speed as number;
      actor.isAirborne = data.isAirborne as boolean;
      actor.isDriving = data.isDriving as boolean;
      actor.inPrivateHome = !!data.inPrivateHome;
    }
  }

  public update(
    delta: number,
    localPos: THREE.Vector3,
    localRotY: number,
    speed: number,
    isAirborne: boolean,
    isDriving: boolean,
    appearance: CharacterAppearance,
  ) {
    if (!this.isOnlineMode) return;

    // Send state every 60ms (~16 updates per second)
    this.sendTimer += delta;
    if (this.sendTimer >= 0.06) {
      this.sendTimer = 0;
      this.sendLocalState(localPos, localRotY, speed, isAirborne, isDriving, appearance);
    }

    // Send ping every 5 seconds for latency measurement
    this.pingTimer += delta;
    if (this.pingTimer >= 5.0) {
      this.pingTimer = 0;
      this.sendPing();
    }

    // Update all remote players and enforce private home isolation
    const isLocalInHome = this.locationState === 'PRIVATE_HOME';
    for (const actor of this.remotePlayers.values()) {
      actor.update(delta);

      // Isolation rules:
      // - Inside Private Home: local player sees NO remote players
      // - Outside in Shared City: local player sees city players, but NOT players inside private homes
      if (isLocalInHome) {
        actor.setVisibility(false);
      } else {
        actor.setVisibility(!actor.inPrivateHome);
      }
    }
  }

  public dispose() {
    this.stopOnlineMultiplayer();
  }
}
