import type { Metadata } from "next";
import CategoryPage from "../CategoryPage";
import content, { icons } from "./content";

export const metadata: Metadata = {
  title: "Трубопроводная арматура и трубы в Узбекистане",

  description:
    "Трубопроводная арматура и трубы SUVSANOAT в Узбекистане: задвижки, дисковые затворы, обратные клапаны, шаровые краны, трубы, фитинги, компенсаторы и электроприводы.",

  alternates: {
    canonical: "/catalog/valves-pipelines",
  },

  openGraph: {
    title: "Трубопроводная арматура и трубы | SUVSANOAT",
    description:
      "Задвижки, дисковые затворы, клапаны, трубы, фитинги и комплектующие для водоснабжения, водоподготовки и очистных сооружений.",
    url: "https://suvsanoat.uz/catalog/valves-pipelines",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/valves-pipelines-og.jpg",
        width: 1200,
        height: 630,
        alt: "Трубопроводная арматура и трубы SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Трубопроводная арматура и трубы | SUVSANOAT",
    description:
      "Промышленная трубопроводная арматура, трубы и фитинги для инженерных систем.",
    images: ["/valves-pipelines-og.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function ValvesPipelinesPage() {
  return <CategoryPage content={content} icons={icons} image="/valves-pipelines.png" />;
}
