"use client";

import { useLanguage } from "../LanguageContext";
import type { Language } from "../translations";

const languageNames: Record<Language, string> = {
  ru: "RU",
  uz: "UZ",
  en: "EN",
  zh: "中文",
};

const order: Language[] = ["ru", "uz", "en", "zh"];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="langSwitch">
      {order.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLanguage(item)}
          aria-label={languageNames[item]}
          className={language === item ? "active" : ""}
        >
          {languageNames[item]}
        </button>
      ))}
    </div>
  );
}
