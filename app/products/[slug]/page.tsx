import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MODELS, findModel } from "../data";
import ModelClient from "./ModelClient";

/**
 * Страница одной модели.
 *
 * Адреса и метаданные берутся из app/products/data.ts — добавили модель
 * в файл, страница появилась сама и попала в sitemap.xml.
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

  const title = `Жироуловитель ${model.q} м³/ч ${model.code} — купить в Ташкенте`;

  const description =
    `Жироуловитель ${model.code} производительностью ${model.q} м³/ч. ` +
    `Габариты ${model.length} × ${model.width} × ${model.height} мм, ` +
    `рабочий объём ${model.volumeWork} м³, время пребывания ${model.retention} мин, ` +
    `присоединение DN${model.dn}, масса ${model.mass} кг. ` +
    `Корпус из стеклопластика, собственное производство в Узбекистане.`;

  return {
    title,
    description,
    alternates: { canonical: `/products/${model.slug}` },
    openGraph: {
      title: `${model.code} — жироуловитель ${model.q} м³/ч | SUVSANOAT`,
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
          alt: `Жироуловитель ${model.code} SUVSANOAT`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${model.code} — жироуловитель ${model.q} м³/ч`,
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

  /* Разметка для поисковых систем. Цена не публикуется, поэтому блок
     предложения не указывается — карточка индексируется и без него. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Жироуловитель ${model.code}`,
    sku: model.code,
    category: "Жироуловители",
    description:
      `Жироуловитель производительностью ${model.q} м³/ч, ` +
      `рабочий объём ${model.volumeWork} м³, время пребывания ${model.retention} мин.`,
    brand: { "@type": "Brand", name: "SUVSANOAT" },
    manufacturer: {
      "@type": "Organization",
      name: "SUVSANOAT",
      url: "https://suvsanoat.uz",
    },
    material: "Стеклопластик",
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
        name: "Площадь зеркала",
        value: `${model.area} м²`,
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
