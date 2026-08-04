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
    "SUVSANOAT — проектирование, производство, поставка и монтаж систем очистки сточных вод и водоподготовки. Промышленные очистные сооружения, MBR, SBR, MBBR, DAF, UF, RO и инженерное оборудование.",

  keywords: [
    "SUVSANOAT",
    "очистные сооружения",
    "очистка сточных вод",
    "водоподготовка",
    "очистные сооружения Узбекистан",
    "водоочистка Узбекистан",
    "промышленные очистные сооружения",
    "оборудование для очистки воды",
    "канализационные очистные сооружения",
    "MBR",
    "SBR",
    "MBBR",
    "DAF",
    "UF",
    "RO",
    "обратный осмос",
    "ультрафильтрация",
    "насосное оборудование",
    "аэрационное оборудование",
    "хлораторное оборудование",
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

    title: "SUVSANOAT — Очистка воды и сточных вод",

    description:
      "Инженерные системы очистки воды и сточных вод. Проектирование, производство, поставка, монтаж и запуск очистных сооружений.",

    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SUVSANOAT — инженерные системы очистки воды и сточных вод",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "SUVSANOAT — Очистка воды и сточных вод",

    description:
      "Проектирование, производство и поставка оборудования для очистки сточных вод и водоподготовки.",

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
      "SUVSANOAT — инженерные системы очистки воды и сточных вод. Проектирование, производство, поставка, монтаж, пусконаладка и сервис.",

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

        availableLanguage: ["Russian", "Uzbek"],
      },
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",

    "@id": "https://suvsanoat.uz/#website",

    url: "https://suvsanoat.uz",

    name: "SUVSANOAT",

    publisher: {
      "@id": "https://suvsanoat.uz/#organization",
    },

    inLanguage: "ru",
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