import type { Metadata } from "next";
import ProductsIndex from "./ProductsIndex";

export const metadata: Metadata = {
  title: "Каталог оборудования — жироуловители, очистные сооружения",
  description:
    "Типоразмерные ряды оборудования SUVSANOAT: жироуловители 1, 2, 3, 5, 8 и 12 м³/ч из стеклопластика. Габариты, рабочий объём, время пребывания, присоединительные размеры. Собственное производство в Узбекистане.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Каталог оборудования SUVSANOAT",
    description:
      "Жироуловители и очистные сооружения собственного производства. Полные технические характеристики каждой модели.",
    url: "https://suvsanoat.uz/products",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Каталог оборудования SUVSANOAT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Каталог оборудования SUVSANOAT",
    description:
      "Жироуловители и очистные сооружения: полные технические характеристики.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function ProductsPage() {
  return <ProductsIndex />;
}
