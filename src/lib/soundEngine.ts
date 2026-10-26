/**
 * Procedural tactile soundscape built on the Web Audio API.
 * Every cue is synthesised from filtered noise or short oscillators — no audio files.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let enabled = false;

function ensureContext() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);

    // Two seconds of pink-ish noise (Paul Kellet's economy filter).
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.18;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
  if (value) ensureContext();
}

type NoiseOpts = {
  duration: number;
  filter: BiquadFilterType;
  frequency: number;
  frequencyEnd?: number;
  q?: number;
  gain: number;
  attack?: number;
  delay?: number;
};

function noiseBurst({ duration, filter, frequency, frequencyEnd, q = 0.8, gain, attack = 0.015, delay = 0 }: NoiseOpts) {
  const c = ensureContext();
  if (!c || !master || !noiseBuffer) return;
  const t0 = c.currentTime + delay;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer;
  src.playbackRate.value = 0.9 + Math.random() * 0.2;

  const biquad = c.createBiquadFilter();
  biquad.type = filter;
  biquad.Q.value = q;
  biquad.frequency.setValueAtTime(frequency, t0);
  if (frequencyEnd) biquad.frequency.exponentialRampToValueAtTime(frequencyEnd, t0 + duration);

  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  src.connect(biquad).connect(env).connect(master);
  src.start(t0, Math.random() * 1.2, duration + 0.05);
}

function tone(freq: number, duration: number, gain: number, type: OscillatorType = "sine", delay = 0) {
  const c = ensureContext();
  if (!c || !master) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.92, t0 + duration);
  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + 0.002);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(env).connect(master);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

let lastBrush = 0;

export const sound = {
  /** Soft linen brush — for hovering swatches and textile surfaces. */
  linenBrush() {
    if (!enabled) return;
    const now = performance.now();
    if (now - lastBrush < 90) return;
    lastBrush = now;
    noiseBurst({ duration: 0.14, filter: "bandpass", frequency: 2600, frequencyEnd: 1800, q: 0.7, gain: 0.05, attack: 0.03 });
  },
  /** Khadi rustle — when a fabric sleeve slides off and on. */
  fabricRustle() {
    if (!enabled) return;
    noiseBurst({ duration: 0.32, filter: "lowpass", frequency: 1800, frequencyEnd: 700, q: 0.5, gain: 0.12, attack: 0.06 });
    noiseBurst({ duration: 0.22, filter: "bandpass", frequency: 3200, frequencyEnd: 2200, q: 1.2, gain: 0.04, attack: 0.04, delay: 0.12 });
  },
  /** Muted brass click — when the spine rod locks a cover in place. */
  brassClick(delay = 0) {
    if (!enabled) return;
    noiseBurst({ duration: 0.025, filter: "highpass", frequency: 4000, gain: 0.18, attack: 0.001, delay });
    tone(2350, 0.09, 0.05, "triangle", delay);
    tone(3720, 0.06, 0.025, "sine", delay + 0.004);
    tone(180, 0.05, 0.06, "sine", delay);
  },
  /** Whisper-quiet page turn — when the 3D book opens or a page flips. */
  pageTurn() {
    if (!enabled) return;
    noiseBurst({ duration: 0.38, filter: "highpass", frequency: 1400, frequencyEnd: 5200, q: 0.4, gain: 0.07, attack: 0.12 });
    noiseBurst({ duration: 0.08, filter: "bandpass", frequency: 900, q: 1, gain: 0.05, attack: 0.005, delay: 0.32 });
  },
  /** Gentle confirm — when something lands in the bag. */
  confirm() {
    if (!enabled) return;
    tone(660, 0.35, 0.04, "sine");
    tone(990, 0.45, 0.03, "sine", 0.08);
  },
};
