"use client";

import { createContext, useCallback, useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { L } from "@/content/site";

export type Lang = "en" | "es";

/** The language a path is in: English at the root, Spanish under /es/. */
export function langOf(path: string): Lang {
  return /^\/es(\/|$)/.test(path) ? "es" : "en";
}

/** The same page in the other language: /work/ ↔ /es/work/. */
export function swapLang(path: string, to: Lang) {
  const bare = path.replace(/^\/es(?=\/|$)/, "") || "/";
  const withSlash = bare.endsWith("/") ? bare : `${bare}/`;
  return to === "es" ? `/es${withSlash}` : withSlash;
}

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

// The address decides the language, so search engines see each page in both:
// /work/ is English, /es/work/ is Spanish. A visitor's choice is remembered in their
// browser, and a page opened in the other language takes them to theirs.
export function LangProvider({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "/";
  const router = useRouter();
  const lang = langOf(path);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if ((saved === "en" || saved === "es") && saved !== lang) {
        router.replace(swapLang(path, saved) + window.location.hash);
      }
    } catch {}
    // only on arrival; after that the switch is the only thing that changes it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = useCallback(
    (l: Lang) => {
      try {
        localStorage.setItem("lang", l);
      } catch {}
      if (l !== lang) router.push(swapLang(path, l) + window.location.hash, { scroll: false });
    },
    [lang, path, router],
  );

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
