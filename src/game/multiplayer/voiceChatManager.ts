/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MultiplayerManager } from './multiplayerManager';
import { soundManager } from '../audio/soundManager';

interface VoicePeer {
  id: string;
  connection: RTCPeerConnection;
  audioElement: HTMLAudioElement;
  remoteStream: MediaStream;
}

export type VoiceConnectionState = 'idle' | 'listening' | 'transmitting' | 'error';

export interface VoiceChatState {
  enabled: boolean;
  muted: boolean;
  deafened: boolean;
  isSpeakerEnabled: boolean;
  isDeafened: boolean;
  isMicActive: boolean;
  isMicMuted: boolean;
  connectionState: VoiceConnectionState;
  speakers: string[];
  activeSpeakers: string[];
  autoplayBlocked: boolean;
  error: string | null;
  errorMessage: string | null;
}

export class VoiceChatManager {
  // Speaker / Listening State (Independent of microphone)
  public isSpeakerEnabled = true;
  public isDeafened = false;

  // Microphone / Transmitting State (Independent of speaker)
  public isMicActive = false;
  public isMicMuted = false;

  public connectionState: VoiceConnectionState = 'idle';
  public errorMessage: string | null = null;
  public activeSpeakers = new Set<string>();
  public autoplayBlocked = false;

  private mpManager: MultiplayerManager;
  private localStream: MediaStream | null = null;
  private peers = new Map<string, VoicePeer>();
  private audioContainer: HTMLDivElement | null = null;
  private analyser: AnalyserNode | null = null;
  private audioCtx: AudioContext | null = null;
  private speechCheckInterval: number | null = null;
  private userGestureUnlocked = false;

  // Callbacks for React HUD
  public onStateChanged?: (state: VoiceChatState) => void;

  constructor(mpManager: MultiplayerManager) {
    this.mpManager = mpManager;

    // Listen to signaling from multiplayer manager
    this.mpManager.onVoiceSignal = (senderId, signal) => {
      this.handleIncomingSignal(senderId, signal);
    };

    this.mpManager.onVoiceStatus = (senderId, isMuted, isSpeaking) => {
      if (isSpeaking && !isMuted) {
        this.activeSpeakers.add(senderId);
      } else {
        this.activeSpeakers.delete(senderId);
      }
      this.notifyState();
    };

    // When a remote player joins the room, establish connection
    const originalPlayerJoined = this.mpManager.onPlayerJoined;
    this.mpManager.onPlayerJoined = (name) => {
      originalPlayerJoined?.(name);
      // Connect to any new peers (initiator if our ID is lexicographically greater)
      for (const [id] of this.mpManager.remotePlayers.entries()) {
        if (!this.peers.has(id)) {
          const isInitiator = this.mpManager.localPlayerId > id;
          this.connectToPeer(id, isInitiator);
        }
      }
    };

    // When remote player leaves, cleanup their WebRTC connection
    const originalPlayerLeft = this.mpManager.onPlayerLeft;
    this.mpManager.onPlayerLeft = (name) => {
      originalPlayerLeft?.(name);
      for (const [id] of this.peers.entries()) {
        if (!this.mpManager.remotePlayers.has(id)) {
          this.removePeer(id);
        }
      }
    };

    // Attach global user gesture listener to automatically unlock audio on mobile / Android
    this.setupAutoplayUnlock();
  }

  /**
   * Set up global user-gesture audio unlock for Android / iOS browser autoplay restrictions
   */
  private setupAutoplayUnlock() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      if (this.userGestureUnlocked) return;
      this.userGestureUnlocked = true;
      this.unlockAudio();

      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('touchend', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('touchend', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }

  /**
   * Resume AudioContext and play all peer audio elements
   */
  public unlockAudio() {
    this.autoplayBlocked = false;
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    for (const peer of this.peers.values()) {
      if (!this.isDeafened) {
        peer.audioElement.muted = false;
        peer.audioElement.play().catch((err) => {
          if (err.name === 'NotAllowedError') {
            this.autoplayBlocked = true;
          }
        });
      }
    }
    this.notifyState();
  }

  private notifyState() {
    this.onStateChanged?.({
      enabled: this.isSpeakerEnabled || this.isMicActive,
      muted: this.isMicMuted,
      deafened: this.isDeafened,
      isSpeakerEnabled: this.isSpeakerEnabled,
      isDeafened: this.isDeafened,
      isMicActive: this.isMicActive,
      isMicMuted: this.isMicMuted,
      connectionState: this.connectionState,
      speakers: Array.from(this.activeSpeakers),
      activeSpeakers: Array.from(this.activeSpeakers),
      autoplayBlocked: this.autoplayBlocked,
      error: this.errorMessage,
      errorMessage: this.errorMessage,
    });
  }

  // Backwards compatibility aliases
  public get isVoiceEnabled(): boolean {
    return this.isSpeakerEnabled || this.isMicActive;
  }
  public get isMuted(): boolean {
    return this.isMicMuted;
  }
  public enableVoiceChat(): Promise<boolean> {
    return this.enableMicrophone();
  }
  public disableVoiceChat(): void {
    this.disableMicrophone();
  }
  public toggleMute(): boolean {
    return this.toggleMicMute();
  }
  public toggleDeafen(): boolean {
    return this.toggleSpeakerDeafen();
  }

  /**
   * Initialize listening on room join (called automatically when entering room)
   */
  public initRoomListening() {
    this.connectionState = this.isMicActive ? 'transmitting' : 'listening';
    // Connect to all existing remote players in the room
    for (const [id] of this.mpManager.remotePlayers.entries()) {
      if (!this.peers.has(id)) {
        const isInitiator = this.mpManager.localPlayerId > id;
        this.connectToPeer(id, isInitiator);
      }
    }
    this.notifyState();
  }

  /**
   * Toggle local microphone (outgoing voice only).
   * Does NOT affect incoming speaker audio!
   */
  public async toggleMicrophone(): Promise<boolean> {
    if (!this.isMicActive) {
      return await this.enableMicrophone();
    } else {
      // Toggle mute/unmute
      return this.toggleMicMute();
    }
  }

  /**
   * Request microphone permission and activate outgoing transmission
   */
  public async enableMicrophone(): Promise<boolean> {
    this.errorMessage = null;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC microphone not supported on this browser.');
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
      this.isMicActive = true;
      this.isMicMuted = false;
      this.connectionState = 'transmitting';
      soundManager.playRadioBeep(true);

      const audioTrack = stream.getAudioTracks()[0];

      // Add or replace track on all existing peer connections
      for (const peer of this.peers.values()) {
        const sender = peer.connection.getSenders().find((s) => s.track?.kind === 'audio' || s.track === null);
        if (sender) {
          sender.replaceTrack(audioTrack).catch(() => {});
        } else {
          try {
            peer.connection.addTrack(audioTrack, stream);
            // Trigger renegotiation offer
            this.renegotiatePeer(peer);
          } catch {}
        }
      }

      // Start speech activity detector
      this.startSpeechDetector(stream);

      // Notify room that our mic is unmuted
      this.mpManager.sendVoiceStatus(false, false);
      this.notifyState();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Microphone access denied';
      this.isMicActive = false;
      this.connectionState = 'listening';
      this.errorMessage = msg.includes('Permission') || msg.includes('denied')
        ? 'Microphone permission was denied. You can still listen to other players!'
        : msg;
      this.notifyState();
      return false;
    }
  }

  /**
   * Completely shut down microphone track without interrupting incoming audio
   */
  public disableMicrophone() {
    if (!this.isMicActive && !this.localStream) return;

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

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }

    // Replace track with null on all peers so transmission stops
    for (const peer of this.peers.values()) {
      const sender = peer.connection.getSenders().find((s) => s.track?.kind === 'audio');
      if (sender) {
        sender.replaceTrack(null).catch(() => {});
      }
    }

    this.isMicActive = false;
    this.isMicMuted = false;
    this.activeSpeakers.delete(this.mpManager.localPlayerId);
    this.connectionState = 'listening';
    this.mpManager.sendVoiceStatus(true, false);
    this.notifyState();
  }

  /**
   * Toggle mute on active microphone (outgoing audio only)
   */
  public toggleMicMute(): boolean {
    if (!this.isMicActive || !this.localStream) {
      return false;
    }

    this.isMicMuted = !this.isMicMuted;
    this.localStream.getAudioTracks().forEach((track) => {
      track.enabled = !this.isMicMuted;
    });

    soundManager.playRadioBeep(!this.isMicMuted);

    if (this.isMicMuted) {
      this.activeSpeakers.delete(this.mpManager.localPlayerId);
    }
    this.mpManager.sendVoiceStatus(this.isMicMuted, false);
    this.notifyState();
    return this.isMicMuted;
  }

  /**
   * Toggle speaker / deafen (incoming audio only).
   * Controls whether you hear other players. Does NOT mute your microphone!
   */
  public toggleSpeakerDeafen(): boolean {
    this.isDeafened = !this.isDeafened;
    this.isSpeakerEnabled = !this.isDeafened;

    for (const peer of this.peers.values()) {
      peer.audioElement.muted = this.isDeafened;
    }

    soundManager.playUiClick();
    this.notifyState();
    return this.isDeafened;
  }

  /**
   * Create an RTCPeerConnection configured to receive remote audio,
   * with transceiver direction 'sendrecv' if mic is active, or 'recvonly' if mic is off.
   */
  private createPeerConnection(peerId: string): RTCPeerConnection {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(config);

    // If local stream exists, add track; otherwise add transceiver so incoming audio is always accepted
    if (this.localStream && this.isMicActive) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        pc.addTrack(audioTrack, this.localStream);
      }
    } else {
      pc.addTransceiver('audio', { direction: 'recvonly' });
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

    // When remote audio track arrives, attach to audio element and play
    const remoteStream = new MediaStream();
    const audioEl = document.createElement('audio');
    audioEl.autoplay = true;
    audioEl.muted = this.isDeafened;
    audioEl.setAttribute('playsinline', 'true');
    audioEl.srcObject = remoteStream;

    pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((t) => remoteStream.addTrack(t));
      if (!this.isDeafened) {
        audioEl.muted = false;
        audioEl.play().catch((err) => {
          if (err.name === 'NotAllowedError') {
            this.autoplayBlocked = true;
            this.notifyState();
          }
        });
      }
    };

    this.getAudioContainer().appendChild(audioEl);
    this.peers.set(peerId, { id: peerId, connection: pc, audioElement: audioEl, remoteStream });

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

  private async renegotiatePeer(peer: VoicePeer) {
    try {
      const offer = await peer.connection.createOffer();
      await peer.connection.setLocalDescription(offer);
      this.mpManager.sendVoiceSignal(peer.id, {
        type: 'offer',
        sdp: offer.sdp,
      });
    } catch (err) {
      console.warn('Renegotiation failed for peer', peer.id, err);
    }
  }

  /**
   * Handle incoming WebRTC signaling (offer, answer, candidate).
   * Accepts offers EVEN IF local microphone is not enabled!
   */
  private async handleIncomingSignal(senderId: string, signal: unknown) {
    if (!signal) return;
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
        if (peer && peer.connection.signalingState !== 'stable') {
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
        if (!this.analyser || this.isMicMuted || !this.isMicActive) {
          if (wasSpeaking) {
            wasSpeaking = false;
            this.mpManager.sendVoiceStatus(this.isMicMuted, false);
            this.activeSpeakers.delete(this.mpManager.localPlayerId);
            this.notifyState();
          }
          return;
        }

        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const isSpeaking = avg > 26;

        if (isSpeaking !== wasSpeaking) {
          wasSpeaking = isSpeaking;
          this.mpManager.sendVoiceStatus(this.isMicMuted, isSpeaking);
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

  public dispose() {
    this.disableMicrophone();
    for (const [id] of this.peers.entries()) {
      this.removePeer(id);
    }
  }
}
