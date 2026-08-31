import type { Metadata } from "next";

import ProductsIndex from "../../products/ProductsIndex";
import { TEXT } from "../../products/data";

/** Узбекская версия страницы ассортимента. */

const c = TEXT.uz;

export const metadata: Metadata = {
  title: `${c.title.replace(/\n/g, " ")} | SUVSANOAT`,
  description: c.intro,
  alternates: {
    canonical: "/uz/products",
    languages: {
      ru: "/products",
      uz: "/uz/products",
      "x-default": "/products",
    },
  },
  openGraph: {
    title: `${c.title.replace(/\n/g, " ")} | SUVSANOAT`,
    description: c.intro,
    url: "https://suvsanoat.uz/uz/products",
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
  return <ProductsIndex />;
}
