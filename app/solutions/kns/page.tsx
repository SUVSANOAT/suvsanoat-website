import type { Metadata } from "next";

import SolutionPage from "../SolutionPage";
import content from "./content";

export const metadata: Metadata = {
  title: "КНС для дома и посёлка — корпус из стеклопластика | SUVSANOAT",
  description: "Канализационная насосная станция: корпус, направляющие и обвязка собственного производства, насосы по подбору. Полезный объём по частоте пусков, глубина под отметку коллектора, всегда два насоса. Ташкент.",
  alternates: { canonical: "/solutions/kns" },
  openGraph: {
    title: "КНС из стеклопластика | SUVSANOAT",
    description: "Канализационная насосная станция: корпус, направляющие и обвязка собственного производства, насосы по подбору. Полезный объём по частоте пусков, глубина под отметку коллектора, всегда два насоса. Ташкент.",
    url: "https://suvsanoat.uz/solutions/kns",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630, alt: "КНС из стеклопластика | SUVSANOAT" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "КНС из стеклопластика | SUVSANOAT",
    description: "Канализационная насосная станция: корпус, направляющие и обвязка собственного производства, насосы по подбору. Полезный объём по частоте пусков, глубина под отметку коллектора, всегда два насоса. Ташкент.",
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
