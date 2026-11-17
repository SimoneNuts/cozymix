"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { OFFLINE_CACHE, asset } from "@/lib/base";
import { audioFiles } from "@/lib/catalog";
import { useLatest, useStore } from "./store";

const production = process.env.NODE_ENV === "production";
const APP_PAGE = asset("/");
const RECORDINGS = audioFiles.map(asset);

/** True when CozyMix runs as an installed app rather than in a browser tab. */
function installed(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

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
        // Someone who installed the app chose to keep it: keep every sound too.
        if (installed()) void downloadAllSounds();
      })
      .catch(() => {});
    const onInstalled = () => void downloadAllSounds();
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);
}

export type OfflineState = "unavailable" | "preparing" | "ready";

export type Offline = {
  /** Whether the app itself opens without a connection. */
  state: OfflineState;
  /** Recordings already kept for offline use, out of `total`. */
  saved: number;
  total: number;
};

/**
 * Whether the app opens offline, and how many recordings are kept. Recordings
 * are kept the first time they play, or all at once by `downloadAllSounds`.
 * Checked while `watch` is true.
 */
export function useOffline(watch: boolean): Offline {
  const supported = production && "serviceWorker" in navigator && "caches" in window;
  const [offline, setOffline] = useState<Offline>(() => ({
    state: supported ? "preparing" : "unavailable",
    saved: 0,
    total: RECORDINGS.length,
  }));
  const download = useDownload();
  useEffect(() => {
    if (!watch || !supported) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = async () => {
      try {
        const page = await caches.match(APP_PAGE);
        const kept = await Promise.all(RECORDINGS.map((url) => caches.match(url)));
        if (stopped) return;
        setOffline({
          state: page && navigator.serviceWorker.controller ? "ready" : "preparing",
          saved: kept.filter(Boolean).length,
          total: RECORDINGS.length,
        });
      } catch {
        if (!stopped) setOffline((current) => ({ ...current, state: "unavailable" }));
        return;
      }
      if (!stopped) timer = setTimeout(check, 1500);
    };
    timer = setTimeout(check, 0);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
    // A finished download changes the count: check again straight away.
  }, [watch, supported, download.running]);
  return offline;
}

export type Download = {
  running: boolean;
  done: number;
  total: number;
  /** The last download could not fetch every recording. */
  failed: boolean;
};

let download: Download = { running: false, done: 0, total: 0, failed: false };
const downloadListeners = new Set<() => void>();

function setDownload(next: Download) {
  download = next;
  for (const listener of downloadListeners) listener();
}

/** Progress of `downloadAllSounds`, shared by every component that shows it. */
export function useDownload(): Download {
  return useSyncExternalStore(
    (listener) => {
      downloadListeners.add(listener);
      return () => downloadListeners.delete(listener);
    },
    () => download,
    () => download,
  );
}

/**
 * Keeps every recording for offline use. Only fetches the ones not kept yet,
 * one at a time, and never plays anything. Safe to call more than once.
 */
export async function downloadAllSounds(): Promise<void> {
  if (download.running || !("caches" in window)) return;
  setDownload({ running: true, done: 0, total: 0, failed: false });
  let failed = false;
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const missing: string[] = [];
    for (const url of RECORDINGS) if (!(await caches.match(url))) missing.push(url);
    setDownload({ running: true, done: 0, total: missing.length, failed: false });
    for (const [index, url] of missing.entries()) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        await cache.put(url, response);
      } catch {
        failed = true;
      }
      setDownload({ running: true, done: index + 1, total: missing.length, failed });
    }
  } catch {
    failed = true;
  }
  setDownload({ ...download, running: false, failed });
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
