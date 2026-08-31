import type { Metadata } from "next";

import WastewaterContent from "../../../catalog/wastewater/WastewaterContent";

/** Узбекская версия страницы /catalog/wastewater. */

export const metadata: Metadata = {
  title: "Oqova suvlarni tozalash inshootlari — Toshkent va O‘zbekiston | SUVSANOAT",
  description: "Toshkent va butun O‘zbekiston bo‘ylab oqova suvlarni tozalash inshootlari: loyihalash, ishlab chiqarish, yetkazib berish va montaj. Maishiy va sanoat oqava suvlari, MBR, SBR, MBBR, A/O, A²/O.",
  alternates: {
    canonical: "/uz/catalog/wastewater",
    languages: {
      ru: "/catalog/wastewater",
      uz: "/uz/catalog/wastewater",
      "x-default": "/catalog/wastewater",
    },
  },
  openGraph: {
    title: "Oqova suvlarni tozalash inshootlari — Toshkent va O‘zbekiston | SUVSANOAT",
    description: "Toshkent va butun O‘zbekiston bo‘ylab oqova suvlarni tozalash inshootlari: loyihalash, ishlab chiqarish, yetkazib berish va montaj. Maishiy va sanoat oqava suvlari, MBR, SBR, MBBR, A/O, A²/O.",
    url: "https://suvsanoat.uz/uz/catalog/wastewater",
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
  return (
    <main className="wwPage">
      <WastewaterContent />
    </main>
  );
}
