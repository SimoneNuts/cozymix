/**
 * The Web Audio engine. The UI describes what it wants to hear with `apply()`
 * and the engine works out the rest: loading, starting, fading and stopping.
 *
 * Graph: voice gains → master → fade (sleep timer) → analyser → speakers.
 *
 * Browsers only allow audio to start inside a user gesture, so the context is
 * created and resumed in `unlock()`, which the UI calls synchronously from a
 * click or key handler. `apply()` never resumes; it only ever suspends.
 */
import { asset } from "../lib/base.ts";
import { sounds, type Sound, type SoundId } from "../lib/catalog.ts";
import { generate, seamless } from "./dsp.ts";

export type SoundStatus = "loading" | "ready" | "error";

export type EngineSnapshot = {
  supported: boolean;
  running: boolean;
  status: Partial<Record<SoundId, SoundStatus>>;
};

export type Desired = {
  playing: boolean;
  master: number;
  levels: Partial<Record<SoundId, number>>;
};

type Voice = {
  sound: Sound;
  gain: GainNode;
  source?: AudioBufferSourceNode;
  timer?: ReturnType<typeof setTimeout>;
};

const RAMP = 0.12; // seconds, time constant for volume changes
const PAUSE_FADE_MS = 450;

/** Sliders are linear; ears are not. This curve makes each step feel even. */
const curve = (level: number) => level ** 1.5;

type AudioWindow = typeof globalThis & { webkitAudioContext?: typeof AudioContext };

function audioContextClass(): typeof AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  return window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private fade!: GainNode;
  private analyser!: AnalyserNode;
  private samples = new Float32Array(1024);
  private voices = new Map<SoundId, Voice>();
  private buffers = new Map<SoundId, Promise<AudioBuffer>>();
  private desired: Desired = { playing: false, master: 1, levels: {} };
  private suspendTimer: ReturnType<typeof setTimeout> | undefined;
  private listeners = new Set<() => void>();
  private snap: EngineSnapshot = {
    supported: typeof window === "undefined" || audioContextClass() !== undefined,
    running: false,
    status: {},
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snap;

  /**
   * Call synchronously inside a click or key handler, before asking to play.
   * Returns false when this browser has no Web Audio.
   */
  unlock(): boolean {
    const Context = audioContextClass();
    if (!Context) return false;
    clearTimeout(this.suspendTimer);
    if (!this.ctx) {
      const nav = navigator as Navigator & { audioSession?: { type: string } };
      // Safari: play even when the ringer switch is on silent.
      if (nav.audioSession) nav.audioSession.type = "playback";
      const ctx = new Context({ latencyHint: "playback" });
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.fade = ctx.createGain();
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.master.gain.value = 0;
      this.master.connect(this.fade).connect(this.analyser).connect(ctx.destination);
      ctx.onstatechange = () => this.update({ running: ctx.state === "running" });
    }
    if (this.ctx.state !== "running") void this.ctx.resume().catch(() => {});
    this.apply(this.desired);
    return true;
  }

  /** Brings the sound in line with what the UI wants. Safe to call often. */
  apply(desired: Desired) {
    this.desired = desired;
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    this.master.gain.setTargetAtTime(desired.playing ? curve(desired.master) : 0, now, RAMP);

    for (const [id, voice] of this.voices) {
      if (desired.levels[id] === undefined) this.release(id, voice);
    }
    for (const sound of sounds) {
      const level = desired.levels[sound.id];
      if (level === undefined) continue;
      const voice = this.voices.get(sound.id) ?? this.createVoice(sound);
      voice.gain.gain.setTargetAtTime(curve(level), now, RAMP);
    }

    clearTimeout(this.suspendTimer);
    if (!desired.playing && ctx.state === "running") {
      // Let the fade finish, then stop the clock to save battery.
      this.suspendTimer = setTimeout(() => {
        if (!this.desired.playing) void ctx.suspend().catch(() => {});
      }, PAUSE_FADE_MS);
    }
  }

  /** Sleep timer multiplier, from 1 (full) down to 0 (silent). */
  setFade(value: number) {
    if (this.ctx) this.fade.gain.setTargetAtTime(value, this.ctx.currentTime, 0.4);
  }

  /** Forgets a failed download and tries again. */
  retry(id: SoundId) {
    this.buffers.delete(id);
    const voice = this.voices.get(id);
    if (voice) {
      this.voices.delete(id);
      voice.gain.disconnect();
    }
    this.apply(this.desired);
  }

  /** Loudness of what is playing right now, 0 to about 1. */
  level(): number {
    if (!this.ctx || this.ctx.state !== "running") return 0;
    this.analyser.getFloatTimeDomainData(this.samples);
    let sum = 0;
    for (const value of this.samples) sum += value * value;
    return Math.sqrt(sum / this.samples.length);
  }

  private createVoice(sound: Sound): Voice {
    const ctx = this.ctx!;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(this.master);
    const voice: Voice = { sound, gain };
    this.voices.set(sound.id, voice);
    this.setStatus(sound.id, "loading");
    this.load(sound).then(
      (buffer) => {
        if (this.voices.get(sound.id) !== voice) return;
        this.setStatus(sound.id, "ready");
        if (sound.kind === "event") this.scheduleEvent(voice, buffer, true);
        else this.startLoop(voice, buffer);
      },
      () => {
        if (this.voices.get(sound.id) === voice) this.setStatus(sound.id, "error");
      },
    );
    return voice;
  }

  private startLoop(voice: Voice, buffer: AudioBuffer) {
    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(voice.gain);
    // Start somewhere other than the top, so two sessions never sound identical.
    source.start(0, Math.random() * buffer.duration);
    voice.source = source;
  }

  /** Plays the recording now and then. The first one comes soon, so you hear it. */
  private scheduleEvent(voice: Voice, buffer: AudioBuffer, first = false) {
    if (voice.sound.kind !== "event") return;
    const [min, max] = voice.sound.everySeconds;
    const wait = first ? 1.5 + Math.random() * 2.5 : min + Math.random() * (max - min);
    voice.timer = setTimeout(() => {
      if (this.voices.get(voice.sound.id) !== voice) return;
      if (this.ctx?.state === "running" && this.desired.playing) {
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = 0.9 + Math.random() * 0.2;
        source.connect(voice.gain);
        source.start();
        voice.source = source;
      }
      this.scheduleEvent(voice, buffer);
    }, wait * 1000);
  }

  private release(id: SoundId, voice: Voice) {
    const ctx = this.ctx!;
    this.voices.delete(id);
    clearTimeout(voice.timer);
    voice.gain.gain.setTargetAtTime(0, ctx.currentTime, RAMP);
    setTimeout(() => {
      try {
        voice.source?.stop();
      } catch {
        // Already stopped.
      }
      voice.gain.disconnect();
    }, 800);
    const status = { ...this.snap.status };
    delete status[id];
    this.update({ status });
  }

  private load(sound: Sound): Promise<AudioBuffer> {
    let pending = this.buffers.get(sound.id);
    if (!pending) {
      pending = this.decode(sound);
      this.buffers.set(sound.id, pending);
      pending.catch(() => this.buffers.delete(sound.id));
    }
    return pending;
  }

  private async decode(sound: Sound): Promise<AudioBuffer> {
    const ctx = this.ctx!;
    if (sound.kind === "generated") {
      // Yield first so the tap paints before the synthesis work.
      await new Promise((resolve) => setTimeout(resolve, 0));
      const channels = generate(sound.generator, ctx.sampleRate, sound.id.length);
      return this.toBuffer(channels, ctx.sampleRate);
    }
    const response = await fetch(asset(sound.file));
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${sound.file}`);
    const decoded = await ctx.decodeAudioData(await response.arrayBuffer());
    if (sound.kind === "event") return decoded;
    const fade = Math.round(sound.crossfade * decoded.sampleRate);
    const channels = Array.from({ length: decoded.numberOfChannels }, (_, i) =>
      seamless(decoded.getChannelData(i), fade),
    );
    return this.toBuffer(channels, decoded.sampleRate);
  }

  private toBuffer(channels: Float32Array[], sampleRate: number): AudioBuffer {
    const buffer = this.ctx!.createBuffer(channels.length, channels[0].length, sampleRate);
    channels.forEach((data, i) => buffer.copyToChannel(data as Float32Array<ArrayBuffer>, i));
    return buffer;
  }

  private setStatus(id: SoundId, value: SoundStatus) {
    this.update({ status: { ...this.snap.status, [id]: value } });
  }

  private update(change: Partial<EngineSnapshot>) {
    this.snap = { ...this.snap, ...change };
    for (const listener of this.listeners) listener();
  }
}

type EngineHost = typeof globalThis & { __cozymixEngine?: AudioEngine };

/**
 * The one engine for the page. Kept on globalThis so hot reloads in
 * development reuse it instead of stacking a second AudioContext; tests also
 * read its output level there.
 */
export function getEngine(): AudioEngine {
  const host = globalThis as EngineHost;
  host.__cozymixEngine ??= new AudioEngine();
  return host.__cozymixEngine;
}
