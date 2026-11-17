"use client";

import { useEffect, useId, useRef, useState } from "react";
import { sounds } from "@/lib/catalog";
import { locales } from "@/lib/i18n";
import { MAX_NAME } from "@/lib/storage";
import { TIMER_MINUTES, FADE_SECONDS, formatRemaining } from "@/lib/timer";
import { Icon } from "./icons";
import { useLocale } from "./locale";
import { useInstall, useOffline } from "./system";
import { useStore } from "./store";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * A native modal dialog: focus is trapped and returned, Escape closes it, and
 * the rest of the page is inert. Bottom sheet on phones, centred on desktop.
 */
export function Sheet({ open, onClose, title, className, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { t } = useLocale();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // showModal() focuses the first button; a form should start in its field.
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={className ? `sheet ${className}` : "sheet"}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        // A click on the dialog itself, not its content, is a click on the backdrop.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="sheet-body">
        <header className="sheet-head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="icon-button" aria-label={t.info.close} onClick={onClose}>
            <Icon name="close" />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}

export function TimerSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, locale } = useLocale();
  const store = useStore();
  const timer = store.timer;
  const endsAt = timer
    ? new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(timer.endsAt)
    : "";
  return (
    <Sheet open={open} onClose={onClose} title={t.timer.title}>
      <p className="sheet-intro">{t.timer.intro}</p>
      <div className="chips" role="group" aria-label={t.timer.title}>
        {TIMER_MINUTES.map((minutes) => (
          <button
            key={minutes}
            type="button"
            className="chip"
            aria-pressed={timer?.minutes === minutes}
            onClick={() => store.startTimer(minutes)}
          >
            {t.timer.minutes(minutes)}
          </button>
        ))}
        <button
          type="button"
          className="chip"
          aria-pressed={!timer}
          onClick={store.cancelTimer}
        >
          {t.timer.off}
        </button>
      </div>
      <p className="timer-status" aria-live="polite">
        {timer &&
          (store.remaining <= FADE_SECONDS * 1000
            ? t.timer.fading
            : `${t.timer.left(formatRemaining(store.remaining))} · ${t.timer.endsAt(endsAt)}`)}
      </p>
      <button type="button" className="button primary wide" onClick={onClose}>
        {t.timer.close}
      </button>
    </Sheet>
  );
}

export function SaveSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLocale();
  return (
    <Sheet open={open} onClose={onClose} title={t.save.title}>
      {/* Remounts on every open, so the field starts empty. */}
      {open && <SaveForm onDone={onClose} />}
    </Sheet>
  );
}

function SaveForm({ onDone }: { onDone: () => void }) {
  const { t } = useLocale();
  const store = useStore();
  const [name, setName] = useState("");
  const [problem, setProblem] = useState<keyof typeof t.save.errors | undefined>();
  const errorId = useId();
  return (
    <form
      className="save-form"
      onSubmit={(event) => {
        event.preventDefault();
        const result = store.saveMix(name);
        if (result) setProblem(result);
        else onDone();
      }}
    >
      <label className="field">
        <span>{t.save.label}</span>
        <input
          data-autofocus
          value={name}
          maxLength={MAX_NAME}
          placeholder={t.save.placeholder}
          aria-invalid={problem ? true : undefined}
          aria-describedby={problem ? errorId : undefined}
          onChange={(event) => {
            setName(event.currentTarget.value);
            setProblem(undefined);
          }}
        />
      </label>
      <p className="field-error" id={errorId} role="alert">
        {problem ? t.save.errors[problem] : ""}
      </p>
      <div className="sheet-actions">
        <button type="button" className="button" onClick={onDone}>
          {t.save.cancel}
        </button>
        <button type="submit" className="button primary">
          {t.save.submit}
        </button>
      </div>
    </form>
  );
}

export function InfoSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, locale, setLocale } = useLocale();
  const offline = useOffline(open);
  const install = useInstall();
  return (
    <Sheet open={open} onClose={onClose} title={t.info.title}>
      <p className="sheet-intro">{t.info.about}</p>

      <fieldset className="segmented">
        <legend>{t.app.language}</legend>
        {locales.map((code) => (
          <label key={code}>
            <input
              type="radio"
              name="locale"
              value={code}
              checked={locale === code}
              onChange={() => setLocale(code)}
            />
            <span>{code === "en" ? "English" : "Italiano"}</span>
          </label>
        ))}
      </fieldset>

      <h3>{t.info.offline}</h3>
      <p className="offline-status" data-state={offline}>
        {offline === "ready" && <Icon name="check" />}
        {offline === "ready"
          ? t.info.offlineReady
          : offline === "preparing"
            ? t.info.offlinePreparing
            : t.info.offlineUnavailable}
      </p>
      {install && (
        <button type="button" className="button" onClick={install}>
          <Icon name="download" />
          {t.info.install}
        </button>
      )}

      <h3>{t.info.credits}</h3>
      <ul className="credits">
        {sounds.map((sound) => (
          <li key={sound.id}>
            <span className="credit-name">{t.sounds[sound.id].name}</span>
            <span className="credit-source">
              {sound.kind === "generated" ? (
                t.info.synthesized
              ) : sound.credit.url ? (
                <a href={sound.credit.url} target="_blank" rel="noreferrer">
                  {sound.credit.author}
                </a>
              ) : (
                t.info.original
              )}{" "}
              ·{" "}
              {sound.credit.licenseUrl ? (
                <a href={sound.credit.licenseUrl} target="_blank" rel="noreferrer">
                  {sound.credit.license}
                </a>
              ) : (
                sound.credit.license
              )}
            </span>
          </li>
        ))}
      </ul>
      <p className="fine-print">{t.info.shortcuts}</p>
    </Sheet>
  );
}
