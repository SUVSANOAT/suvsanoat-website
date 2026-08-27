import type { Metadata } from "next";
import CategoryPage from "../CategoryPage";
import content from "./content";

export const metadata: Metadata = {
  title: "Очистные сооружения под ключ в Узбекистане | SUVSANOAT",

  description:
    "Очистные сооружения под ключ в Узбекистане: проектирование, подбор технологии, производство и поставка оборудования, монтаж, автоматизация, пусконаладка и сервис SUVSANOAT.",

  alternates: {
    canonical: "/catalog/integrated-solutions",
  },

  openGraph: {
    title: "Очистные сооружения под ключ в Узбекистане | SUVSANOAT",
    description:
      "Комплексные очистные сооружения и системы водоподготовки: проектирование, оборудование, поставка, монтаж, автоматизация и запуск.",
    url: "https://suvsanoat.uz/catalog/integrated-solutions",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/integrated-solutions-og.jpg",
        width: 1200,
        height: 630,
        alt: "Очистные сооружения под ключ в Узбекистане SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Очистные сооружения под ключ | SUVSANOAT",
    description:
      "Проектирование, комплектация, поставка, монтаж и запуск очистных сооружений в Узбекистане.",
    images: ["/integrated-solutions-og.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function IntegratedSolutionsPage() {
  return <CategoryPage content={content} image="/integrated-solutions.png" />;
}
