import type { Metadata } from "next";
import ProductsIndex from "./ProductsIndex";

export const metadata: Metadata = {
  title: "Ассортимент оборудования из стеклопластика — SUVSANOAT",
  description:
    "Типоразмерные ряды SUVSANOAT: жироуловители 1–12 м³/ч, нефтеуловители и песколовки 1,5–20 л/с, резервуары 1–50 м³, КНС 5–100 м³/ч, локальные очистные сооружения 1–25 м³/сут. Корпуса из стеклопластика, полные технические характеристики по каждой модели. Собственное производство в Узбекистане.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Ассортимент SUVSANOAT",
    description:
      "Жироуловители, нефтеуловители, песколовки, резервуары, КНС и локальные очистные сооружения собственного производства.",
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
      "Шесть линеек оборудования из стеклопластика: полные технические характеристики.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function ProductsPage() {
  return <ProductsIndex />;
}
