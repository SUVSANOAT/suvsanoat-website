import type { Metadata } from "next";

import SolutionPage from "../SolutionPage";
import content from "./content";

export const metadata: Metadata = {
  title: "Очистные сооружения для гостиницы и базы отдыха | SUVSANOAT",
  description: "Канализация гостиницы, санатория, зоны отдыха: расчёт по номерам и кухне, усреднитель против утреннего пика, жироуловитель ресторана, модульные ЛОС до 500 м³/сут. Сезонный запуск, обеззараживание, полив территории. Производство в Ташкенте.",
  alternates: { canonical: "/solutions/hotel" },
  openGraph: {
    title: "Очистные для гостиниц и баз отдыха | SUVSANOAT",
    description: "Канализация гостиницы, санатория, зоны отдыха: расчёт по номерам и кухне, усреднитель против утреннего пика, жироуловитель ресторана, модульные ЛОС до 500 м³/сут. Сезонный запуск, обеззараживание, полив территории. Производство в Ташкенте.",
    url: "https://suvsanoat.uz/solutions/hotel",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630, alt: "Очистные для гостиниц и баз отдыха | SUVSANOAT" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Очистные для гостиниц и баз отдыха | SUVSANOAT",
    description: "Канализация гостиницы, санатория, зоны отдыха: расчёт по номерам и кухне, усреднитель против утреннего пика, жироуловитель ресторана, модульные ЛОС до 500 м³/сут. Сезонный запуск, обеззараживание, полив территории. Производство в Ташкенте.",
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
