"use client";

import { useEffect, useState } from "react";
import { asset } from "@/lib/base";
import { audioFiles } from "@/lib/catalog";
import { useLatest, useStore } from "./store";

const production = process.env.NODE_ENV === "production";
const OFFLINE_CHECK = ["/", ...audioFiles].map(asset);

/**
 * Registers the offline worker in production. In development it removes any
 * worker and cache left behind by a production build on the same address,
 * so `npm run dev` always shows the code you are editing.
 */
export function useServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (!production) {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => registrations.forEach((r) => void r.unregister()))
        .catch(() => {});
      if ("caches" in window) {
        void caches
          .keys()
          .then((keys) => keys.forEach((key) => void caches.delete(key)))
          .catch(() => {});
      }
      return;
    }
    navigator.serviceWorker
      .register(asset("/sw.js"))
      .then(() => navigator.serviceWorker.ready)
      .then((registration) => {
        // Scripts loaded before the worker took over: ask it to keep them too.
        const urls = performance
          .getEntriesByType("resource")
          .map((entry) => entry.name)
          .filter((url) => url.startsWith(location.origin + asset("/_next/static/")));
        registration.active?.postMessage({ type: "cache", urls });
      })
      .catch(() => {});
  }, []);
}

export type OfflineState = "unavailable" | "preparing" | "ready";

/** Whether the page and every recording are in the offline cache. Checked while `watch` is true. */
export function useOffline(watch: boolean): OfflineState {
  const [state, setState] = useState<OfflineState>(() =>
    production && "serviceWorker" in navigator && "caches" in window ? "preparing" : "unavailable",
  );
  useEffect(() => {
    if (!watch || state !== "preparing") return;
    let stopped = false;
    const check = async () => {
      try {
        const found = await Promise.all(OFFLINE_CHECK.map((url) => caches.match(url)));
        if (!stopped && found.every(Boolean) && navigator.serviceWorker.controller) {
          setState("ready");
          return;
        }
      } catch {
        if (!stopped) setState("unavailable");
        return;
      }
      if (!stopped) timer = setTimeout(check, 1500);
    };
    let timer = setTimeout(check, 0);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [watch, state]);
  return state;
}

type InstallEvent = Event & { prompt: () => Promise<void> };

/** A function that shows the browser's install prompt, when one is on offer. */
export function useInstall(): (() => void) | null {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  useEffect(() => {
    const capture = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
    };
    const installed = () => setEvent(null);
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  if (!event) return null;
  return () => {
    void event.prompt().finally(() => setEvent(null));
  };
}

/** Lock screen and headset controls, the tab title, and the Space shortcut. */
export function useSessionIntegration() {
  const store = useStore();
  const latest = useLatest(store);
  const { title, playing } = store;

  useEffect(() => {
    document.title = playing ? `▶ ${title} · CozyMix` : "CozyMix";
    const session = navigator.mediaSession;
    if (!session) return;
    if (typeof MediaMetadata !== "undefined") {
      session.metadata = new MediaMetadata({
        title,
        artist: "CozyMix",
        artwork: [{ src: asset("/icons/icon-512.png"), sizes: "512x512", type: "image/png" }],
      });
    }
    session.playbackState = playing ? "playing" : "paused";
  }, [title, playing]);

  useEffect(() => {
    const session = navigator.mediaSession;
    const actions: [MediaSessionAction, () => void][] = [
      ["play", () => latest.current.play()],
      ["pause", () => latest.current.pause()],
      ["stop", () => latest.current.pause()],
    ];
    for (const [action, run] of actions) {
      try {
        session?.setActionHandler(action, run);
      } catch {
        // Not every browser knows every action.
      }
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== " " || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select, button, a, [contenteditable], dialog")) return;
      event.preventDefault();
      latest.current.togglePlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [latest]);
}
