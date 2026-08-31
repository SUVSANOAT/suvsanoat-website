"use client";

import { usePathname, useRouter } from "next/navigation";

import { useLanguage, UZ_PREFIX } from "../LanguageContext";
import { UZ_ROUTES } from "../uzRoutes";
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
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  /* Узбекская версия живёт на отдельных адресах /uz/..., остальные
     языки переключаются на месте. Если узбекского адреса для этой
     страницы нет, просто меняем язык, как раньше. */
  const onUz =
    pathname === UZ_PREFIX || pathname.startsWith(`${UZ_PREFIX}/`);

  const basePath = onUz ? pathname.slice(UZ_PREFIX.length) || "/" : pathname;

  const choose = (item: Language) => {
    if (item === "uz") {
      if (onUz) return;

      if (UZ_ROUTES.includes(basePath)) {
        router.push(basePath === "/" ? UZ_PREFIX : `${UZ_PREFIX}${basePath}`);
        return;
      }

      setLanguage("uz");
      return;
    }

    setLanguage(item);

    if (onUz) router.push(basePath);
  };

  return (
    <div className="langSwitch">
      {order.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => choose(item)}
          aria-label={languageNames[item]}
          className={language === item ? "active" : ""}
        >
          {languageNames[item]}
        </button>
      ))}
    </div>
  );
}
