import type { Metadata } from "next";

import NewHome from "../_home/NewHome";

/** Узбекская версия главной страницы. */

export const metadata: Metadata = {
  title: "SUVSANOAT — suv va oqova suvlarni tozalash tizimlari | O‘zbekiston",
  description: "SUVSANOAT — O‘zbekistonda oqova suvlarni tozalash va suv tayyorlash tizimlarini loyihalash, ishlab chiqarish, yetkazib berish, montaj va ishga tushirish. Tozalash inshootlari, KNS, yog‘ tutgichlar, neft tutgichlar, rezervuarlar, xloratorlar.",
  alternates: {
    canonical: "/uz",
    languages: {
      ru: "/",
      uz: "/uz",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "SUVSANOAT — suv va oqova suvlarni tozalash tizimlari | O‘zbekiston",
    description: "SUVSANOAT — O‘zbekistonda oqova suvlarni tozalash va suv tayyorlash tizimlarini loyihalash, ishlab chiqarish, yetkazib berish, montaj va ishga tushirish. Tozalash inshootlari, KNS, yog‘ tutgichlar, neft tutgichlar, rezervuarlar, xloratorlar.",
    url: "https://suvsanoat.uz/uz",
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
  return <NewHome />;
}
