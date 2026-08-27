import type { Metadata } from "next";
import CategoryPage from "../CategoryPage";
import content from "./content";

export const metadata: Metadata = {
  title: "Аэрационное оборудование для очистных сооружений в Узбекистане",

  description:
    "Аэрационное оборудование SUVSANOAT в Узбекистане: дисковые и трубчатые диффузоры, мембранные аэраторы, воздуходувки, аэрационные решётки и автоматизация систем аэрации очистных сооружений.",

  alternates: {
    canonical: "/catalog/aeration-equipment",
  },

  openGraph: {
    title: "Аэрационное оборудование для очистных сооружений | SUVSANOAT",
    description:
      "Диффузоры, аэраторы, воздуходувки и комплексные системы аэрации для биологической очистки сточных вод.",
    url: "https://suvsanoat.uz/catalog/aeration-equipment",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/aeration-equipment-og.jpg",
        width: 1200,
        height: 630,
        alt: "Аэрационное оборудование для очистных сооружений SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Аэрационное оборудование для очистных сооружений | SUVSANOAT",
    description:
      "Дисковые и трубчатые диффузоры, мембранные аэраторы, воздуходувки и системы аэрации сточных вод.",
    images: ["/aeration-equipment-og.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function AerationEquipmentPage() {
  return <CategoryPage content={content} image="/aeration-equipment.png" />;
}
