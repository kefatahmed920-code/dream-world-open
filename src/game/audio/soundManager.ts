/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Procedural Web Audio Engine for DREAM WORLD
 * 100% synthesized in code with zero external audio file dependencies.
 */
class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;

  // Engine sound synthesis nodes
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private engineGain: GainNode | null = null;
  private isEngineRunning = false;

  // Waterfall ambient noise
  private waterfallGain: GainNode | null = null;
  private waterfallSource: AudioBufferSourceNode | null = null;

  // Rain ambient noise
  private rainGain: GainNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;

  private isMuted = false;
  private masterVolume = 0.8;
  private sfxVolume = 0.9;
  private lastFootstepTime = 0;

  constructor() {
    // Automatically unlock AudioContext on the very first user interaction (critical for Android touchscreens)
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.resume();
      };
      window.addEventListener('touchstart', unlock, { passive: true, once: true });
      window.addEventListener('touchend', unlock, { passive: true, once: true });
      window.addEventListener('pointerdown', unlock, { passive: true, once: true });
      window.addEventListener('click', unlock, { passive: true, once: true });
      window.addEventListener('keydown', unlock, { passive: true, once: true });
    }
  }

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = 0.6;
      this.ambientGain.connect(this.masterGain);

      this.setupContinuousAmbience();
    } catch {
      // Audio not supported or blocked
    }
  }

  public resume() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(val: number) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx?.currentTime || 0, 0.05);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.masterVolume, this.ctx?.currentTime || 0, 0.05);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- AMBIENCE GENERATORS ---
  private createNoiseBuffer(durationSeconds = 2): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      // Pinkish noise
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    return buffer;
  }

  private setupContinuousAmbience() {
    if (!this.ctx || !this.ambientGain) return;

    const noiseBuf = this.createNoiseBuffer(3);
    if (!noiseBuf) return;

    // Waterfall stream
    try {
      this.waterfallGain = this.ctx.createGain();
      this.waterfallGain.gain.value = 0.0;
      const wfFilter = this.ctx.createBiquadFilter();
      wfFilter.type = 'lowpass';
      wfFilter.frequency.value = 650;

      this.waterfallSource = this.ctx.createBufferSource();
      this.waterfallSource.buffer = noiseBuf;
      this.waterfallSource.loop = true;
      this.waterfallSource.connect(wfFilter);
      wfFilter.connect(this.waterfallGain);
      this.waterfallGain.connect(this.ambientGain);
      this.waterfallSource.start();
    } catch {}

    // Rain stream
    try {
      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.value = 0.0;
      const rainFilter = this.ctx.createBiquadFilter();
      rainFilter.type = 'bandpass';
      rainFilter.frequency.value = 1800;
      rainFilter.Q.value = 0.8;

      this.rainSource = this.ctx.createBufferSource();
      this.rainSource.buffer = noiseBuf;
      this.rainSource.loop = true;
      this.rainSource.connect(rainFilter);
      rainFilter.connect(this.rainGain);
      this.rainGain.connect(this.ambientGain);
      this.rainSource.start();
    } catch {}
  }

  public updateAmbience(waterfallDist: number, isRaining: boolean) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Waterfall volume: loud within 50m, fades up to 200m
    if (this.waterfallGain) {
      const wfTarget = Math.max(0, 1 - Math.min(waterfallDist / 180, 1));
      this.waterfallGain.gain.setTargetAtTime(wfTarget * 0.75, now, 0.1);
    }

    // Rain volume
    if (this.rainGain) {
      const rainTarget = isRaining ? 0.45 : 0.0;
      this.rainGain.gain.setTargetAtTime(rainTarget, now, 0.3);
    }
  }

  // --- FOOTSTEPS ---
  public playFootstep(surface: 'asphalt' | 'dirt' | 'grass' | 'wood' = 'dirt', isRunning = false) {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const minInterval = isRunning ? 0.24 : 0.38;
    if (now - this.lastFootstepTime < minInterval) return;
    this.lastFootstepTime = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    let baseFreq = 70;
    let filterFreq = 300;
    let duration = 0.08;

    if (surface === 'asphalt') {
      baseFreq = 120;
      filterFreq = 800;
      duration = 0.06;
    } else if (surface === 'wood') {
      baseFreq = 90;
      filterFreq = 500;
      duration = 0.09;
    } else if (surface === 'grass') {
      baseFreq = 60;
      filterFreq = 220;
      duration = 0.11;
    }

    // Add subtle pitch randomizer for realistic variation
    const pitchJitter = (Math.random() - 0.5) * 20;
    osc.type = surface === 'grass' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(baseFreq + pitchJitter, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, now);

    const volume = isRunning ? 0.18 : 0.11;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playJump() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.18);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  public playLand() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.15);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playLevelUp() {
    this.playQuestComplete();
  }

  // --- VEHICLE ENGINE ---
  public startVehicleEngine(vehicleType: 'cng' | 'car' | 'bike' | 'bus' | 'boat' | string) {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isEngineRunning) return;

    try {
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0.25;

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.value = vehicleType === 'cng' ? 450 : 350;

      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc2 = this.ctx.createOscillator();

      if (vehicleType === 'cng') {
        // CNG 2-stroke sputter
        this.engineOsc1.type = 'sawtooth';
        this.engineOsc1.frequency.value = 45;
        this.engineOsc2.type = 'triangle';
        this.engineOsc2.frequency.value = 90;
      } else if (vehicleType === 'bike') {
        this.engineOsc1.type = 'sawtooth';
        this.engineOsc1.frequency.value = 65;
        this.engineOsc2.type = 'square';
        this.engineOsc2.frequency.value = 130;
      } else {
        // Car V6 rumble
        this.engineOsc1.type = 'triangle';
        this.engineOsc1.frequency.value = 40;
        this.engineOsc2.type = 'sawtooth';
        this.engineOsc2.frequency.value = 80;
      }

      this.engineOsc1.connect(this.engineFilter);
      this.engineOsc2.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.sfxGain);

      this.engineOsc1.start();
      this.engineOsc2.start();
      this.isEngineRunning = true;
    } catch {}
  }

  public updateVehicleEngine(speedNormalized: number, isAccelerating: boolean) {
    if (!this.ctx || !this.isEngineRunning || !this.engineOsc1 || !this.engineOsc2 || !this.engineFilter) return;

    const now = this.ctx.currentTime;
    const basePitch = 45;
    const targetPitch = basePitch + speedNormalized * 110 + (isAccelerating ? 25 : 0);
    const filterFreq = 400 + speedNormalized * 800;

    this.engineOsc1.frequency.setTargetAtTime(targetPitch, now, 0.08);
    this.engineOsc2.frequency.setTargetAtTime(targetPitch * 2.02, now, 0.08);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.08);
  }

  public stopVehicleEngine() {
    if (!this.isEngineRunning) return;
    try {
      this.engineOsc1?.stop();
      this.engineOsc2?.stop();
      this.engineOsc1?.disconnect();
      this.engineOsc2?.disconnect();
      this.engineFilter?.disconnect();
      this.engineGain?.disconnect();
    } catch {}
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineFilter = null;
    this.engineGain = null;
    this.isEngineRunning = false;
  }

  // --- UI & GAMEPLAY SOUNDS ---
  public playDialogueChime() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Sweet pentatonic chime: G4 -> C5
    [392, 523.25].forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);

      gain.gain.setValueAtTime(0.18, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.38);
    });
  }

  public playQuestComplete() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Uplifting arpeggio: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);

      gain.gain.setValueAtTime(0.25, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.55);
    });
  }

  public playCollectItem() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playCollectCoin() {
    this.playCollectItem();
  }

  public playRadioBeep(on = true) {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(on ? 880 : 440, now);
    osc.frequency.setValueAtTime(on ? 1200 : 330, now + 0.05);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playVehicleDoor() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playUiClick() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playThunder() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const noiseBuf = this.createNoiseBuffer(2.5);
    if (!noiseBuf) return;

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 2.0);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    source.start(now);
    source.stop(now + 2.3);
  }

  // --- WATER & UNDERWATER SFX ---
  private underwaterFilterNode: BiquadFilterNode | null = null;

  public setUnderwater(underwater: boolean) {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    if (!this.underwaterFilterNode) {
      this.underwaterFilterNode = this.ctx.createBiquadFilter();
      this.underwaterFilterNode.type = 'lowpass';
      this.underwaterFilterNode.frequency.setValueAtTime(20000, now);
      // Insert in chain between sfx/ambient and master
      this.sfxGain?.disconnect();
      this.ambientGain?.disconnect();
      this.sfxGain?.connect(this.underwaterFilterNode);
      this.ambientGain?.connect(this.underwaterFilterNode);
      this.underwaterFilterNode.connect(this.masterGain);
    }

    if (underwater) {
      // Muffle high frequencies underwater (380 Hz lowpass)
      this.underwaterFilterNode.frequency.setTargetAtTime(380, now, 0.15);
    } else {
      // Restore full audio fidelity upon surfacing
      this.underwaterFilterNode.frequency.setTargetAtTime(20000, now, 0.15);
    }
  }

  public playWaterSplash() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const noiseBuf = this.createNoiseBuffer(0.65);
    if (!noiseBuf) return;

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.55);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    source.start(now);
    source.stop(now + 0.62);
  }

  public playSwimStroke() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const noiseBuf = this.createNoiseBuffer(0.35);
    if (!noiseBuf) return;

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, now);
    filter.frequency.linearRampToValueAtTime(220, now + 0.3);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    source.start(now);
    source.stop(now + 0.34);
  }

  // ==========================================
  // VILLAGE OUTDOOR MUSIC SPEAKER SYSTEM
  // ==========================================
  private villageMusicGain: GainNode | null = null;
  private villageMusicSpatialGain: GainNode | null = null;
  private villageMusicInterval: number | null = null;
  public isVillageMusicPlaying = false;
  public currentVillageTrack = 0;
  private villageMusicVolume = 0.85;

  public startVillageMusic(trackIndex = 0) {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    this.stopVillageMusic();

    this.currentVillageTrack = trackIndex;
    this.isVillageMusicPlaying = true;

    // Spatial and track master gain
    this.villageMusicGain = this.ctx.createGain();
    this.villageMusicGain.gain.value = this.villageMusicVolume;

    this.villageMusicSpatialGain = this.ctx.createGain();
    this.villageMusicSpatialGain.gain.value = 1.0;

    this.villageMusicGain.connect(this.villageMusicSpatialGain);
    this.villageMusicSpatialGain.connect(this.masterGain);

    // Track notes & scales
    // Track 0: Bamboo Flute (Raag Bhupali / Folk Pentatonic: C4, D4, E4, G4, A4, C5)
    // Track 1: Padma Folk (D4, F4, G4, A4, C5, D5)
    // Track 2: Festival Dhol (Percussive bass pulses & lively treble riffs)
    // Track 3: Countryside Acoustic (Gentle warm chord arpeggio)
    const trackScales = [
      [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33],
      [293.66, 349.23, 392.00, 440.00, 523.25, 587.33, 659.25],
      [196.00, 220.00, 261.63, 293.66, 392.00, 523.25],
      [220.00, 261.63, 329.63, 392.00, 440.00, 523.25],
    ];
    const scale = trackScales[trackIndex % trackScales.length];
    let step = 0;

    const playNote = () => {
      if (!this.ctx || !this.villageMusicGain || !this.isVillageMusicPlaying) return;
      const now = this.ctx.currentTime;
      const freq = scale[Math.floor(Math.random() * scale.length)];

      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      if (trackIndex === 0) {
        // Breathy Flute sound (sine + gentle lowpass filter)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(freq * 1.01, now + 0.35);

        noteGain.gain.setValueAtTime(0.01, now);
        noteGain.gain.linearRampToValueAtTime(0.22, now + 0.08);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        osc.connect(noteGain);
        noteGain.connect(this.villageMusicGain);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (trackIndex === 2) {
        // Festival Beat (Kick punch + bright melody bell)
        if (step % 2 === 0) {
          // Bass Kick
          const kick = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();
          kick.type = 'triangle';
          kick.frequency.setValueAtTime(140, now);
          kick.frequency.exponentialRampToValueAtTime(35, now + 0.16);
          kickGain.gain.setValueAtTime(0.4, now);
          kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          kick.connect(kickGain);
          kickGain.connect(this.villageMusicGain);
          kick.start(now);
          kick.stop(now + 0.2);
        }

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        noteGain.gain.setValueAtTime(0.12, now);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(noteGain);
        noteGain.connect(this.villageMusicGain);
        osc.start(now);
        osc.stop(now + 0.25);
      } else {
        // Acoustic Harmony
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        noteGain.gain.setValueAtTime(0.2, now);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
        osc.connect(noteGain);
        noteGain.connect(this.villageMusicGain);
        osc.start(now);
        osc.stop(now + 0.52);
      }

      step++;
    };

    const intervalMs = trackIndex === 2 ? 260 : 380;
    this.villageMusicInterval = window.setInterval(playNote, intervalMs);
  }

  public stopVillageMusic() {
    this.isVillageMusicPlaying = false;
    if (this.villageMusicInterval) {
      clearInterval(this.villageMusicInterval);
      this.villageMusicInterval = null;
    }
    if (this.villageMusicGain && this.ctx) {
      try {
        this.villageMusicGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      } catch {}
    }
  }

  public setVillageMusicVolume(vol: number) {
    this.villageMusicVolume = Math.max(0, Math.min(1, vol));
    if (this.villageMusicGain && this.ctx) {
      this.villageMusicGain.gain.setValueAtTime(this.villageMusicVolume, this.ctx.currentTime);
    }
  }

  public updateVillageMusicSpatial(playerDistToSpeaker: number) {
    if (!this.villageMusicSpatialGain || !this.ctx || !this.isVillageMusicPlaying) return;
    // Full volume within 16m of speaker, smoothly drops to 0 at 55m
    let atten = 1.0;
    if (playerDistToSpeaker > 16) {
      atten = Math.max(0, 1.0 - (playerDistToSpeaker - 16) / 39);
    }
    this.villageMusicSpatialGain.gain.setTargetAtTime(atten, this.ctx.currentTime, 0.1);
  }
}

export const soundManager = new SoundManager();
