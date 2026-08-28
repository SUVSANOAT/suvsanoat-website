import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  MODELS,
  LINE_SEO,
  LINE_SPECS,
  TEXT,
  findModel,
  modelSize,
  specValue,
} from "../data";
import ModelClient from "./ModelClient";

/**
 * Страница одной модели.
 *
 * Адреса и метаданные берутся из app/products/data.ts — добавили модель
 * в файл, страница появилась сама и попала в sitemap.xml.
 *
 * Название линейки берётся из LINE_SEO, а не пишется в коде: при
 * добавлении новой линейки заголовки и разметка меняются сами.
 */

export function generateStaticParams() {
  return MODELS.map((model) => ({ slug: model.slug }));
}

export const dynamicParams = false;

/** Русские подписи характеристик для разметки поисковых систем */
const LABELS: Record<string, string> = {
  q: "Расчётный расход",
  ns: "Номинальный расход NS",
  qd: "Расчётный расход",
  vol: "Номинальный объём",
  pe: "Эквивалентное число жителей",
  size: "Габариты",
  diameter: "Диаметр корпуса",
  depth: "Глубина корпуса",
  volumeGross: "Геометрический объём",
  volumeWork: "Рабочий объём",
  useful: "Полезный объём",
  vaer: "Объём аэротенка",
  retention: "Время пребывания",
  area: "Площадь сепарации",
  load: "Гидравлическая нагрузка",
  fat: "Объём накопления продукта",
  sludge: "Шламовая зона",
  air: "Расход воздуха",
  motor: "Мощность воздуходувки",
  rings: "Кольца жёсткости",
  pcr: "Критическое давление смятия",
  pumps: "Количество насосов",
  cl: "Активный хлор",
  saltd: "Расход соли",
  h2: "Выделение водорода",
  ventMin: "Вентиляция, не менее",
  tankSol: "Бак раствора",
  tankSalt: "Бак-сатуратор соли",
  laminate: "Толщина ламината",
  mass: "Масса сухая",
  dn: "Присоединение",
  hatches: "Количество люков",
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = findModel(slug);

  if (!model) return {};

  const seo = LINE_SEO[model.line];
  const size = modelSize(model);

  const title = `${seo.noun} ${size} ${model.code} — купить в Ташкенте`;

  /* Описание собирается из тех характеристик, которые у линейки есть:
     у резервуара нет времени пребывания, у КНС нет площади зеркала. */
  const dec = (value: number) => String(value).replace(".", ",");
  const part = (key: Parameters<typeof specValue>[1], label: string) => {
    const value = specValue(model, key, dec, "ru");
    return value ? `${label} ${value}` : null;
  };

  const details = [
    part("size", "габариты"),
    part("volumeWork", "рабочий объём"),
    part("useful", "полезный объём"),
    part("retention", "время пребывания"),
    part("dn", "присоединение"),
    part("mass", "масса"),
  ]
    .filter(Boolean)
    .join(", ");

  const description =
    `${seo.noun} ${model.code} — ${size}. ${details}. ` +
    `Корпус из стеклопластика, собственное производство в Узбекистане. ` +
    `Расчёт по нормам, полные характеристики и подбор типоразмера.`;

  return {
    title,
    description,
    alternates: { canonical: `/products/${model.slug}` },
    openGraph: {
      title: `${model.code} — ${seo.short} ${size} | SUVSANOAT`,
      description,
      url: `https://suvsanoat.uz/products/${model.slug}`,
      siteName: "SUVSANOAT",
      type: "website",
      locale: "ru_RU",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `${seo.noun} ${model.code} SUVSANOAT`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${model.code} — ${seo.short} ${size}`,
      description,
      images: ["/og-image.jpg"],
    },
    robots: { index: true, follow: true },
  };
}

export default async function ModelPage({ params }: Props) {
  const { slug } = await params;
  const model = findModel(slug);

  if (!model) notFound();

  const seo = LINE_SEO[model.line];
  const size = modelSize(model);

  /* Разметка для поисковых систем. Цена не публикуется, поэтому блок
     предложения не указывается — карточка индексируется и без него. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${seo.noun} ${model.code}`,
    sku: model.code,
    category: seo.category,
    description: `${seo.noun} ${model.code}, ${size}.`,
    brand: { "@type": "Brand", name: "SUVSANOAT" },
    manufacturer: {
      "@type": "Organization",
      name: "SUVSANOAT",
      url: "https://suvsanoat.uz",
    },
    material: seo.material,
    weight: {
      "@type": "QuantitativeValue",
      value: model.mass,
      unitCode: "KGM",
    },
    ...(model.width !== undefined && model.height !== undefined
      ? {
          width: {
            "@type": "QuantitativeValue",
            value: model.width,
            unitCode: "MMT",
          },
          height: {
            "@type": "QuantitativeValue",
            value: model.height,
            unitCode: "MMT",
          },
        }
      : {}),
    depth: {
      "@type": "QuantitativeValue",
      value: model.length,
      unitCode: "MMT",
    },
    additionalProperty: LINE_SPECS[model.line].spec
      .map((key) => ({
        key,
        value: specValue(model, key, (v: number) => String(v).replace(".", ","), "ru"),
      }))
      .filter((row) => row.value)
      .map((row) => ({
        "@type": "PropertyValue",
        name:
          TEXT.ru.lines[model.line].labels?.[row.key] ??
          LABELS[row.key] ??
          row.key,
        value: row.value,
      })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ModelClient model={model} />
    </>
  );
}
