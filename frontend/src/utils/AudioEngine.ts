"use client";

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private initialized: boolean = false;

  // Active hum nodes
  private reactorHumNode: OscillatorNode | null = null;
  private reactorHumGain: GainNode | null = null;
  private spaceAmbienceNode: AudioWorkletNode | ScriptProcessorNode | null = null;
  private spaceAmbienceGain: GainNode | null = null;
  private radioChatterNode: ScriptProcessorNode | null = null;
  private radioChatterGain: GainNode | null = null;

  constructor() {
    // Lazy initialization on user click/scroll interaction to satisfy browser policies
  }

  public init() {
    if (this.initialized || typeof window === "undefined") return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);

      this.initialized = true;
      console.log("COS Audio Engine initialized successfully.");
    } catch (e) {
      console.error("Failed to initialize AudioContext:", e);
    }
  }

  private resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  public getMuteState(): boolean {
    return this.isMuted;
  }

  // 1. High-frequency sine tick for hover feedbacks
  public playHoverTick() {
    this.init();
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = "sine";
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.03);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  // 2. Mid-frequency tick chime for selections
  public playClickChime() {
    this.init();
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.25);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  // 3. Reactor Humming Sound (Varies dynamically with distance parameters)
  public startReactorHum() {
    this.init();
    this.resume();
    if (!this.ctx || !this.masterGain || this.reactorHumNode) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    this.reactorHumGain = this.ctx.createGain();
    this.reactorHumGain.gain.setValueAtTime(0.03, this.ctx.currentTime);

    // LFO to modulate oscillator frequency slightly (for mechanical vibration)
    lfo.frequency.value = 0.25; // 0.25Hz cycle
    lfoGain.gain.value = 1.5;

    osc1.frequency.setValueAtTime(60, this.ctx.currentTime);
    osc2.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc1.type = "sine";
    osc2.type = "triangle";

    filter.type = "lowpass";
    filter.frequency.value = 150;

    // Connect modulators
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(this.reactorHumGain);
    this.reactorHumGain.connect(this.masterGain);

    lfo.start();
    osc1.start();
    osc2.start();

    this.reactorHumNode = osc1; // reference node for cleanup
    
    // Store links on node for complete disposal
    (this.reactorHumNode as any).extraNodes = [osc2, lfo, lfoGain, filter, this.reactorHumGain];
  }

  // Control reactor hum intensity based on ship proximity
  public updateReactorHumIntensity(intensity: number) {
    if (!this.ctx || !this.reactorHumGain || this.isMuted) return;
    const clamped = Math.max(0.02, Math.min(0.2, intensity * 0.15));
    this.reactorHumGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.3);
  }

  // 4. Sweeping bandpass warp gate activation sirens
  public playWarpChargeSweep() {
    this.init();
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(680, this.ctx.currentTime + 3.0);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(100, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 3.0);
    filter.Q.value = 5.0;

    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 2.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.1);

    osc.start();
    osc.stop(this.ctx.currentTime + 3.2);
  }

  // 5. Ambient White Noise Space Ambience
  public startSpaceAmbience() {
    this.init();
    this.resume();
    if (!this.ctx || !this.masterGain || this.spaceAmbienceNode) return;

    const bufferSize = 4 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Fill buffer with brownian noise (deep spaceship hum)
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Compensate loss
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 85;

    this.spaceAmbienceGain = this.ctx.createGain();
    this.spaceAmbienceGain.gain.setValueAtTime(0.24, this.ctx.currentTime);

    noiseNode.connect(filter);
    filter.connect(this.spaceAmbienceGain);
    this.spaceAmbienceGain.connect(this.masterGain);

    noiseNode.start();
    this.spaceAmbienceNode = noiseNode as any;
    (this.spaceAmbienceNode as any).extraNodes = [filter, this.spaceAmbienceGain];
  }

  // 6. Radio Telemetry Static Chatter (Occurs dynamically)
  public playRadioChatterBurst() {
    this.init();
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Create a 0.6-second burst of static-filtered radio noise
    const bufferSize = 0.6 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1600;
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.55);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noiseNode.start();
    noiseNode.stop(this.ctx.currentTime + 0.65);
  }

  // 7. Sweeping frequency alarm siren during Emergency events
  public playEmergencyAlarm() {
    this.init();
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);

    lfo.type = "sine";
    lfo.frequency.value = 3.5; // oscillation rate
    lfoGain.gain.value = 80;   // sweeping range

    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.8);

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.connect(gain);
    gain.connect(this.masterGain);

    lfo.start();
    osc.start();

    lfo.stop(this.ctx.currentTime + 2.9);
    osc.stop(this.ctx.currentTime + 2.9);
  }

  // Clean and stop loops on exit
  public shutdown() {
    if (this.reactorHumNode) {
      this.reactorHumNode.stop();
      if ((this.reactorHumNode as any).extraNodes) {
        (this.reactorHumNode as any).extraNodes.forEach((node: any) => {
          if (node.stop) node.stop();
          node.disconnect();
        });
      }
      this.reactorHumNode.disconnect();
      this.reactorHumNode = null;
    }

    if (this.spaceAmbienceNode) {
      (this.spaceAmbienceNode as any).stop();
      if ((this.spaceAmbienceNode as any).extraNodes) {
        (this.spaceAmbienceNode as any).extraNodes.forEach((node: any) => {
          node.disconnect();
        });
      }
      this.spaceAmbienceNode.disconnect();
      this.spaceAmbienceNode = null;
    }

    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.initialized = false;
  }
}

export const cosAudio = new AudioEngine();
