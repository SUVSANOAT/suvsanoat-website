import type { Metadata } from "next";
import { headers } from "next/headers";

import { getBrandByHostCached } from "../../../lib/brands";
import { dbUrl } from "../../../lib/auth";

import BrandHeader from "../BrandHeader";
import EngineeringTheme from "../Theme";

const HOME: Metadata = {
  title: "Расчёт очистных сооружений онлайн по нормам Узбекистана",
  description:
    "Пошаговый расчёт очистных сооружений: расчётные расходы и коэффициенты неравномерности по ҚМҚ 2.04.03-19 (КМК 2.04.03-19, взамен КМК 2.04.03-97), органическая и азотная нагрузка, подбор технологии и спецификация оборудования. Бесплатно, без регистрации.",
  // Все шаги мастера — одна логическая страница, каноническая ссылка на вход
  alternates: { canonical: "/engineering/analysis" },
  openGraph: {
    title: "Расчёт очистных сооружений онлайн | SUVSANOAT",
    description:
      "Пошаговый инженерный расчёт по нормам Узбекистана: расход, нагрузка, технология, оборудование.",
    url: "https://suvsanoat.uz/engineering/analysis",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Расчёт очистных сооружений SUVSANOAT" }],
  },
  robots: { index: true, follow: true },
};

/* Заголовок страниц расчёта — под тем же именем, что и всё
   остальное. Страницы закрыты входом, но ссылку на расчёт человек
   пересылает коллеге, и в карточке не должно быть чужой конторы. */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const brand = dbUrl() ? await getBrandByHostCached((await headers()).get("host")) : null;
    if (!brand) return HOME;
    const name = (brand.full_name || "").split("\n").map((x) => x.trim()).filter(Boolean).join(" ") || brand.title;
    return {
      title: { absolute: name },
      description: brand.subtitle,
      authors: [{ name: brand.title }],
      creator: brand.title,
      publisher: brand.title,
      keywords: [],
      openGraph: { title: name, description: brand.subtitle, siteName: brand.title, type: "website" },
      twitter: { card: "summary", title: name, description: brand.subtitle },
      robots: { index: false, follow: false },
    };
  } catch {
    return HOME;
  }
}

/* ==================================================================
 * ШАПКА БРЕНДА — ОДНА НА ВЕСЬ РАЗДЕЛ
 *
 * Логотип ставится в раскладке, а не в каждой странице: страниц в
 * разделе полтора десятка, и вставленная в каждую шапка рано или
 * поздно разойдётся — где-то забудут, где-то поправят только в одной.
 *
 * Цвет задаёт EngineeringTheme — он же стоит на странице входа,
 * чтобы лист был один и тот же до входа и после.
 * ================================================================== */
export default function AnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EngineeringTheme>
      <div style={{ background: "var(--sv-bg)", paddingTop: 28 }}>
        <div style={{ width: "min(1150px, calc(100% - 32px))", margin: "0 auto" }}>
          <BrandHeader />
        </div>
      </div>
      {children}
    </EngineeringTheme>
  );
}
