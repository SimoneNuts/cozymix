"use client";

import { useEffect, useRef } from "react";
import { FADE_SECONDS, formatRemaining } from "@/lib/timer";
import { Icon } from "./icons";
import { useLocale } from "./locale";
import { Slider } from "./slider";
import { engine, useStore } from "./store";

/** Makes the Play button glow with the real output level while sound plays. */
function useLevelGlow(playing: boolean) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--level", "0");
    if (!playing || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let smooth = 0;
    const tick = () => {
      smooth = smooth * 0.85 + Math.min(1, engine.level() * 5) * 0.15;
      node.style.setProperty("--level", smooth.toFixed(3));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);
  return ref;
}

/** The player: always on screen, at the bottom, within thumb reach. */
export function Dock({ onTimer, onSave }: { onTimer: () => void; onSave: () => void }) {
  const { t } = useLocale();
  const store = useStore();
  const glow = useLevelGlow(store.playing);
  const count = store.active.length;
  const fading = store.timer && store.remaining <= FADE_SECONDS * 1000;

  const status = !count
    ? t.player.idle
    : `${store.playing ? t.player.playing : t.player.paused} · ${t.player.count(count)}`;

  return (
    <footer className="dock" aria-label={t.player.yourMix}>
      <div className="dock-inner">
        <button
          ref={glow}
          type="button"
          className="play"
          aria-label={store.playing ? t.player.pause : t.player.play}
          disabled={!count}
          onClick={store.togglePlay}
        >
          <Icon name={store.playing ? "pause" : "play"} />
        </button>
        <div className="dock-info">
          <strong className="dock-title" id="mix-title">
            {count ? store.title : "CozyMix"}
          </strong>
          <span className="dock-status">{fading ? t.timer.fading : status}</span>
        </div>
        <button
          type="button"
          className="pill"
          data-active={store.timer ? true : undefined}
          aria-label={store.timer ? `${t.player.timer}: ${formatRemaining(store.remaining)}` : t.player.timer}
          onClick={onTimer}
        >
          <Icon name="moon" />
          <span className="pill-text">
            {store.timer ? formatRemaining(store.remaining) : t.player.timer}
          </span>
        </button>
        <div className="dock-master">
          <Icon name="volume" />
          <Slider
            id="master"
            value={store.mix.master}
            label={t.player.master}
            onChange={store.setMaster}
          />
        </div>
        <div className="dock-actions">
          <button
            type="button"
            className="icon-button"
            aria-label={t.player.save}
            title={t.player.save}
            disabled={!count}
            onClick={onSave}
          >
            <Icon name="save" />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label={t.player.share}
            title={t.player.share}
            disabled={!count}
            onClick={() => void store.share()}
          >
            <Icon name="share" />
          </button>
        </div>
      </div>
    </footer>
  );
}
