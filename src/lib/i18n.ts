/**
 * Every word the interface shows, in English and Italian. TypeScript checks
 * that both languages have the same shape, so a missing translation fails the
 * typecheck.
 *
 * Pure module: no React, no DOM, relative imports only.
 */
import type { SceneId, SoundId } from "./catalog.ts";

export const locales = ["en", "it"] as const;
export type Locale = (typeof locales)[number];

type SoundText = { name: string; hint: string };

const en = {
  app: {
    tagline: "Sounds to feel at home",
    language: "Language",
    switchTo: "Italiano",
    switchToLabel: "Passa all’italiano",
    menu: "About and settings",
  },
  sounds: {
    rain: { name: "Rain", hint: "On the window" },
    thunder: { name: "Thunder", hint: "Now and then, far away" },
    wind: { name: "Wind", hint: "Through the pines" },
    waves: { name: "Waves", hint: "A quiet shore" },
    stream: { name: "Stream", hint: "A brook in the woods" },
    fireplace: { name: "Fireplace", hint: "Embers and crackle" },
    cafe: { name: "Café", hint: "Cups and soft voices" },
    train: { name: "Train", hint: "A seat by the window" },
    nebulizer: { name: "Nebulizer", hint: "A steady little hum" },
    brown: { name: "Brown noise", hint: "Deep and soft" },
  } satisfies Record<SoundId, SoundText>,
  scenes: {
    "rainy-window": "Rainy window",
    storm: "Storm",
    cabin: "Cabin",
    cafe: "Café corner",
    "night-train": "Night train",
    seaside: "Seaside",
    focus: "Deep focus",
    nebulizer: "Nebulizer night",
  } satisfies Record<SceneId, string>,
  sections: {
    scenes: "Start with a scene",
    sounds: "Sounds",
    saved: "Your mixes",
  },
  pad: {
    volume: (name: string) => `${name} volume`,
    loading: "Loading…",
    failed: "Couldn’t load",
    retry: "Try again",
    retryLabel: (name: string) => `Try loading ${name} again`,
  },
  player: {
    play: "Play",
    pause: "Pause",
    master: "Overall volume",
    idle: "Pick a sound to begin",
    paused: "Paused",
    playing: "Playing",
    yourMix: "Your mix",
    count: (n: number) => (n === 1 ? "1 sound" : `${n} sounds`),
    stopAll: "Turn everything off",
    timer: "Sleep timer",
    share: "Share",
    save: "Save",
  },
  timer: {
    title: "Sleep timer",
    intro: "The mix fades out over the last 30 seconds, then pauses.",
    minutes: (n: number) => `${n} min`,
    off: "No timer",
    endsAt: (time: string) => `Ends at ${time}`,
    left: (time: string) => `${time} left`,
    fading: "Fading out…",
    done: "Sleep timer finished. Your mix is paused.",
    close: "Done",
  },
  save: {
    title: "Save this mix",
    label: "Name",
    placeholder: "Sunday morning",
    submit: "Save",
    cancel: "Cancel",
    saved: (name: string) => `Saved “${name}”`,
    errors: {
      empty: "Give your mix a name.",
      taken: "You already have a mix with this name.",
      full: "You have saved as many mixes as fit. Delete one first.",
    },
  },
  saved: {
    empty: "Mixes you save will appear here.",
    play: (name: string) => `Load ${name}`,
    delete: (name: string) => `Delete ${name}`,
    deleted: (name: string) => `Deleted “${name}”`,
  },
  share: {
    copied: "Link copied. Anyone who opens it gets this mix.",
    failed: "Couldn’t copy the link.",
    title: "My CozyMix",
    received: "Someone shared a mix with you. Press Play to listen.",
    skipped: (n: number) =>
      n === 1 ? "1 sound isn’t available here." : `${n} sounds aren’t available here.`,
  },
  toast: {
    undo: "Undo",
    dismiss: "Dismiss",
    sceneLoaded: (name: string) => `${name} is ready`,
    cleared: "Everything is off",
  },
  errors: {
    unsupported: "This browser can’t play sounds (Web Audio is missing).",
    storage: "Your browser isn’t letting CozyMix save. Changes last until you close the page.",
  },
  info: {
    title: "About CozyMix",
    about:
      "Layer rain, fire, a café, a train and gentle noise. Everything stays on this device: no account, no ads, no tracking.",
    shortcuts: "Space plays and pauses.",
    offline: "Offline",
    offlineReady: "Ready to work without a connection.",
    offlinePreparing: "Getting ready for offline use…",
    offlineUnavailable: "Offline use isn’t available in this browser or mode.",
    install: "Install the app",
    credits: "Sounds",
    synthesized: "Made in your browser",
    original: "Original for CozyMix",
    close: "Close",
  },
};

export type Messages = typeof en;

const it: Messages = {
  app: {
    tagline: "Suoni per sentirsi a casa",
    language: "Lingua",
    switchTo: "English",
    switchToLabel: "Switch to English",
    menu: "Informazioni e impostazioni",
  },
  sounds: {
    rain: { name: "Pioggia", hint: "Sul vetro" },
    thunder: { name: "Tuoni", hint: "Ogni tanto, lontani" },
    wind: { name: "Vento", hint: "Tra i pini" },
    waves: { name: "Onde", hint: "Una riva tranquilla" },
    stream: { name: "Ruscello", hint: "Acqua tra i sassi" },
    fireplace: { name: "Camino", hint: "Brace e scoppiettio" },
    cafe: { name: "Caffè", hint: "Tazzine e voci basse" },
    train: { name: "Treno", hint: "Un posto al finestrino" },
    nebulizer: { name: "Nebulizzatore", hint: "Un ronzio costante" },
    brown: { name: "Rumore marrone", hint: "Profondo e morbido" },
  },
  scenes: {
    "rainy-window": "Pioggia alla finestra",
    storm: "Temporale",
    cabin: "Baita",
    cafe: "Angolo del caffè",
    "night-train": "Treno di notte",
    seaside: "In riva al mare",
    focus: "Concentrazione",
    nebulizer: "Notte col nebulizzatore",
  },
  sections: {
    scenes: "Parti da una scena",
    sounds: "Suoni",
    saved: "I tuoi mix",
  },
  pad: {
    volume: (name) => `Volume ${name}`,
    loading: "Caricamento…",
    failed: "Non caricato",
    retry: "Riprova",
    retryLabel: (name) => `Riprova a caricare ${name}`,
  },
  player: {
    play: "Riproduci",
    pause: "Pausa",
    master: "Volume generale",
    idle: "Scegli un suono per iniziare",
    paused: "In pausa",
    playing: "In riproduzione",
    yourMix: "Il tuo mix",
    count: (n) => (n === 1 ? "1 suono" : `${n} suoni`),
    stopAll: "Spegni tutto",
    timer: "Timer",
    share: "Condividi",
    save: "Salva",
  },
  timer: {
    title: "Timer per dormire",
    intro: "Negli ultimi 30 secondi il mix si abbassa piano, poi va in pausa.",
    minutes: (n) => `${n} min`,
    off: "Nessun timer",
    endsAt: (time) => `Finisce alle ${time}`,
    left: (time) => `Mancano ${time}`,
    fading: "Sto abbassando…",
    done: "Timer finito. Il mix è in pausa.",
    close: "Fatto",
  },
  save: {
    title: "Salva questo mix",
    label: "Nome",
    placeholder: "Domenica mattina",
    submit: "Salva",
    cancel: "Annulla",
    saved: (name) => `Salvato «${name}»`,
    errors: {
      empty: "Dai un nome al tuo mix.",
      taken: "Hai già un mix con questo nome.",
      full: "Hai salvato tutti i mix possibili. Eliminane uno prima.",
    },
  },
  saved: {
    empty: "Qui troverai i mix che salvi.",
    play: (name) => `Carica ${name}`,
    delete: (name) => `Elimina ${name}`,
    deleted: (name) => `Eliminato «${name}»`,
  },
  share: {
    copied: "Link copiato. Chi lo apre trova questo mix.",
    failed: "Non sono riuscito a copiare il link.",
    title: "Il mio CozyMix",
    received: "Qualcuno ti ha condiviso un mix. Premi Riproduci per ascoltarlo.",
    skipped: (n) =>
      n === 1 ? "1 suono non è disponibile qui." : `${n} suoni non sono disponibili qui.`,
  },
  toast: {
    undo: "Annulla",
    dismiss: "Chiudi",
    sceneLoaded: (name) => `${name}: pronto`,
    cleared: "Tutto spento",
  },
  errors: {
    unsupported: "Questo browser non riesce a riprodurre suoni (manca Web Audio).",
    storage:
      "Il browser non permette a CozyMix di salvare. Le modifiche durano finché non chiudi la pagina.",
  },
  info: {
    title: "Su CozyMix",
    about:
      "Sovrapponi pioggia, fuoco, un caffè, un treno e rumori morbidi. Tutto resta su questo dispositivo: niente account, pubblicità o tracciamento.",
    shortcuts: "La barra spaziatrice avvia e mette in pausa.",
    offline: "Offline",
    offlineReady: "Pronto a funzionare senza connessione.",
    offlinePreparing: "Preparazione per l’uso offline…",
    offlineUnavailable: "L’uso offline non è disponibile in questo browser o modalità.",
    install: "Installa l’app",
    credits: "Suoni",
    synthesized: "Creato nel tuo browser",
    original: "Originale per CozyMix",
    close: "Chiudi",
  },
};

export const messages: Record<Locale, Messages> = { en, it };

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "it";
}

/** Saved choice first, then the browser's preferred languages, then English. */
export function pickLocale(saved: string | null, preferred: readonly string[]): Locale {
  if (isLocale(saved)) return saved;
  for (const tag of preferred) {
    const base = tag.toLowerCase().split("-")[0];
    if (isLocale(base)) return base;
  }
  return "en";
}
