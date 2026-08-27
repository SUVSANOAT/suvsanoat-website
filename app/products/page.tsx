import type { Metadata } from "next";
import ProductsIndex from "./ProductsIndex";

export const metadata: Metadata = {
  title: "Ассортимент — жироуловители и нефтеуловители из стеклопластика",
  description:
    "Типоразмерные ряды SUVSANOAT: жироуловители 1–12 м³/ч и нефтеуловители 1,5–20 л/с из стеклопластика. Габариты, рабочий объём, время пребывания, эффективная площадь сепарации, присоединительные размеры и масса по каждой модели. Собственное производство в Узбекистане.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Ассортимент SUVSANOAT",
    description:
      "Жироуловители и нефтеуловители собственного производства. Полные технические характеристики каждой модели.",
    url: "https://suvsanoat.uz/products",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ассортимент SUVSANOAT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ассортимент SUVSANOAT",
    description:
      "Жироуловители и нефтеуловители: полные технические характеристики.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function ProductsPage() {
  return <ProductsIndex />;
}
