"use client";

/* ==================================================================
 * ЗНАК БРЕНДА НА ОТКРЫТЫХ СТРАНИЦАХ РАЗДЕЛА
 *
 * Шапка BrandHeader стоит только внутри расчётов — то есть после
 * входа. Но витрина раздела и страница входа открываются ДО входа,
 * и на отдельном адресе проектировщика они показывали чужое имя:
 * человек заходит по своей ссылке, а над формой написано SUVSANOAT.
 *
 * Здесь тот же источник, что и у шапки, — /api/brand. Он отвечает и
 * без входа: если у адреса есть свой бренд, отдаётся он, иначе наш.
 * Копий страниц под второй логотип не делается — разойдутся.
 *
 * Пока ответ не пришёл, место под знак держится пустым той же
 * высоты. Мигание чужим именем хуже, чем секунда пустоты.
 * ================================================================== */

import { CSSProperties, useState } from "react";
import { useBrand } from "./BrandHeader";

/** Слаг нашего собственного бренда — задан в lib/brands.ts. */
export const HOME_SLUG = "suvsanoat";

/**
 * Наш ли это адрес. Нужно там, где решение принимается до ответа
 * сервера: на чужом домене нельзя показывать нашу витрину даже на
 * долю секунды. Домены перечислены здесь прямо — их два, и оба наши;
 * всё остальное считается адресом заказчика.
 */
export function isOwnHost(): boolean {
  /* На сервере рисуется наш вариант: его читают поисковики нашего
     домена, и статическая страница должна остаться статической. */
  if (typeof window === "undefined") return true;
  const h = window.location.hostname.toLowerCase();
  return h === "suvsanoat.uz" || h === "www.suvsanoat.uz" || h === "localhost" || h.endsWith(".vercel.app");
}

export default function BrandMark({
  height = 34,
  showTitle = true,
  href,
}: {
  height?: number;
  showTitle?: boolean;
  href?: string;
}) {
  const brand = useBrand();
  /* Путь к файлу берётся из базы, и при вводе его никто не проверяет.
     Битая картинка выглядит хуже, чем её отсутствие. */
  const [logoOk, setLogoOk] = useState(true);

  const inner = (
    <span style={{ ...wrap, minHeight: height + 16 }}>
      {brand?.logo_url && logoOk && (
        <span style={plate}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brand.logo_url}
            alt={brand.title}
            style={{ height, width: "auto", display: "block" }}
            onError={() => setLogoOk(false)}
          />
        </span>
      )}
      {showTitle && brand && <span style={title}>{brand.title}</span>}
    </span>
  );

  if (!href) return inner;
  return (
    <a href={href} style={{ textDecoration: "none", color: "inherit" }} aria-label={brand?.title ?? ""}>
      {inner}
    </a>
  );
}

/** Имя бренда строкой — для подписей вида «… ENGINEERING AI». */
export function useBrandTitle(): string {
  return useBrand()?.title ?? "";
}

/**
 * Наш ли это бренд. На чужом бланке заявка на доступ не нужна:
 * логины там выдаёт владелец лично. null — ответ ещё не пришёл.
 */
export function useIsHomeBrand(): boolean | null {
  const brand = useBrand();
  if (!brand) return null;
  return brand.slug === HOME_SLUG;
}

const wrap: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 12,
};
const plate: CSSProperties = {
  background: "#ffffff",
  borderRadius: 8,
  padding: "6px 10px",
  display: "inline-flex",
  alignItems: "center",
};
const title: CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  letterSpacing: "1.5px",
};
