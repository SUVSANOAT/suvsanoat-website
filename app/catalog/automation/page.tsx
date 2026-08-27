import type { Metadata } from "next";
import CategoryPage from "../CategoryPage";
import content from "./content";

export const metadata: Metadata = {
  title: "Автоматизация очистных сооружений и водоподготовки в Узбекистане",

  description:
    "Автоматизация очистных сооружений и водоподготовки SUVSANOAT в Узбекистане: АСУ ТП, шкафы управления, PLC/ПЛК, SCADA, КИПиА, HMI, частотные преобразователи и удалённый мониторинг.",

  alternates: {
    canonical: "/catalog/automation",
  },

  openGraph: {
    title: "Автоматизация очистных сооружений и водоподготовки | SUVSANOAT",
    description:
      "АСУ ТП, шкафы управления, PLC/ПЛК, SCADA, КИПиА и автоматизация технологических процессов очистки сточных вод и водоподготовки.",
    url: "https://suvsanoat.uz/catalog/automation",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/automation-og.jpg",
        width: 1200,
        height: 630,
        alt: "Автоматизация очистных сооружений и шкафы управления SUVSANOAT",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Автоматизация очистных сооружений | SUVSANOAT",
    description:
      "АСУ ТП, PLC, SCADA, шкафы управления, КИПиА и автоматизация инженерных систем.",
    images: ["/automation-og.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function AutomationPage() {
  return <CategoryPage content={content} image="/automation.png" />;
}
