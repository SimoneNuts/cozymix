"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { getEngine, type EngineSnapshot } from "@/audio/engine";
import { type Scene, type SoundId } from "@/lib/catalog";
import {
  activeIds,
  clearAll as clearMix,
  fromLevels,
  levelsOf,
  matchingScene,
  sameSound,
  sceneMix,
  setMaster as withMaster,
  setVolume as withVolume,
  toggle,
  type Mix,
} from "@/lib/mix";
import { decodeShare, encodeShare } from "@/lib/share";
import {
  KEYS,
  cleanName,
  nameProblem,
  parseMix,
  parseSaved,
  serializeMix,
  serializeSaved,
  type NameProblem,
  type SavedMix,
} from "@/lib/storage";
import { fadeLevel } from "@/lib/timer";
import { useLocale } from "./locale";
import { makeId, readKey, writeKey } from "./persist";
import { useToast } from "./toast";

const engine = getEngine();
const serverSnapshot: EngineSnapshot = { supported: true, running: false, status: {} };

export function useEngine(): EngineSnapshot {
  return useSyncExternalStore(engine.subscribe, engine.getSnapshot, () => serverSnapshot);
}

type Timer = { endsAt: number; minutes: number } | null;

function useStoreValue() {
  const { t } = useLocale();
  const toast = useToast();

  // A shared link wins over the stored mix, but never starts playing by itself.
  const [shared] = useState(() => decodeShare(location.hash));
  const [mix, setMix] = useState<Mix>(() => {
    const stored = parseMix(readKey(KEYS.mix));
    return shared ? fromLevels(shared.levels, stored) : stored;
  });
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState<SavedMix[]>(() => parseSaved(readKey(KEYS.saved)));
  const [storageOk, setStorageOk] = useState(true);
  const [unsupported, setUnsupported] = useState(false);
  const [timer, setTimer] = useState<Timer>(null);
  const [now, setNow] = useState(() => Date.now());

  const active = useMemo(() => activeIds(mix), [mix]);
  const audible = playing && active.length > 0;

  // Keep the engine in step with the state. This never starts audio; only
  // the gesture handlers below can, through unlock().
  useEffect(() => {
    engine.apply({ playing: audible, master: mix.master, levels: levelsOf(mix) });
  }, [audible, mix]);

  useEffect(() => {
    const ok = writeKey(KEYS.mix, serializeMix(mix));
    if (!ok) queueMicrotask(() => setStorageOk(false));
  }, [mix]);

  const persistSaved = useCallback((next: SavedMix[]) => {
    setSaved(next);
    if (!writeKey(KEYS.saved, serializeSaved(next))) setStorageOk(false);
  }, []);

  useEffect(() => {
    if (!shared || !location.hash) return;
    history.replaceState(null, "", location.pathname + location.search);
    toast({
      message: [t.share.received, shared.skipped ? t.share.skipped(shared.skipped) : ""]
        .filter(Boolean)
        .join(" "),
    });
    // Runs once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Starts sound. Call only from a click, tap or key handler. */
  const start = useCallback(() => {
    if (!engine.unlock()) {
      setUnsupported(true);
      return;
    }
    engine.setFade(1);
    setPlaying(true);
  }, []);

  const play = useCallback(() => {
    if (active.length) start();
  }, [active.length, start]);
  const pause = useCallback(() => setPlaying(false), []);
  const togglePlay = useCallback(() => {
    if (audible) pause();
    else play();
  }, [audible, pause, play]);

  /** Replaces the mix and offers Undo. Starting sound is part of the same tap. */
  const replace = useCallback(
    (next: Mix, message: string) => {
      const previous = mix;
      const wasPlaying = playing;
      setMix(next);
      if (activeIds(next).length) start();
      else setPlaying(false);
      toast({
        message,
        action: {
          label: t.toast.undo,
          run: () => {
            setMix(previous);
            if (wasPlaying && activeIds(previous).length) start();
            else setPlaying(false);
          },
        },
      });
    },
    [mix, playing, start, toast, t],
  );

  const toggleSound = useCallback(
    (id: SoundId) => {
      const next = toggle(mix, id);
      setMix(next);
      if (next.tracks[id].on) start();
      else if (!activeIds(next).length) setPlaying(false);
    },
    [mix, start],
  );

  const setVolume = useCallback(
    (id: SoundId, volume: number) => {
      const wasOn = mix.tracks[id].on;
      const next = withVolume(mix, id, volume);
      setMix(next);
      if (!wasOn && next.tracks[id].on) start();
      else if (!activeIds(next).length) setPlaying(false);
    },
    [mix, start],
  );

  /** Some phones only let audio start on the release of a touch. */
  const wake = useCallback(() => {
    if (audible) engine.unlock();
  }, [audible]);

  const setMaster = useCallback((value: number) => setMix((m) => withMaster(m, value)), []);

  const loadScene = useCallback(
    (scene: Scene, name: string) => replace(sceneMix(scene, mix), t.toast.sceneLoaded(name)),
    [mix, replace, t],
  );

  const loadSaved = useCallback(
    (entry: SavedMix) => replace(fromLevels(entry.levels, mix), t.toast.sceneLoaded(entry.name)),
    [mix, replace, t],
  );

  const clearAll = useCallback(() => replace(clearMix(mix), t.toast.cleared), [mix, replace, t]);

  const saveMix = useCallback(
    (name: string): NameProblem | undefined => {
      const problem = nameProblem(name, saved);
      if (problem) return problem;
      const entry: SavedMix = { id: makeId(), name: cleanName(name), levels: levelsOf(mix) };
      persistSaved([entry, ...saved]);
      toast({ message: t.save.saved(entry.name) });
      return undefined;
    },
    [mix, saved, persistSaved, toast, t],
  );

  const deleteSaved = useCallback(
    (entry: SavedMix) => {
      const before = saved;
      persistSaved(saved.filter((item) => item.id !== entry.id));
      toast({
        message: t.saved.deleted(entry.name),
        action: { label: t.toast.undo, run: () => persistSaved(before) },
      });
    },
    [saved, persistSaved, toast, t],
  );

  const share = useCallback(async () => {
    const url = location.origin + location.pathname + encodeShare(levelsOf(mix));
    const touch = matchMedia("(pointer: coarse)").matches;
    if (touch && navigator.share) {
      try {
        await navigator.share({ title: t.share.title, url });
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ message: t.share.copied });
    } catch {
      toast({ message: t.share.failed });
    }
  }, [mix, toast, t]);

  // Sleep timer: an end time on the wall clock, checked every second.
  const startTimer = useCallback((minutes: number) => {
    const current = Date.now();
    setNow(current);
    setTimer({ minutes, endsAt: current + minutes * 60_000 });
    engine.setFade(1);
  }, []);
  const cancelTimer = useCallback(() => {
    setTimer(null);
    engine.setFade(1);
  }, []);
  const doneMessage = t.timer.done;
  useEffect(() => {
    if (!timer) return;
    const id = setInterval(() => {
      const current = Date.now();
      const remaining = timer.endsAt - current;
      setNow(current);
      engine.setFade(fadeLevel(remaining));
      if (remaining <= 0) {
        setTimer(null);
        setPlaying(false);
        toast({ message: doneMessage });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [timer, toast, doneMessage]);

  const scene = useMemo(() => matchingScene(mix), [mix]);
  const savedMatch = useMemo(() => {
    const levels = levelsOf(mix);
    return active.length ? saved.find((entry) => sameSound(entry.levels, levels)) : undefined;
  }, [mix, saved, active.length]);
  const title = scene ? t.scenes[scene.id] : savedMatch ? savedMatch.name : t.player.yourMix;

  return {
    mix,
    active,
    playing: audible,
    title,
    scene,
    savedMatch,
    saved,
    storageOk,
    unsupported,
    timer,
    remaining: timer ? Math.max(0, timer.endsAt - now) : 0,
    play,
    pause,
    togglePlay,
    toggleSound,
    setVolume,
    setMaster,
    wake,
    loadScene,
    loadSaved,
    clearAll,
    saveMix,
    deleteSaved,
    share,
    startTimer,
    cancelTimer,
    retry: (id: SoundId) => engine.retry(id),
  };
}

export type Store = ReturnType<typeof useStoreValue>;
const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const value = useStoreValue();
  return <StoreContext value={value}>{children}</StoreContext>;
}

export function useStore(): Store {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore needs <StoreProvider>");
  return value;
}

/** Latest value in a ref, for event listeners registered once. */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

export { engine };
