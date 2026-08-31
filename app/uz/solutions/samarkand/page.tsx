import type { Metadata } from "next";

import SolutionPage from "../../../solutions/SolutionPage";
import content from "../../../solutions/samarkand/content";

/** Узбекская версия страницы /solutions/samarkand. */

const c = content.uz;

export const metadata: Metadata = {
  title: `${c.title.replace(/\n/g, " ")} | SUVSANOAT`,
  description: c.intro,
  alternates: {
    canonical: "/uz/solutions/samarkand",
    languages: {
      ru: "/solutions/samarkand",
      uz: "/uz/solutions/samarkand",
      "x-default": "/solutions/samarkand",
    },
  },
  openGraph: {
    title: `${c.title.replace(/\n/g, " ")} | SUVSANOAT`,
    description: c.intro,
    url: "https://suvsanoat.uz/uz/solutions/samarkand",
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

      <SolutionPage content={content} />
    </>
  );
}
