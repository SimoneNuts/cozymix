"use client";

import { useState, useSyncExternalStore } from "react";
import { findSound } from "@/lib/catalog";
import { SavedMixes, Scenes } from "./collections";
import { Dock } from "./dock";
import { Icon } from "./icons";
import { LocaleProvider, useLocale } from "./locale";
import { SoundGrid } from "./pad";
import { InfoSheet, SaveSheet, TimerSheet } from "./sheets";
import { StoreProvider, useEngine, useStore } from "./store";
import { useServiceWorker, useSessionIntegration } from "./system";
import { ToastProvider } from "./toast";

const subscribeNothing = () => () => {};

/**
 * Everything CozyMix shows depends on this device: its language, its saved
 * mix, its saved mixes. So the server sends a calm splash and the app renders
 * once in the browser, already in the right language, with no flash and no
 * hydration mismatch.
 */
export function CozyMix() {
  const inBrowser = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  if (!inBrowser) return <Splash />;
  return (
    <LocaleProvider>
      <ToastProvider>
        <StoreProvider>
          <Shell />
        </StoreProvider>
      </ToastProvider>
    </LocaleProvider>
  );
}

function Splash() {
  return (
    <div className="splash" aria-busy="true">
      <span className="logo">
        <Icon name="moon" />
      </span>
      <span className="brand-name">CozyMix</span>
    </div>
  );
}

type SheetName = "timer" | "save" | "info" | null;

function Shell() {
  const { t } = useLocale();
  const store = useStore();
  const engine = useEngine();
  const [sheet, setSheet] = useState<SheetName>(null);
  const close = () => setSheet(null);
  useServiceWorker();
  useSessionIntegration();

  return (
    <div className="app" data-playing={store.playing || undefined}>
      <Ambience />
      <Header onInfo={() => setSheet("info")} />
      <main className="main">
        {(store.unsupported || !engine.supported) && (
          <p className="banner" role="alert">
            {t.errors.unsupported}
          </p>
        )}
        {!store.storageOk && (
          <p className="banner" role="alert">
            {t.errors.storage}
          </p>
        )}
        <Scenes />
        <SoundGrid />
        <SavedMixes />
      </main>
      <Dock onTimer={() => setSheet("timer")} onSave={() => setSheet("save")} />
      <TimerSheet open={sheet === "timer"} onClose={close} />
      <SaveSheet open={sheet === "save"} onClose={close} />
      <InfoSheet open={sheet === "info"} onClose={close} />
    </div>
  );
}

function Header({ onInfo }: { onInfo: () => void }) {
  const { t, locale, setLocale } = useLocale();
  return (
    <header className="header">
      <div className="brand">
        <span className="logo">
          <Icon name="moon" />
        </span>
        <span>
          <span className="brand-name">CozyMix</span>
          <span className="brand-tagline">{t.app.tagline}</span>
        </span>
      </div>
      <div className="header-actions">
        <button
          type="button"
          className="lang-button"
          lang={locale === "en" ? "it" : "en"}
          aria-label={t.app.switchToLabel}
          onClick={() => setLocale(locale === "en" ? "it" : "en")}
        >
          {locale === "en" ? "IT" : "EN"}
        </button>
        <button type="button" className="icon-button" aria-label={t.app.menu} onClick={onInfo}>
          <Icon name="info" />
        </button>
      </div>
    </header>
  );
}

/** Soft colour behind everything, mixed from the sounds that are on. */
function Ambience() {
  const store = useStore();
  const glows = store.active.slice(0, 4);
  return (
    <div className="ambience" aria-hidden="true">
      {glows.map((id, index) => (
        <span
          key={id}
          className="glow"
          data-slot={index}
          style={{ "--hue": findSound(id)?.hue ?? 0 } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
