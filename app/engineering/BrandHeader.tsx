"use client";

/* ==================================================================
 * ШАПКА РАЗДЕЛА ПОД БРЕНД ВОШЕДШЕГО
 *
 * Одна шапка на весь раздел. Логотип, название и цвет берутся не из
 * кода страницы, а из бренда пользователя: вошёл владелец — своё,
 * вошёл проектировщик по купленному доступу — его. Копии страниц под
 * второй логотип не делается: разойдутся.
 *
 * ЛОГОТИП НА БЕЛОЙ ПОДЛОЖКЕ
 *
 * Раздел тёмный, а фирменные знаки почти всегда тёмные на белом.
 * Вывернуть чужой логотип в белый нельзя — это уже не его знак.
 * Поэтому логотип ставится на белую скруглённую подложку, как на
 * бланке: и читается, и остаётся собой.
 *
 * СРОК ДОСТУПА ВИДЕН
 *
 * Справа — до какого числа открыт раздел. Не для красоты: человек
 * должен узнать об окончании заранее, а не в тот день, когда ему
 * нужно сдать расчёт.
 * ================================================================== */

import { CSSProperties, useEffect, useState } from "react";

export type Brand = {
  slug: string;
  title: string;
  subtitle: string;
  logo_url: string;
  accent: string;
  contact: string;
  active_until: string | null;
  daysLeft: number | null;
  login?: string;
};

export default function BrandHeader() {
  const [brand, setBrand] = useState<Brand | null>(null);
  /* Файл логотипа может не найтись — путь берётся из базы и его никто
     не проверяет при вводе. Битая картинка в шапке выглядит хуже, чем
     её отсутствие, поэтому при ошибке загрузки подложка убирается. */
  const [logoOk, setLogoOk] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/brand")
      .then((r) => r.json())
      .then((j: { ok: boolean; brand?: Brand }) => {
        if (alive && j.ok && j.brand) setBrand(j.brand);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!brand) return null;

  const soon = brand.daysLeft !== null && brand.daysLeft <= 30;

  return (
    <header style={{ ...wrap, borderColor: brand.accent }}>
      {brand.logo_url && logoOk && (
        <div style={plate}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={brand.logo_url} alt={brand.title} style={logo} onError={() => setLogoOk(false)} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ ...title, color: brand.accent }}>{brand.title}</div>
        {brand.subtitle && <div style={subtitle}>{brand.subtitle}</div>}
      </div>
      <div style={right}>
        {brand.login && <div style={meta}>Вход: {brand.login}</div>}
        {brand.active_until && (
          <div style={{ ...meta, color: soon ? "#ffcf8a" : "#5c7280" }}>
            Доступ до {new Date(brand.active_until).toLocaleDateString("ru-RU")}
            {brand.daysLeft !== null && brand.daysLeft >= 0 ? ` — осталось ${brand.daysLeft} дн.` : " — истёк"}
          </div>
        )}
        {brand.contact && <div style={meta}>{brand.contact}</div>}
      </div>
    </header>
  );
}

const wrap: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 18,
  flexWrap: "wrap",
  background: "#081b24",
  border: "1px solid #1c3742",
  borderLeftWidth: 4,
  borderRadius: 12,
  padding: "16px 20px",
  marginBottom: 22,
};
const plate: CSSProperties = {
  background: "#ffffff",
  borderRadius: 10,
  padding: "8px 12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const logo: CSSProperties = { height: 56, width: "auto", display: "block" };
const title: CSSProperties = { fontSize: 20, fontWeight: 800, letterSpacing: "1px" };
const subtitle: CSSProperties = { color: "#8ca4ad", fontSize: 13, marginTop: 4, lineHeight: 1.5 };
const right: CSSProperties = { textAlign: "right", minWidth: 180 };
const meta: CSSProperties = { color: "#5c7280", fontSize: 12, lineHeight: 1.8 };
