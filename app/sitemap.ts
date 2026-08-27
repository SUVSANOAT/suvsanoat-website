import type { MetadataRoute } from "next";

import { MODELS } from "./products/data";

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
  { path: "/solutions/car-wash", priority: 0.9, changeFrequency: "monthly" },
  { path: "/solutions/restaurant", priority: 0.9, changeFrequency: "monthly" },
  { path: "/solutions/gas-station", priority: 0.9, changeFrequency: "monthly" },
  { path: "/solutions/private-house", priority: 0.9, changeFrequency: "monthly" },
  { path: "/solutions/kns", priority: 0.85, changeFrequency: "monthly" },
  { path: "/solutions/tanks", priority: 0.85, changeFrequency: "monthly" },

  // Ассортимент
  { path: "/products", priority: 0.95, changeFrequency: "weekly" },

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

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [...routes, ...productRoutes].map(
    ({ path, priority, changeFrequency }) => ({
      url: `${baseUrl}${path}`,
      lastModified,
      changeFrequency,
      priority,
    })
  );
}
