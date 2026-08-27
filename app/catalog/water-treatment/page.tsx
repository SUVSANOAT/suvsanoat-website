import type { Metadata } from "next";
import WaterTreatmentContent from "./WaterTreatmentContent";

export const metadata: Metadata = {
  title: "Водоподготовка в Узбекистане — системы очистки воды",
  description:
    "SUVSANOAT проектирует и поставляет системы водоподготовки в Узбекистане. Обратный осмос RO, ультрафильтрация UF, умягчение, фильтрация, обезжелезивание, деминерализация и дозирование реагентов.",
  alternates: { canonical: "/catalog/water-treatment" },
  openGraph: {
    title: "Водоподготовка в Узбекистане | SUVSANOAT",
    description:
      "Промышленные системы водоподготовки и очистки воды: RO, UF, фильтрация, умягчение, обезжелезивание и деминерализация.",
    url: "https://suvsanoat.uz/catalog/water-treatment",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [{ url: "/water-treatment-og.jpg", width: 1200, height: 630, alt: "Промышленная водоподготовка SUVSANOAT" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Водоподготовка в Узбекистане | SUVSANOAT",
    description: "Проектирование и поставка промышленных систем очистки и подготовки воды.",
    images: ["/water-treatment-og.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function WaterTreatmentPage() {
  return <WaterTreatmentContent />;
}
