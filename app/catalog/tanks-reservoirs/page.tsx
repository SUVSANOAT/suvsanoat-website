import type { Metadata } from "next";
import CategoryPage from "../CategoryPage";
import content from "./content";

export const metadata: Metadata = {
  title: "Резервуары и ёмкости для воды и сточных вод в Узбекистане",

  description:
    "Резервуары и ёмкости SUVSANOAT в Узбекистане для воды, сточных вод и реагентов. Накопительные, усреднительные и технологические резервуары для очистных сооружений и водоподготовки.",

  alternates: {
    canonical: "/catalog/tanks-reservoirs",
  },

  openGraph: {
    title: "Резервуары и ёмкости для воды и сточных вод | SUVSANOAT",
    description:
      "Накопительные, технологические и усреднительные резервуары для воды, сточных вод, реагентов и очистных сооружений.",
    url: "https://suvsanoat.uz/catalog/tanks-reservoirs",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/tanks-reservoirs-og.jpg",
        width: 1200,
        height: 630,
        alt: "Резервуары и ёмкости для воды и сточных вод SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Резервуары и ёмкости для воды и сточных вод | SUVSANOAT",
    description:
      "Резервуары для воды, сточных вод, реагентов, водоподготовки и очистных сооружений.",
    images: ["/tanks-reservoirs-og.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function TanksReservoirsPage() {
  return <CategoryPage content={content} image="/tanks-reservoirs.png" />;
}
