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
    // Initialized on first user interaction to comply with browser autoplay policy
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

  // --- VEHICLE ENGINE ---
  public startVehicleEngine(vehicleType: 'cng' | 'car' | 'bike') {
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
}

export const soundManager = new SoundManager();
