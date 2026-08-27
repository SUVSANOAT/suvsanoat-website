import type { Metadata } from "next";
import CategoryPage from "../CategoryPage";
import content from "./content";

export const metadata: Metadata = {
  title: "Дезинфекция воды и дозирование реагентов в Узбекистане",

  description:
    "Системы дезинфекции воды и дозирования реагентов SUVSANOAT: УФ-установки, гипохлорит натрия, электролизные установки, дозирующие насосы и автоматизация в Узбекистане.",

  alternates: {
    canonical: "/catalog/disinfection-dosing",
  },

  openGraph: {
    title: "Дезинфекция воды и дозирование реагентов | SUVSANOAT",
    description:
      "УФ-обеззараживание, хлорирование, электролизные установки, дозирующие насосы и автоматические станции дозирования реагентов.",
    url: "https://suvsanoat.uz/catalog/disinfection-dosing",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/disinfection-dosing-og.jpg",
        width: 1200,
        height: 630,
        alt: "Дезинфекция воды и дозирование реагентов SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Дезинфекция воды и дозирование реагентов | SUVSANOAT",
    description:
      "УФ-обеззараживание, гипохлорит натрия, электролиз и автоматическое дозирование реагентов.",
    images: ["/disinfection-dosing-og.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function DisinfectionDosingPage() {
  return <CategoryPage content={content} image="/disinfection-dosing.png" />;
}
