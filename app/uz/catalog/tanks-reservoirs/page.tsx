import type { Metadata } from "next";

import CategoryPage from "../../../catalog/CategoryPage";
import content, { icons } from "../../../catalog/tanks-reservoirs/content";

/** Узбекская версия страницы каталога /catalog/tanks-reservoirs. */

const c = content.uz;

export const metadata: Metadata = {
  title: `${c.heroTitle.replace(/\n/g, " ")} | SUVSANOAT`,
  description: c.heroText,
  alternates: {
    canonical: "/uz/catalog/tanks-reservoirs",
    languages: {
      ru: "/catalog/tanks-reservoirs",
      uz: "/uz/catalog/tanks-reservoirs",
      "x-default": "/catalog/tanks-reservoirs",
    },
  },
  openGraph: {
    title: `${c.heroTitle.replace(/\n/g, " ")} | SUVSANOAT`,
    description: c.heroText,
    url: "https://suvsanoat.uz/uz/catalog/tanks-reservoirs",
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
  return <CategoryPage content={content} icons={icons} image="/tanks-reservoirs.png" />;
}
