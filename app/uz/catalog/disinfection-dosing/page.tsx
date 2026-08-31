import type { Metadata } from "next";

import CategoryPage from "../../../catalog/CategoryPage";
import content, { icons } from "../../../catalog/disinfection-dosing/content";

/** Узбекская версия страницы каталога /catalog/disinfection-dosing. */

const c = content.uz;

export const metadata: Metadata = {
  title: `${c.heroTitle.replace(/\n/g, " ")} | SUVSANOAT`,
  description: c.heroText,
  alternates: {
    canonical: "/uz/catalog/disinfection-dosing",
    languages: {
      ru: "/catalog/disinfection-dosing",
      uz: "/uz/catalog/disinfection-dosing",
      "x-default": "/catalog/disinfection-dosing",
    },
  },
  openGraph: {
    title: `${c.heroTitle.replace(/\n/g, " ")} | SUVSANOAT`,
    description: c.heroText,
    url: "https://suvsanoat.uz/uz/catalog/disinfection-dosing",
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
  return <CategoryPage content={content} icons={icons} image="/disinfection-dosing.png" />;
}
