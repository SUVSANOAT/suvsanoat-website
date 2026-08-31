import type { Metadata } from "next";

import CategoryPage from "../../../catalog/CategoryPage";
import content, { icons } from "../../../catalog/sludge-treatment/content";

/** Узбекская версия страницы каталога /catalog/sludge-treatment. */

const c = content.uz;

export const metadata: Metadata = {
  title: `${c.heroTitle.replace(/\n/g, " ")} | SUVSANOAT`,
  description: c.heroText,
  alternates: {
    canonical: "/uz/catalog/sludge-treatment",
    languages: {
      ru: "/catalog/sludge-treatment",
      uz: "/uz/catalog/sludge-treatment",
      "x-default": "/catalog/sludge-treatment",
    },
  },
  openGraph: {
    title: `${c.heroTitle.replace(/\n/g, " ")} | SUVSANOAT`,
    description: c.heroText,
    url: "https://suvsanoat.uz/uz/catalog/sludge-treatment",
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
  return <CategoryPage content={content} icons={icons} image="/sludge-treatment.png" />;
}
