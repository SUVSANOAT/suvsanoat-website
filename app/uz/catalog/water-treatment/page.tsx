import type { Metadata } from "next";

import WaterTreatmentContent from "../../../catalog/water-treatment/WaterTreatmentContent";

/** Узбекская версия страницы /catalog/water-treatment. */

export const metadata: Metadata = {
  title: "Suv tayyorlash tizimlari — O‘zbekiston | SUVSANOAT",
  description: "O‘zbekistonda suv tayyorlash tizimlari: teskari osmos RO, ultrafiltratsiya UF, yumshatish, filtrlash, temirsizlantirish, demineralizatsiya va reagent dozalash.",
  alternates: {
    canonical: "/uz/catalog/water-treatment",
    languages: {
      ru: "/catalog/water-treatment",
      uz: "/uz/catalog/water-treatment",
      "x-default": "/catalog/water-treatment",
    },
  },
  openGraph: {
    title: "Suv tayyorlash tizimlari — O‘zbekiston | SUVSANOAT",
    description: "O‘zbekistonda suv tayyorlash tizimlari: teskari osmos RO, ultrafiltratsiya UF, yumshatish, filtrlash, temirsizlantirish, demineralizatsiya va reagent dozalash.",
    url: "https://suvsanoat.uz/uz/catalog/water-treatment",
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
  return <WaterTreatmentContent />;
}
