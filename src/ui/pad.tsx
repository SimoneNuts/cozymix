"use client";

import { sounds, type Sound } from "@/lib/catalog";
import { Icon } from "./icons";
import { useLocale } from "./locale";
import { Slider } from "./slider";
import { useEngine, useStore } from "./store";

type PadState = "off" | "loading" | "error" | "paused" | "playing";

function Pad({ sound }: { sound: Sound }) {
  const { t } = useLocale();
  const store = useStore();
  const engine = useEngine();
  const track = store.mix.tracks[sound.id];
  const status = engine.status[sound.id];
  const text = t.sounds[sound.id];

  const state: PadState = !track.on
    ? "off"
    : status === "error"
      ? "error"
      : status === "loading"
        ? "loading"
        : store.playing && engine.running && status === "ready"
          ? "playing"
          : "paused";
  const hintId = `hint-${sound.id}`;

  return (
    <li
      className="pad"
      data-sound={sound.id}
      data-state={state}
      style={{ "--hue": sound.hue } as React.CSSProperties}
    >
      <button
        type="button"
        className="pad-toggle"
        aria-pressed={track.on}
        aria-label={text.name}
        aria-describedby={hintId}
        onClick={() => store.toggleSound(sound.id)}
      >
        <span className="pad-icon">
          <Icon name={sound.id} />
        </span>
        <span className="pad-text">
          <span className="pad-name">{text.name}</span>
          <span className="pad-hint" id={hintId}>
            {state === "loading" ? t.pad.loading : state === "error" ? t.pad.failed : text.hint}
          </span>
        </span>
        <span className="pad-meter" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>
      {state === "error" ? (
        <button
          type="button"
          className="pad-retry"
          aria-label={t.pad.retryLabel(text.name)}
          onClick={() => store.retry(sound.id)}
        >
          {t.pad.retry}
        </button>
      ) : (
        <Slider
          value={track.volume}
          label={t.pad.volume(text.name)}
          dim={!track.on}
          onChange={(value) => store.setVolume(sound.id, value)}
          onRelease={store.wake}
        />
      )}
    </li>
  );
}

export function SoundGrid() {
  const { t } = useLocale();
  const store = useStore();
  return (
    <section className="section" aria-labelledby="sounds-title">
      <div className="section-head">
        <h2 id="sounds-title">{t.sections.sounds}</h2>
        {store.active.length > 0 && (
          <button type="button" className="text-button" onClick={store.clearAll}>
            <Icon name="power" />
            {t.player.stopAll}
          </button>
        )}
      </div>
      <ul className="pads">
        {sounds.map((sound) => (
          <Pad key={sound.id} sound={sound} />
        ))}
      </ul>
    </section>
  );
}
