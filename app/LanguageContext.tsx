"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import { translations, type Language } from "./translations";

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (typeof translations)[Language];
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

/** Узбекская ветка сайта: /uz и всё, что под ним */
export const UZ_PREFIX = "/uz";

function forcedByPath(pathname: string | null): Language | null {
  if (!pathname) return null;

  return pathname === UZ_PREFIX || pathname.startsWith(`${UZ_PREFIX}/`)
    ? "uz"
    : null;
}

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  /* На узбекских адресах язык задаёт сам адрес, а не localStorage:
     иначе сервер отдаёт русскую разметку, и поисковик видит русскую
     версию страницы по узбекскому URL. */
  const forced = forcedByPath(pathname);

  const [stored, setStoredState] = useState<Language>("ru");
  const [mounted, setMounted] = useState(false);

  const language: Language = forced ?? stored;

  useEffect(() => {
    if (forced) {
      document.documentElement.lang = forced;
      setMounted(true);
      return;
    }

    const saved = localStorage.getItem("suvsanoat-language");

    if (
      saved === "ru" ||
      saved === "uz" ||
      saved === "en" ||
      saved === "zh"
    ) {
      setStoredState(saved);
      document.documentElement.lang = saved;
    }

    setMounted(true);
  }, [forced]);

  useEffect(() => {
    if (!mounted || forced) return;

    localStorage.setItem("suvsanoat-language", stored);
    document.documentElement.lang = stored;
  }, [stored, mounted, forced]);

  const setLanguage = (newLanguage: Language) => {
    setStoredState(newLanguage);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}
