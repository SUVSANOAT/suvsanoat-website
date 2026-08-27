import type { Metadata } from "next";
import CarWashContent from "./CarWashContent";

export const metadata: Metadata = {
  title: "Очистка воды автомойки — оборотное водоснабжение в Узбекистане",
  description:
    "Системы очистки сточных вод и оборотного водоснабжения для автомоек в Узбекистане. Готовые решения 5, 10, 20, 30 и 50 м³/сутки. Проектирование, изготовление, монтаж и пусконаладка.",
  alternates: { canonical: "/solutions/car-wash" },
  openGraph: {
    title: "Очистка воды автомойки в Узбекистане | SUVSANOAT",
    description:
      "Очистка стоков и оборотное водоснабжение автомоек: 5, 10, 20, 30 и 50 м³/сутки. Под ключ.",
    url: "https://suvsanoat.uz/solutions/car-wash",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [{ url: "/car-wash-hero-og.jpg", width: 1200, height: 630, alt: "Очистка воды автомойки SUVSANOAT" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Очистка воды автомойки в Узбекистане | SUVSANOAT",
    description: "Оборотное водоснабжение автомоек: готовые решения от 5 до 50 м³/сутки.",
    images: ["/car-wash-hero-og.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function CarWashPage() {
  return <CarWashContent />;
}
