import type { Metadata } from "next";

import CarWashContent from "../../../solutions/car-wash/CarWashContent";

/** Узбекская версия страницы /solutions/car-wash. */

export const metadata: Metadata = {
  title:
    "Avtoyuvish suvini tozalash — aylanma suv ta’minoti | SUVSANOAT",
  description:
    "O‘zbekistonda avtoyuvishlar uchun oqava suvni tozalash va aylanma suv ta’minoti tizimlari: 5, 10, 20, 30 va 50 m³/sut. Loyihalash, ishlab chiqarish, montaj va ishga tushirish.",
  alternates: {
    canonical: "/uz/solutions/car-wash",
    languages: {
      ru: "/solutions/car-wash",
      uz: "/uz/solutions/car-wash",
      "x-default": "/solutions/car-wash",
    },
  },
  openGraph: {
    title: "Avtoyuvish suvini tozalash | SUVSANOAT",
    description:
      "Avtoyuvish oqavasini tozalash va aylanma suv ta’minoti: 5 dan 50 m³/sut gacha tayyor yechimlar.",
    url: "https://suvsanoat.uz/uz/solutions/car-wash",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "uz_UZ",
    images: [
      {
        url: "/car-wash-hero-og.jpg",
        width: 1200,
        height: 630,
        alt: "SUVSANOAT",
      },
    ],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <CarWashContent />;
}
