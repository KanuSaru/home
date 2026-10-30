"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { L } from "@/content/site";

export type Lang = "en" | "es";

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

// English by default; a visitor's choice is remembered in their browser.
export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "en" || saved === "es") setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {}
  }, []);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

/** Returns a translator: t(text) or t(text, { n: 3 }) fills {n}. */
export function useT() {
  const { lang } = useLang();
  return useCallback(
    (text: L, vars?: Record<string, string | number>) => {
      let out = text[lang];
      if (vars) for (const [k, v] of Object.entries(vars)) out = out.replace(`{${k}}`, String(v));
      return out;
    },
    [lang],
  );
}
