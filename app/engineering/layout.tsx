import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Инженерный подбор системы очистки сточных вод",
  description:
    "Онлайн-подбор технологии и оборудования очистки сточных вод по нормам Узбекистана: КМК 2.04.01-98 и КМК 2.04.03-19. Расход, нагрузка, выбор технологии MBBR / SBR / MBR, спецификация оборудования.",
  alternates: { canonical: "/engineering" },
  openGraph: {
    title: "Инженерный подбор системы очистки сточных вод | SUVSANOAT",
    description:
      "Подбор технологии и оборудования по нормам Узбекистана — КМК 2.04.01-98 и КМК 2.04.03-19.",
    url: "https://suvsanoat.uz/engineering",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Инженерный подбор SUVSANOAT" }],
  },
  robots: { index: true, follow: true },
};

export default function EngineeringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
