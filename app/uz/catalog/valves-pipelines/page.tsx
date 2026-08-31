import type { Metadata } from "next";

import CategoryPage from "../../../catalog/CategoryPage";
import content, { icons } from "../../../catalog/valves-pipelines/content";

/** Узбекская версия страницы каталога /catalog/valves-pipelines. */

const c = content.uz;

export const metadata: Metadata = {
  title: `${c.heroTitle.replace(/\n/g, " ")} | SUVSANOAT`,
  description: c.heroText,
  alternates: {
    canonical: "/uz/catalog/valves-pipelines",
    languages: {
      ru: "/catalog/valves-pipelines",
      uz: "/uz/catalog/valves-pipelines",
      "x-default": "/catalog/valves-pipelines",
    },
  },
  openGraph: {
    title: `${c.heroTitle.replace(/\n/g, " ")} | SUVSANOAT`,
    description: c.heroText,
    url: "https://suvsanoat.uz/uz/catalog/valves-pipelines",
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
  return <CategoryPage content={content} icons={icons} image="/valves-pipelines.png" />;
}
