/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MultiplayerManager } from './multiplayerManager';
import { soundManager } from '../audio/soundManager';

interface VoicePeer {
  connection: RTCPeerConnection;
  audioElement: HTMLAudioElement;
  remoteStream: MediaStream;
}

export type VoiceConnectionState = 'idle' | 'requesting' | 'connected' | 'error';

export class VoiceChatManager {
  public isVoiceEnabled = false;
  public isMuted = false;
  public isDeafened = false;
  public connectionState: VoiceConnectionState = 'idle';
  public errorMessage: string | null = null;
  public activeSpeakers = new Set<string>();

  private mpManager: MultiplayerManager;
  private localStream: MediaStream | null = null;
  private peers = new Map<string, VoicePeer>();
  private audioContainer: HTMLDivElement | null = null;
  private analyser: AnalyserNode | null = null;
  private audioCtx: AudioContext | null = null;
  private speechCheckInterval: number | null = null;

  // Callbacks for UI updates
  public onStateChanged?: (state: {
    enabled: boolean;
    muted: boolean;
    deafened: boolean;
    connectionState: VoiceConnectionState;
    speakers: string[];
    error: string | null;
  }) => void;

  constructor(mpManager: MultiplayerManager) {
    this.mpManager = mpManager;

    // Listen to signaling from multiplayer manager
    this.mpManager.onVoiceSignal = (senderId, signal) => {
      this.handleIncomingSignal(senderId, signal);
    };

    this.mpManager.onVoiceStatus = (senderId, isMuted, isSpeaking) => {
      if (isSpeaking) {
        this.activeSpeakers.add(senderId);
      } else {
        this.activeSpeakers.delete(senderId);
      }
      this.notifyState();
    };

    // When remote player joins, if our voice is active, initiate WebRTC connection
    const originalPlayerJoined = this.mpManager.onPlayerJoined;
    this.mpManager.onPlayerJoined = (name) => {
      originalPlayerJoined?.(name);
      // Wait a moment for actor to initialize, then check if we should create offer
      if (this.isVoiceEnabled && this.localStream) {
        for (const [id] of this.mpManager.remotePlayers.entries()) {
          if (!this.peers.has(id)) {
            this.connectToPeer(id, true);
          }
        }
      }
    };

    // When remote player leaves, cleanup their WebRTC connection
    const originalPlayerLeft = this.mpManager.onPlayerLeft;
    this.mpManager.onPlayerLeft = (name) => {
      originalPlayerLeft?.(name);
      // Clean up any disconnected peers
      for (const [id] of this.peers.entries()) {
        if (!this.mpManager.remotePlayers.has(id)) {
          this.removePeer(id);
        }
      }
    };
  }

  private notifyState() {
    this.onStateChanged?.({
      enabled: this.isVoiceEnabled,
      muted: this.isMuted,
      deafened: this.isDeafened,
      connectionState: this.connectionState,
      speakers: Array.from(this.activeSpeakers),
      error: this.errorMessage,
    });
  }

  /**
   * Request microphone and enable room voice chat
   */
  public async enableVoiceChat(): Promise<boolean> {
    if (this.isVoiceEnabled && this.localStream) return true;

    this.connectionState = 'requesting';
    this.errorMessage = null;
    this.notifyState();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC Voice Chat is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      this.localStream = stream;
      this.isVoiceEnabled = true;
      this.isMuted = false;
      this.connectionState = 'connected';
      soundManager.playRadioBeep(true);

      // Start speaking activity detector
      this.startSpeechDetector(stream);

      // Connect to all existing room players
      for (const [id] of this.mpManager.remotePlayers.entries()) {
        this.connectToPeer(id, true);
      }

      this.notifyState();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Microphone permission denied';
      this.connectionState = 'error';
      this.errorMessage = msg.includes('Permission') ? 'Microphone access was denied in browser' : msg;
      this.isVoiceEnabled = false;
      this.notifyState();
      return false;
    }
  }

  /**
   * Cleanly stop microphone and disconnect voice WebRTC
   */
  public disableVoiceChat() {
    if (!this.isVoiceEnabled && !this.localStream) return;

    soundManager.playRadioBeep(false);

    if (this.speechCheckInterval) {
      clearInterval(this.speechCheckInterval);
      this.speechCheckInterval = null;
    }

    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch {}
      this.audioCtx = null;
      this.analyser = null;
    }

    // Stop local audio tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }

    // Close all peer connections
    for (const [id] of this.peers.entries()) {
      this.removePeer(id);
    }

    this.isVoiceEnabled = false;
    this.isMuted = false;
    this.connectionState = 'idle';
    this.errorMessage = null;
    this.activeSpeakers.clear();
    this.mpManager.sendVoiceStatus(true, false);
    this.notifyState();
  }

  /**
   * Toggle local microphone mute
   */
  public toggleMute(): boolean {
    if (!this.isVoiceEnabled || !this.localStream) return false;
    this.isMuted = !this.isMuted;
    this.localStream.getAudioTracks().forEach((track) => {
      track.enabled = !this.isMuted;
    });

    soundManager.playRadioBeep(!this.isMuted);
    this.mpManager.sendVoiceStatus(this.isMuted, false);
    this.notifyState();
    return this.isMuted;
  }

  /**
   * Toggle deafening (mute all remote voices)
   */
  public toggleDeafen(): boolean {
    this.isDeafened = !this.isDeafened;
    for (const peer of this.peers.values()) {
      peer.audioElement.muted = this.isDeafened;
    }
    soundManager.playUiClick();
    this.notifyState();
    return this.isDeafened;
  }

  private createPeerConnection(peerId: string): RTCPeerConnection {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(config);

    // Add local audio tracks if microphone is active
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Send local ICE candidates to remote peer via WebSocket
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.mpManager.sendVoiceSignal(peerId, {
          type: 'candidate',
          candidate: event.candidate.toJSON(),
        });
      }
    };

    // When remote audio track arrives, attach to audio element
    const remoteStream = new MediaStream();
    const audioEl = document.createElement('audio');
    audioEl.autoplay = true;
    audioEl.muted = this.isDeafened;
    audioEl.srcObject = remoteStream;

    pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((t) => remoteStream.addTrack(t));
    };

    this.getAudioContainer().appendChild(audioEl);
    this.peers.set(peerId, { connection: pc, audioElement: audioEl, remoteStream });

    return pc;
  }

  private async connectToPeer(peerId: string, isInitiator = false) {
    if (this.peers.has(peerId)) return;
    const pc = this.createPeerConnection(peerId);

    if (isInitiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        this.mpManager.sendVoiceSignal(peerId, {
          type: 'offer',
          sdp: offer.sdp,
        });
      } catch (err) {
        console.warn('Voice chat offer creation failed for peer', peerId, err);
      }
    }
  }

  private async handleIncomingSignal(senderId: string, signal: unknown) {
    if (!this.isVoiceEnabled || !signal) return;
    const sig = signal as Record<string, unknown>;

    try {
      let peer = this.peers.get(senderId);

      if (sig.type === 'offer') {
        if (!peer) {
          const pc = this.createPeerConnection(senderId);
          peer = this.peers.get(senderId);
          if (!peer) return;
        }

        const pc = peer.connection;
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: sig.sdp as string }));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        this.mpManager.sendVoiceSignal(senderId, {
          type: 'answer',
          sdp: answer.sdp,
        });
      } else if (sig.type === 'answer') {
        if (peer) {
          await peer.connection.setRemoteDescription(
            new RTCSessionDescription({ type: 'answer', sdp: sig.sdp as string }),
          );
        }
      } else if (sig.type === 'candidate') {
        if (peer && sig.candidate) {
          await peer.connection.addIceCandidate(new RTCIceCandidate(sig.candidate as RTCIceCandidateInit));
        }
      }
    } catch (err) {
      console.warn('Error handling voice signal from peer', senderId, err);
    }
  }

  private removePeer(peerId: string) {
    const peer = this.peers.get(peerId);
    if (!peer) return;

    try {
      peer.connection.close();
      peer.audioElement.srcObject = null;
      peer.audioElement.remove();
    } catch {}

    this.peers.delete(peerId);
    this.activeSpeakers.delete(peerId);
    this.notifyState();
  }

  private getAudioContainer(): HTMLDivElement {
    if (!this.audioContainer) {
      this.audioContainer = document.createElement('div');
      this.audioContainer.id = 'dream-voice-audio-container';
      this.audioContainer.style.display = 'none';
      document.body.appendChild(this.audioContainer);
    }
    return this.audioContainer;
  }

  private startSpeechDetector(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
      const source = this.audioCtx.createMediaStreamSource(stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      let wasSpeaking = false;

      this.speechCheckInterval = window.setInterval(() => {
        if (!this.analyser || this.isMuted) {
          if (wasSpeaking) {
            wasSpeaking = false;
            this.mpManager.sendVoiceStatus(this.isMuted, false);
          }
          return;
        }

        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const isSpeaking = avg > 28;

        if (isSpeaking !== wasSpeaking) {
          wasSpeaking = isSpeaking;
          this.mpManager.sendVoiceStatus(this.isMuted, isSpeaking);
          if (isSpeaking) {
            this.activeSpeakers.add(this.mpManager.localPlayerId);
          } else {
            this.activeSpeakers.delete(this.mpManager.localPlayerId);
          }
          this.notifyState();
        }
      }, 150);
    } catch {}
  }
}
