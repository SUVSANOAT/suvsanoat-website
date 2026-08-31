import type { Metadata } from "next";

import LinePage from "../../../products/LinePage";
import content from "../../../products/stantsiya-dozirovaniya/content";

/** Узбекская версия страницы модельного ряда /products/stantsiya-dozirovaniya. */

const c = content.uz;

export const metadata: Metadata = {
  title: `${c.title.replace(/\n/g, " ")} | SUVSANOAT`,
  description: c.intro,
  alternates: {
    canonical: "/uz/products/stantsiya-dozirovaniya",
    languages: {
      ru: "/products/stantsiya-dozirovaniya",
      uz: "/uz/products/stantsiya-dozirovaniya",
      "x-default": "/products/stantsiya-dozirovaniya",
    },
  },
  openGraph: {
    title: `${c.title.replace(/\n/g, " ")} | SUVSANOAT`,
    description: c.intro,
    url: "https://suvsanoat.uz/uz/products/stantsiya-dozirovaniya",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "uz_UZ",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SUVSANOAT",
      },
    ],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faq.map((item) => ({
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

      <LinePage line="dosing" content={content} />
    </>
  );
}
