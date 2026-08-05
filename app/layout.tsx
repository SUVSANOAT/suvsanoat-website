import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://suvsanoat.uz"),

  title: {
    default: "SUVSANOAT — Очистка воды и сточных вод",
    template: "%s | SUVSANOAT",
  },

  description:
    "SUVSANOAT — проектирование, производство, поставка и монтаж систем очистки сточных вод и водоподготовки в Узбекистане. Промышленные очистные сооружения, MBR, SBR, MBBR, DAF, UF, RO и инженерное оборудование.",

  keywords: [
    "SUVSANOAT",

    // Русский
    "очистные сооружения",
    "очистные сооружения Узбекистан",
    "очистка сточных вод",
    "очистка сточных вод Узбекистан",
    "водоподготовка",
    "водоподготовка Узбекистан",
    "водоочистка",
    "водоочистка Узбекистан",
    "промышленные очистные сооружения",
    "канализационные очистные сооружения",
    "локальные очистные сооружения",
    "оборудование для очистки воды",
    "оборудование для очистки сточных вод",
    "станция очистки сточных вод",
    "проектирование очистных сооружений",
    "строительство очистных сооружений",

    // Узбекский
    "oqova suvlarni tozalash",
    "oqova suv tozalash inshootlari",
    "suv tozalash",
    "suv tozalash uskunalari",
    "O'zbekistonda oqova suvlarni tozalash",
    "O'zbekistonda suv tozalash",

    // English
    "wastewater treatment Uzbekistan",
    "water treatment Uzbekistan",
    "wastewater treatment plant",
    "industrial wastewater treatment",
    "water treatment equipment",

    // Технологии
    "MBR",
    "SBR",
    "MBBR",
    "ANBR",
    "DAF",
    "UF",
    "RO",
    "обратный осмос",
    "ультрафильтрация",
    "мембранная очистка воды",
    "биологическая очистка сточных вод",

    // Оборудование
    "насосное оборудование",
    "аэрационное оборудование",
    "хлораторное оборудование",
    "дозирующее оборудование",
    "обработка осадка",
    "автоматизация очистных сооружений",
  ],

  authors: [
    {
      name: "SUVSANOAT",
      url: "https://suvsanoat.uz",
    },
  ],

  creator: "SUVSANOAT",
  publisher: "SUVSANOAT",

  category: "Water and Wastewater Engineering",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "ru_RU",

    url: "https://suvsanoat.uz",
    siteName: "SUVSANOAT",

    title: "SUVSANOAT — Очистка воды и сточных вод в Узбекистане",

    description:
      "Проектирование, производство, поставка, монтаж и запуск систем очистки воды и сточных вод в Узбекистане.",

    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SUVSANOAT — очистка воды и сточных вод в Узбекистане",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "SUVSANOAT — Очистка воды и сточных вод",

    description:
      "Проектирование, производство и поставка оборудования для очистки сточных вод и водоподготовки в Узбекистане.",

    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  // Яндекс Вебмастер
  verification: {
    yandex: "a9edbcbcfbe7d834",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",

    "@id": "https://suvsanoat.uz/#organization",

    name: "SUVSANOAT",

    url: "https://suvsanoat.uz",

    logo: {
      "@type": "ImageObject",
      url: "https://suvsanoat.uz/logo.png",
    },

    image: "https://suvsanoat.uz/og-image.jpg",

    description:
      "SUVSANOAT — инженерные системы очистки воды и сточных вод в Узбекистане. Проектирование, производство, поставка, монтаж, пусконаладка и сервис.",

    email: "mailto:suvsanoat@gmail.com",

    telephone: "+998773043400",

    areaServed: [
      {
        "@type": "Country",
        name: "Uzbekistan",
      },
    ],

    sameAs: ["https://t.me/suvsanoat"],

    knowsAbout: [
      "Очистка сточных вод",
      "Водоподготовка",
      "Промышленные очистные сооружения",
      "Канализационные очистные сооружения",
      "Биологическая очистка сточных вод",
      "MBR",
      "SBR",
      "MBBR",
      "A/O",
      "A2/O",
      "ANBR",
      "DAF",
      "Ультрафильтрация",
      "Обратный осмос",
      "Дезинфекция воды",
      "Хлорирование",
      "Аэрационное оборудование",
      "Насосное оборудование",
      "Обработка осадка",
      "Автоматизация очистных сооружений",
      "Повторное использование воды",
    ],

    contactPoint: [
      {
        "@type": "ContactPoint",

        telephone: "+998773043400",

        email: "suvsanoat@gmail.com",

        contactType: "sales",

        areaServed: "UZ",

        availableLanguage: ["Russian", "Uzbek", "English"],
      },
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",

    "@id": "https://suvsanoat.uz/#website",

    url: "https://suvsanoat.uz",

    name: "SUVSANOAT",

    description:
      "Очистка воды и сточных вод, водоподготовка и инженерное оборудование в Узбекистане.",

    publisher: {
      "@id": "https://suvsanoat.uz/#organization",
    },

    inLanguage: ["ru", "uz", "en"],
  };

  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
      </head>

      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}