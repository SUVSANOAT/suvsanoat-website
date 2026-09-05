import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Расчёт очистных сооружений онлайн по нормам Узбекистана",
  description:
    "Пошаговый расчёт очистных сооружений: расчётные расходы и коэффициенты неравномерности по ҚМҚ 2.04.03-19 (КМК 2.04.03-19, взамен КМК 2.04.03-97), органическая и азотная нагрузка, подбор технологии и спецификация оборудования. Бесплатно, без регистрации.",
  // Все шаги мастера — одна логическая страница, каноническая ссылка на вход
  alternates: { canonical: "/engineering/analysis" },
  openGraph: {
    title: "Расчёт очистных сооружений онлайн | SUVSANOAT",
    description:
      "Пошаговый инженерный расчёт по нормам Узбекистана: расход, нагрузка, технология, оборудование.",
    url: "https://suvsanoat.uz/engineering/analysis",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Расчёт очистных сооружений SUVSANOAT" }],
  },
  robots: { index: true, follow: true },
};

export default function AnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
