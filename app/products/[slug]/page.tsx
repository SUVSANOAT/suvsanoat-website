import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MODELS, LINE_SEO, findModel, modelSize } from "../data";
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

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = findModel(slug);

  if (!model) return {};

  const seo = LINE_SEO[model.line];
  const size = modelSize(model);

  const title = `${seo.noun} ${size} ${model.code} — купить в Ташкенте`;

  const description =
    `${seo.noun} ${model.code} производительностью ${size}. ` +
    `Габариты ${model.length} × ${model.width} × ${model.height} мм, ` +
    `рабочий объём ${model.volumeWork} м³, время пребывания ${model.retention} мин, ` +
    `присоединение DN${model.dn}, масса ${model.mass} кг. ` +
    `Корпус из стеклопластика, собственное производство в Узбекистане.`;

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
    description:
      `${seo.noun} производительностью ${size}, ` +
      `рабочий объём ${model.volumeWork} м³, время пребывания ${model.retention} мин.`,
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
    width: {
      "@type": "QuantitativeValue",
      value: model.width,
      unitCode: "MMT",
    },
    depth: {
      "@type": "QuantitativeValue",
      value: model.length,
      unitCode: "MMT",
    },
    height: {
      "@type": "QuantitativeValue",
      value: model.height,
      unitCode: "MMT",
    },
    additionalProperty: [
      ...(model.ns !== undefined
        ? [
            {
              "@type": "PropertyValue",
              name: "Номинальный расход NS",
              value: `${model.ns} л/с`,
            },
          ]
        : []),
      {
        "@type": "PropertyValue",
        name: "Расчётный расход",
        value: `${model.q} м³/ч`,
      },
      {
        "@type": "PropertyValue",
        name: "Рабочий объём",
        value: `${model.volumeWork} м³`,
      },
      {
        "@type": "PropertyValue",
        name: "Время пребывания",
        value: `${model.retention} мин`,
      },
      {
        "@type": "PropertyValue",
        name: "Присоединение",
        value: `DN${model.dn}`,
      },
    ],
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
