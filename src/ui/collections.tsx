"use client";

import { findSound, scenes, type SoundId } from "@/lib/catalog";
import { Icon } from "./icons";
import { useLocale } from "./locale";
import { useStore } from "./store";

/** A soft gradient made from the colours of the sounds it contains. */
function swatch(ids: SoundId[]): React.CSSProperties {
  const hues = ids.map((id) => findSound(id)?.hue ?? 0);
  const [a, b = a, c = b] = hues;
  return { "--h1": a, "--h2": b, "--h3": c } as React.CSSProperties;
}

function SoundIcons({ ids }: { ids: SoundId[] }) {
  return (
    <span className="mini-icons" aria-hidden="true">
      {ids.map((id) => (
        <Icon key={id} name={id} />
      ))}
    </span>
  );
}

export function Scenes() {
  const { t } = useLocale();
  const store = useStore();
  return (
    <section className="section" aria-labelledby="scenes-title">
      <div className="section-head">
        <h2 id="scenes-title">{t.sections.scenes}</h2>
      </div>
      <ul className="scenes">
        {scenes.map((scene) => {
          const ids = Object.keys(scene.levels) as SoundId[];
          const name = t.scenes[scene.id];
          return (
            <li key={scene.id}>
              <button
                type="button"
                className="scene"
                data-scene={scene.id}
                aria-pressed={store.scene?.id === scene.id}
                style={swatch(ids)}
                onClick={() => store.loadScene(scene, name)}
              >
                <SoundIcons ids={ids} />
                <span className="scene-name">{name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function SavedMixes() {
  const { t } = useLocale();
  const store = useStore();
  return (
    <section className="section" aria-labelledby="saved-title">
      <div className="section-head">
        <h2 id="saved-title">{t.sections.saved}</h2>
      </div>
      {store.saved.length === 0 ? (
        <p className="empty">{t.saved.empty}</p>
      ) : (
        <ul className="saved">
          {store.saved.map((entry) => {
            const ids = Object.keys(entry.levels) as SoundId[];
            const current = store.savedMatch?.id === entry.id;
            return (
              <li key={entry.id} className="saved-item" data-current={current || undefined}>
                <button
                  type="button"
                  className="saved-load"
                  style={swatch(ids)}
                  aria-label={t.saved.play(entry.name)}
                  onClick={() => store.loadSaved(entry)}
                >
                  <span className="saved-name">{entry.name}</span>
                  <SoundIcons ids={ids} />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={t.saved.delete(entry.name)}
                  onClick={() => store.deleteSaved(entry)}
                >
                  <Icon name="trash" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
