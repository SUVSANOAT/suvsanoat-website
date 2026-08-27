import type { Metadata } from "next";
import CategoryPage from "../CategoryPage";
import content from "./content";

export const metadata: Metadata = {
  title: "Насосное оборудование в Узбекистане — насосы, КНС и станции",

  description:
    "Насосное оборудование SUVSANOAT в Узбекистане: канализационные, дренажные, центробежные и многоступенчатые насосы, КНС и насосные станции. Инженерный подбор по расходу и напору.",

  alternates: {
    canonical: "/catalog/pump-equipment",
  },

  openGraph: {
    title: "Насосное оборудование, насосы и КНС | SUVSANOAT",
    description:
      "Промышленные насосы, канализационные насосные станции и КНС для очистных сооружений, водоснабжения и водоподготовки.",
    url: "https://suvsanoat.uz/catalog/pump-equipment",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/pump-equipment-og.jpg",
        width: 1200,
        height: 630,
        alt: "Насосное оборудование, насосы и КНС SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Насосное оборудование, насосы и КНС | SUVSANOAT",
    description:
      "Канализационные и промышленные насосы, насосные станции и КНС для воды и сточных вод.",
    images: ["/pump-equipment-og.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function PumpEquipmentPage() {
  return <CategoryPage content={content} image="/pump-equipment.png" />;
}
