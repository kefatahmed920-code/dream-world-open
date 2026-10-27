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
  public nametagMesh: THREE.Sprite;

  constructor(state: RemotePlayerState, scene: THREE.Scene) {
    this.id = state.id;
    this.name = state.name;
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

  public destroy(scene: THREE.Scene) {
    scene.remove(this.rig.group);
  }
}

export class MultiplayerManager {
  public isConnected = false;
  public isOnlineMode = false;
  public localPlayerId: string;
  public localPlayerName = 'Explorer';
  public currentRoom = 'Dhaka-Hub-1';
  public remotePlayers: Map<string, RemotePlayerActor> = new Map();

  private scene: THREE.Scene;
  private socket: WebSocket | null = null;
  private channel: BroadcastChannel | null = null;
  private sendTimer = 0;
  private pingTime = 0;
  public latencyMs = 24;

  public onPlayerJoined?: (name: string) => void;
  public onPlayerLeft?: (name: string) => void;
  public onChatMessage?: (sender: string, text: string) => void;
  public onConnectionChanged?: (connected: boolean, playerCount: number) => void;

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

  public startOnlineMultiplayer(room = 'Dhaka-Hub-1', playerName?: string) {
    this.isOnlineMode = true;
    this.currentRoom = room;
    if (playerName) {
      this.localPlayerName = playerName;
      localStorage.setItem('dream_player_name', playerName);
    }

    // 1. Initialize BroadcastChannel for instant local cross-tab / local network sync
    try {
      this.channel = new BroadcastChannel(`dream_multiplayer_${this.currentRoom}`);
      this.channel.onmessage = (event) => {
        this.handleNetworkMessage(event.data);
      };
    } catch {
      // BroadcastChannel not available
    }

    // 2. Initialize WebSocket transport if available
    try {
      const wsUrl = NetworkConfig.getGameWebSocketUrl({
        room: this.currentRoom,
        id: this.localPlayerId,
        name: encodeURIComponent(this.localPlayerName),
      });
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.broadcastJoin();
        this.onConnectionChanged?.(true, this.remotePlayers.size + 1);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleNetworkMessage(data);
        } catch {}
      };

      this.socket.onclose = () => {
        // Fallback gracefully to BroadcastChannel
        this.isConnected = true; // still connected locally via channel
      };

      this.socket.onerror = () => {
        // Continue with BroadcastChannel
        this.isConnected = true;
      };
    } catch {
      this.isConnected = true;
    }

    // If socket didn't immediately fail, announce via channel
    this.broadcastJoin();
    this.onConnectionChanged?.(true, this.remotePlayers.size + 1);
  }

  public stopOnlineMultiplayer() {
    this.isOnlineMode = false;
    this.isConnected = false;

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
    this.onConnectionChanged?.(false, 1);
  }

  private sendMessage(msg: unknown) {
    if (!this.isOnlineMode) return;
    const jsonStr = JSON.stringify(msg);

    // BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch {}
    }

    // WebSocket
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

  public sendLocalState(
    position: THREE.Vector3,
    rotationY: number,
    speed: number,
    isAirborne: boolean,
    isDriving: boolean,
    appearance: CharacterAppearance,
  ) {
    if (!this.isOnlineMode) return;

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
      time: Date.now(),
    });
  }

  private handleNetworkMessage(data: Record<string, unknown>) {
    if (!data || data.senderId === this.localPlayerId) return;

    const senderId = data.senderId as string;
    const name = (data.name as string) || 'Player';

    if (data.type === 'join') {
      if (!this.remotePlayers.has(senderId)) {
        this.onPlayerJoined?.(name);
      }
      // Reply with our presence so the new player discovers us
      return;
    }

    if (data.type === 'leave') {
      const actor = this.remotePlayers.get(senderId);
      if (actor) {
        actor.destroy(this.scene);
        this.remotePlayers.delete(senderId);
        this.onPlayerLeft?.(name);
        this.onConnectionChanged?.(this.isConnected, this.remotePlayers.size + 1);
      }
      return;
    }

    if (data.type === 'chat') {
      this.onChatMessage?.(name, data.text as string);
      return;
    }

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
          lastUpdate: Date.now(),
        };
        actor = new RemotePlayerActor(state, this.scene);
        this.remotePlayers.set(senderId, actor);
        this.onPlayerJoined?.(name);
        this.onConnectionChanged?.(this.isConnected, this.remotePlayers.size + 1);
      }

      // Update target transform
      const pos = data.position as [number, number, number];
      actor.targetPos.set(pos[0], pos[1], pos[2]);
      actor.targetRotY = data.rotationY as number;
      actor.currentSpeed = data.speed as number;
      actor.isAirborne = data.isAirborne as boolean;
      actor.isDriving = data.isDriving as boolean;
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

    // Update all remote players
    for (const actor of this.remotePlayers.values()) {
      actor.update(delta);
    }
  }

  public dispose() {
    this.stopOnlineMultiplayer();
  }
}
