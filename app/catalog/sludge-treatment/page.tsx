import type { Metadata } from "next";
import CategoryPage from "../CategoryPage";
import content, { icons } from "./content";

export const metadata: Metadata = {
  title: "Обезвоживание осадка сточных вод в Узбекистане — оборудование",

  description:
    "Оборудование SUVSANOAT для обработки и обезвоживания осадка сточных вод в Узбекистане: шнековые обезвоживатели, фильтр-прессы, декантерные центрифуги, сгустители и полимерные станции.",

  alternates: {
    canonical: "/catalog/sludge-treatment",
  },

  openGraph: {
    title: "Обработка и обезвоживание осадка сточных вод | SUVSANOAT",
    description:
      "Шнековые обезвоживатели, фильтр-прессы, декантерные центрифуги и оборудование для обработки осадка очистных сооружений.",
    url: "https://suvsanoat.uz/catalog/sludge-treatment",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/sludge-treatment-og.jpg",
        width: 1200,
        height: 630,
        alt: "Оборудование для обработки и обезвоживания осадка сточных вод SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Обезвоживание осадка сточных вод | SUVSANOAT",
    description:
      "Оборудование для сгущения, кондиционирования и механического обезвоживания осадка очистных сооружений.",
    images: ["/sludge-treatment-og.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function SludgeTreatmentPage() {
  return <CategoryPage content={content} icons={icons} image="/sludge-treatment.png" />;
}
