import type { MetadataRoute } from "next";

import { MODELS } from "./products/data";
import { UZ_ROUTES } from "./uzRoutes";

const baseUrl = "https://suvsanoat.uz";

type Entry = {
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly";
};

const routes: Entry[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },

  // Инженерный подбор
  { path: "/engineering", priority: 0.95, changeFrequency: "monthly" },
  { path: "/engineering/analysis", priority: 0.95, changeFrequency: "monthly" },

  // Отраслевые решения
  { path: "/solutions/tashkent", priority: 0.95, changeFrequency: "weekly" },
  { path: "/solutions/samarkand", priority: 0.9, changeFrequency: "weekly" },
  { path: "/solutions/bukhara", priority: 0.9, changeFrequency: "weekly" },
  { path: "/solutions/fergana", priority: 0.9, changeFrequency: "weekly" },
  { path: "/solutions/namangan", priority: 0.9, changeFrequency: "weekly" },
  { path: "/solutions/navoi", priority: 0.9, changeFrequency: "weekly" },
  { path: "/solutions/car-wash", priority: 0.9, changeFrequency: "monthly" },
  { path: "/solutions/restaurant", priority: 0.9, changeFrequency: "monthly" },
  { path: "/solutions/gas-station", priority: 0.9, changeFrequency: "monthly" },
  { path: "/solutions/private-house", priority: 0.9, changeFrequency: "monthly" },
  { path: "/solutions/kns", priority: 0.85, changeFrequency: "monthly" },
  { path: "/solutions/tanks", priority: 0.85, changeFrequency: "monthly" },
  { path: "/solutions/hotel", priority: 0.85, changeFrequency: "monthly" },
  { path: "/solutions/food-industry", priority: 0.9, changeFrequency: "monthly" },
  { path: "/solutions/disinfection", priority: 0.85, changeFrequency: "monthly" },

  // Ассортимент
  { path: "/products", priority: 0.95, changeFrequency: "weekly" },

  // Модельные ряды
  { path: "/products/zhiroulovitel", priority: 0.95, changeFrequency: "weekly" },
  { path: "/products/nefteulovitel", priority: 0.95, changeFrequency: "weekly" },
  { path: "/products/peskolovka", priority: 0.9, changeFrequency: "weekly" },
  { path: "/products/los-bio", priority: 0.95, changeFrequency: "weekly" },
  { path: "/products/hlorator", priority: 0.95, changeFrequency: "weekly" },
  {
    path: "/products/stantsiya-dozirovaniya",
    priority: 0.9,
    changeFrequency: "weekly",
  },

  // Проектировщикам
  { path: "/designers", priority: 0.9, changeFrequency: "monthly" },

  // Каталог
  { path: "/catalog/wastewater", priority: 0.9, changeFrequency: "monthly" },
  { path: "/catalog/water-treatment", priority: 0.9, changeFrequency: "monthly" },
  { path: "/catalog/treatment-technologies", priority: 0.9, changeFrequency: "monthly" },
  { path: "/catalog/integrated-solutions", priority: 0.9, changeFrequency: "monthly" },
  { path: "/catalog/mechanical-treatment", priority: 0.8, changeFrequency: "monthly" },
  { path: "/catalog/pump-equipment", priority: 0.8, changeFrequency: "monthly" },
  { path: "/catalog/disinfection-dosing", priority: 0.8, changeFrequency: "monthly" },
  { path: "/catalog/sludge-treatment", priority: 0.8, changeFrequency: "monthly" },
  { path: "/catalog/aeration-equipment", priority: 0.8, changeFrequency: "monthly" },
  { path: "/catalog/tanks-reservoirs", priority: 0.8, changeFrequency: "monthly" },
  { path: "/catalog/automation", priority: 0.8, changeFrequency: "monthly" },
  { path: "/catalog/valves-pipelines", priority: 0.8, changeFrequency: "monthly" },
];

/** Страницы моделей берутся из ассортимента автоматически */
const productRoutes: Entry[] = MODELS.map((model) => ({
  path: `/products/${model.slug}`,
  priority: 0.9,
  changeFrequency: "monthly",
}));

/** Пара «русский адрес — узбекский адрес» для hreflang */
function pair(path: string) {
  return {
    ru: `${baseUrl}${path}`,
    uz: `${baseUrl}/uz${path}`,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  /* Русские страницы. У тех, где есть узбекская версия, указываем
     языковые альтернативы — так поисковик показывает нужный язык. */
  const ru = [...routes, ...productRoutes].map(
    ({ path, priority, changeFrequency }) => {
      const hasUz = UZ_ROUTES.includes(path === "" ? "/" : path);

      return {
        url: `${baseUrl}${path}`,
        lastModified,
        changeFrequency,
        priority,
        ...(hasUz ? { alternates: { languages: pair(path) } } : {}),
      };
    }
  );

  /* Узбекская ветка */
  const uz = UZ_ROUTES.map((route) => {
    const path = route === "/" ? "" : route;

    return {
      url: `${baseUrl}/uz${path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.85,
      alternates: { languages: pair(path) },
    };
  });

  return [...ru, ...uz];
}
