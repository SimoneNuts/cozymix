"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { messages, pickLocale, type Locale, type Messages } from "@/lib/i18n";
import { KEYS } from "@/lib/storage";
import { readKey, writeKey } from "./persist";

type LocaleValue = { locale: Locale; t: Messages; setLocale: (locale: Locale) => void };

const LocaleContext = createContext<LocaleValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setState] = useState<Locale>(() =>
    pickLocale(readKey(KEYS.locale), navigator.languages ?? [navigator.language]),
  );
  const setLocale = useCallback((next: Locale) => {
    setState(next);
    writeKey(KEYS.locale, next);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const value = useMemo(() => ({ locale, t: messages[locale], setLocale }), [locale, setLocale]);
  return <LocaleContext value={value}>{children}</LocaleContext>;
}

export function useLocale(): LocaleValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale needs <LocaleProvider>");
  return value;
}
