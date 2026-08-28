import type { Metadata } from "next";

import DesignersClient from "./DesignersClient";
import { DESIGNERS } from "./content";

const DESC =
  "Раздел для проектных организаций: расчётные основания по КМК и DWA, габаритные чертежи на каждой модели, опросные листы PDF и DOCX, КП с чертежом и массой для спецификации. Жироуловители, нефтеуловители, ЛОС, КНС, резервуары, электролизные установки. Производство в Ташкенте, нестандартные размеры под заказ.";

export const metadata: Metadata = {
  title: "Проектировщикам — заложить оборудование SUVSANOAT в проект | опросные листы, чертежи, расчёты",
  description: DESC,
  alternates: { canonical: "/designers" },
  openGraph: {
    title: "Проектировщикам | SUVSANOAT",
    description: DESC,
    url: "https://suvsanoat.uz/designers",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630, alt: "Проектировщикам | SUVSANOAT" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Проектировщикам | SUVSANOAT",
    description: DESC,
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  /* Разметка вопросов и ответов для поисковых систем — из русской версии */
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: DESIGNERS.ru.faq.map((item) => ({
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

      <DesignersClient />
    </>
  );
}
