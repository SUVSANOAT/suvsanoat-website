import type { Metadata } from "next";

import CategoryPage from "../../../catalog/CategoryPage";
import content, { icons } from "../../../catalog/pump-equipment/content";

/** Узбекская версия страницы каталога /catalog/pump-equipment. */

const c = content.uz;

export const metadata: Metadata = {
  title: `${c.heroTitle.replace(/\n/g, " ")} | SUVSANOAT`,
  description: c.heroText,
  alternates: {
    canonical: "/uz/catalog/pump-equipment",
    languages: {
      ru: "/catalog/pump-equipment",
      uz: "/uz/catalog/pump-equipment",
      "x-default": "/catalog/pump-equipment",
    },
  },
  openGraph: {
    title: `${c.heroTitle.replace(/\n/g, " ")} | SUVSANOAT`,
    description: c.heroText,
    url: "https://suvsanoat.uz/uz/catalog/pump-equipment",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "uz_UZ",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SUVSANOAT",
      },
    ],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <CategoryPage content={content} icons={icons} image="/pump-equipment.png" />;
}
