import type { Metadata } from "next";
import CategoryPage from "../CategoryPage";
import content from "./content";

export const metadata: Metadata = {
  title: "Технологии очистки сточных вод — MBR, SBR, MBBR, DAF",

  description:
    "Технологии очистки сточных вод SUVSANOAT в Узбекистане: MBR, SBR, MBBR, A/O, A²/O, ANBR, DAF, UF и RO. Подбор технологии для промышленных и коммунальных очистных сооружений.",

  alternates: {
    canonical: "/catalog/treatment-technologies",
  },

  openGraph: {
    title: "Технологии очистки сточных вод | SUVSANOAT",
    description:
      "MBR, SBR, MBBR, A/O, A²/O, ANBR, DAF, ультрафильтрация и обратный осмос для промышленных и коммунальных очистных сооружений.",
    url: "https://suvsanoat.uz/catalog/treatment-technologies",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/treatment-technologies-og.jpg",
        width: 1200,
        height: 630,
        alt: "Технологии очистки сточных вод MBR SBR MBBR DAF SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Технологии очистки сточных вод | SUVSANOAT",
    description:
      "MBR, SBR, MBBR, A/O, A²/O, ANBR, DAF, UF и RO для очистки сточных вод.",
    images: ["/treatment-technologies-og.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function TreatmentTechnologiesPage() {
  return <CategoryPage content={content} image="/treatment-technologies.png" />;
}
