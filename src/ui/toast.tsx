"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocale } from "./locale";
import { Icon } from "./icons";

type Toast = { id: number; message: string; action?: { label: string; run: () => void } };
type Show = (toast: Omit<Toast, "id">) => void;

const ToastContext = createContext<Show>(() => {});
let nextId = 1;

/** One message at a time, bottom of the screen, with an optional action like Undo. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  const [toast, setToast] = useState<Toast | null>(null);
  const show = useCallback<Show>((value) => setToast({ ...value, id: nextId++ }), []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), toast.action ? 7000 : 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const value = useMemo(() => show, [show]);
  return (
    <ToastContext value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div className="toast" key={toast.id}>
            <span>{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  toast.action?.run();
                  setToast(null);
                }}
              >
                {toast.action.label}
              </button>
            )}
            <button
              type="button"
              className="icon-button"
              aria-label={t.toast.dismiss}
              onClick={() => setToast(null)}
            >
              <Icon name="close" />
            </button>
          </div>
        )}
      </div>
    </ToastContext>
  );
}

export function useToast(): Show {
  return useContext(ToastContext);
}
