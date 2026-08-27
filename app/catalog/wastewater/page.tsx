import type { Metadata } from "next";
import WastewaterContent from "./WastewaterContent";

export const metadata: Metadata = {
  title: "Очистные сооружения в Ташкенте и Узбекистане | SUVSANOAT",
  description:
    "Очистные сооружения в Ташкенте и по Узбекистану. Проектирование, производство, поставка и монтаж систем очистки бытовых и промышленных сточных вод. MBR, SBR, MBBR, A/O, A²/O, ANBR.",
  alternates: {
    canonical: "/catalog/wastewater",
  },
  openGraph: {
    title: "Очистные сооружения в Ташкенте и Узбекистане | SUVSANOAT",
    description:
      "Проектирование, производство и монтаж очистных сооружений для бытовых и промышленных сточных вод в Ташкенте и по всему Узбекистану.",
    url: "https://suvsanoat.uz/catalog/wastewater",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/wastewater-treatment-og.jpg",
        width: 1200,
        height: 630,
        alt: "Очистные сооружения в Ташкенте и Узбекистане — SUVSANOAT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Очистные сооружения в Ташкенте и Узбекистане | SUVSANOAT",
    description:
      "Проектирование, производство и поставка систем очистки бытовых и промышленных сточных вод в Ташкенте и по Узбекистану.",
    images: ["/wastewater-treatment-og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function WastewaterPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Очистные сооружения и очистка сточных вод",
    description:
      "Проектирование, производство, поставка, монтаж и пусконаладка очистных сооружений для бытовых, коммунальных и промышленных сточных вод.",
    provider: {
      "@type": "Organization",
      name: "SUVSANOAT",
      url: "https://suvsanoat.uz",
    },
    areaServed: [
      { "@type": "City", name: "Ташкент" },
      { "@type": "Country", name: "Узбекистан" },
    ],
    serviceType: [
      "Очистные сооружения",
      "Очистка сточных вод",
      "Промышленные очистные сооружения",
      "Канализационные очистные сооружения",
      "Локальные очистные сооружения",
    ],
    url: "https://suvsanoat.uz/catalog/wastewater",
  };

  return (
    <main className="wwPage">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <WastewaterContent />
    </main>
  );
}
