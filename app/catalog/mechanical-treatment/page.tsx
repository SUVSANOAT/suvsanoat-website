import type { Metadata } from "next";
import CategoryPage from "../CategoryPage";
import content, { icons } from "./content";

export const metadata: Metadata = {
  title: "Механическая очистка сточных вод в Узбекистане | SUVSANOAT",

  description:
    "Оборудование для механической очистки сточных вод в Узбекистане: механические, барабанные и шнековые решётки, песколовки, жироуловители, нефтеуловители и компакторы отходов.",

  alternates: {
    canonical: "/catalog/mechanical-treatment",
  },

  openGraph: {
    title: "Механическая очистка сточных вод | SUVSANOAT",
    description:
      "Решётки, песколовки, жироуловители, нефтеуловители, транспортёры и оборудование предварительной механической очистки сточных вод.",
    url: "https://suvsanoat.uz/catalog/mechanical-treatment",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/mechanical-treatment-og.jpg",
        width: 1200,
        height: 630,
        alt: "Оборудование механической очистки сточных вод SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Механическая очистка сточных вод | SUVSANOAT",
    description:
      "Оборудование предварительной механической очистки промышленных и коммунальных сточных вод.",
    images: ["/mechanical-treatment-og.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function MechanicalTreatmentPage() {
  return <CategoryPage content={content} icons={icons} image="/mechanical-treatment.png" />;
}
