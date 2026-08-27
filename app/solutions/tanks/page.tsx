import type { Metadata } from "next";

import SolutionPage from "../SolutionPage";
import content from "./content";

export const metadata: Metadata = {
  title: "Резервуар из стеклопластика 1–50 м³ — производство в Ташкенте",
  description: "Ёмкости для воды и стоков: усреднители, накопители, пожарный запас. Кольца жёсткости на всём ряду, расчёт анкеровки от всплытия, гидроиспытание каждого корпуса. Намотка в Ташкенте, объёмы 1–50 м³.",
  alternates: { canonical: "/solutions/tanks" },
  openGraph: {
    title: "Резервуары из стеклопластика | SUVSANOAT",
    description: "Ёмкости для воды и стоков: усреднители, накопители, пожарный запас. Кольца жёсткости на всём ряду, расчёт анкеровки от всплытия, гидроиспытание каждого корпуса. Намотка в Ташкенте, объёмы 1–50 м³.",
    url: "https://suvsanoat.uz/solutions/tanks",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630, alt: "Резервуары из стеклопластика | SUVSANOAT" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Резервуары из стеклопластика | SUVSANOAT",
    description: "Ёмкости для воды и стоков: усреднители, накопители, пожарный запас. Кольца жёсткости на всём ряду, расчёт анкеровки от всплытия, гидроиспытание каждого корпуса. Намотка в Ташкенте, объёмы 1–50 м³.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  /* Разметка вопросов и ответов для поисковых систем — из русской версии */
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.ru.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <SolutionPage content={content} />
    </>
  );
}
