"use client";

/* ==================================================================
 * ГЛАВНАЯ СТРАНИЦА НА АДРЕСЕ ЗАКАЗЧИКА
 *
 * Наша витрина раздела — рекламная: движущаяся сцена, рассказ о том,
 * как рождается проект, обещания. Она написана для того, кто ещё не
 * решил. На адресе проектного института этого ничего не нужно:
 * человек уже купил доступ, зашёл по своей ссылке и хочет считать.
 *
 * Поэтому здесь другой лист. Светлый, как бланк: имя учреждения по
 * центру под знаком, под ним перечень расчётов и вход. Никакой
 * анимации и никаких обещаний — титульный лист, а не реклама.
 *
 * ЧТО БЕРЁТСЯ ИЗ БАЗЫ, А ЧТО НАПИСАНО ЗДЕСЬ
 *
 * Знак, цвет и имя организации — из бренда: страница одна на всех
 * заказчиков, второй такой же под другой логотип не делается.
 * Полное наименование учреждения — из бренда (поле «подпись»), потому
 * что у каждого оно своё и с большой буквы до буквы.
 *
 * ОПИСАНИЕ И КОНТАКТЫ
 *
 * Блоки ниже пустые намеренно. Описание филиала и его телефоны —
 * сведения об организации, и придумывать их нельзя: неверный телефон
 * на официальной странице хуже, чем его отсутствие. Как только текст
 * дадут — он вписывается в ABOUT и CONTACTS, и блоки появляются сами.
 * ================================================================== */

import { CSSProperties, useState } from "react";
import { useRouter } from "next/navigation";
import type { Brand } from "./BrandHeader";

/* ---------- то, что заполняется по данным организации ---------- */

/** Наименование учреждения. Строки идут сверху вниз, как на бланке. */
const NAME_LINES: { text: string; style: "quoted" | "caps" | "plain" }[] = [
  { text: "“Kommunal loyiha ilmiy-tadqiqot instituti”", style: "quoted" },
  { text: "DAVLAT MUASSASASI", style: "caps" },
  { text: "G‘arbiy mintaqalararo filiali", style: "plain" },
];

/* Короткое описание филиала. Пусто — блок не показывается.
   Форма записи «null as …» не случайна: при обычной аннотации
   компилятор сводит тип константы к null, и обращение к полям внутри
   условия перестаёт проходить проверку типов. */
const ABOUT = null as { uz: string; ru: string } | null;

/** Контакты филиала. Пусто — блок не показывается. */
const CONTACTS: { label: string; value: string }[] = [];

/** Перечень расчётов. Подписи взяты из раздела, не сочинены заново. */
const TOOLS: { href: string; uz: string; ru: string }[] = [
  {
    href: "/engineering/analysis/pipeline",
    uz: "Bo‘ylama profil bo‘yicha suv quvuri (kengaytirilgan)",
    ru: "Водовод по продольному профилю (расширенный)",
  },
  {
    href: "/engineering/analysis/segment",
    uz: "Suv quvurining gidravlik hisobi: bosim, gidravlik zarba, himoya",
    ru: "Гидравлический расчёт водовода: напор, гидроудар, защита",
  },
  {
    href: "/engineering/analysis/water-network",
    uz: "Suv tarmog‘i: tupik va halqali",
    ru: "Водопроводная сеть: тупиковая и закольцованная",
  },
  {
    href: "/engineering/analysis/network",
    uz: "Tashqi tarmoqning gidravlik hisobi",
    ru: "Гидравлический расчёт наружной сети канализации",
  },
  {
    href: "/engineering/analysis/storm",
    uz: "Yomg‘ir kanalizatsiyasi hisobi",
    ru: "Расчёт дождевой канализации",
  },
  {
    href: "/engineering/analysis/industry",
    uz: "Oqava suvlarni tozalash: texnologiya va uskunalar tanlovi",
    ru: "Очистка сточных вод: выбор технологии и оборудования",
  },
  {
    href: "/engineering/analysis/audit",
    uz: "Boshqa loyihani ҚМҚ bo‘yicha tekshirish",
    ru: "Проверка чужого проекта по ҚМҚ",
  },
];

const DISCLAIMER = {
  uz: "Dastlabki natija ishchi loyiha hisoblanmaydi. Yakuniy yechimlar dastlabki ma’lumotlar muhandis tomonidan tekshirilgandan so‘ng qabul qilinadi.",
  ru: "Предварительный результат не является рабочим проектом. Окончательные решения принимаются после проверки исходных данных инженером.",
};

/* ---------- цвета бланка ---------- */

const PAPER = "#ffffff";
const INK = "#12222c";
const FAINT = "#63798a";
const RULE = "#dbe4ea";

export default function BrandLanding({ brand }: { brand: Brand }) {
  const router = useRouter();
  const [logoOk, setLogoOk] = useState(true);
  const accent = brand.accent || "#0273d1";

  return (
    <main style={page}>
      {/* ВЕРХНЯЯ ПОЛОСА: только вход. Ничего лишнего — страница
          закрыта, и первое действие здесь одно. */}
      <div style={{ ...topBar, borderColor: RULE }}>
        <span style={{ ...topMark, color: FAINT }}>{brand.contact}</span>
        <button type="button" onClick={() => router.push("/engineering/login")} style={{ ...loginBtn, background: accent }}>
          Kirish / Войти
        </button>
      </div>

      {/* ТИТУЛ: знак и наименование по центру */}
      <section style={title}>
        {brand.logo_url && logoOk && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={brand.logo_url} alt={brand.title} style={logo} onError={() => setLogoOk(false)} />
        )}

        <div style={{ ...rule, background: accent }} />

        {NAME_LINES.map((l) => (
          <div
            key={l.text}
            style={
              l.style === "quoted"
                ? { ...nameQuoted, color: INK }
                : l.style === "caps"
                  ? { ...nameCaps, color: accent }
                  : { ...namePlain, color: INK }
            }
          >
            {l.text}
          </div>
        ))}

        {ABOUT && (
          <p style={about}>
            {ABOUT.uz}
            <br />
            <span style={{ color: FAINT }}>{ABOUT.ru}</span>
          </p>
        )}
      </section>

      {/* ПЕРЕЧЕНЬ РАСЧЁТОВ */}
      <section style={section}>
        <div style={{ ...sectionLabel, color: accent }}>
          Muhandislik hisoblari <span style={{ color: FAINT }}>· Инженерные расчёты</span>
        </div>

        <ol style={list}>
          {TOOLS.map((t, i) => (
            <li key={t.href} style={{ ...row, borderColor: RULE }}>
              <a href={t.href} style={rowLink}>
                <span style={{ ...num, color: accent }}>{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span style={rowUz}>{t.uz}</span>
                  <span style={rowRu}>{t.ru}</span>
                </span>
                <span style={{ ...arrow, color: accent }}>→</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      {/* КОНТАКТЫ И ОГОВОРКА */}
      <footer style={{ ...footer, borderColor: RULE }}>
        {CONTACTS.length > 0 && (
          <div style={contacts}>
            {CONTACTS.map((c) => (
              <div key={c.label} style={{ marginBottom: 6 }}>
                <span style={{ color: FAINT, marginRight: 8 }}>{c.label}</span>
                <span>{c.value}</span>
              </div>
            ))}
          </div>
        )}

        <p style={note}>{DISCLAIMER.uz}</p>
        <p style={{ ...note, color: FAINT }}>{DISCLAIMER.ru}</p>
      </footer>
    </main>
  );
}

/* ---------- бланк ---------- */

const page: CSSProperties = {
  minHeight: "100vh",
  background: PAPER,
  color: INK,
  fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  padding: "0 24px 80px",
};
const topBar: CSSProperties = {
  maxWidth: 980,
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
  padding: "18px 0",
  borderBottom: "1px solid",
};
const topMark: CSSProperties = { fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase" };
const loginBtn: CSSProperties = {
  border: 0,
  borderRadius: 4,
  color: "#fff",
  padding: "11px 26px",
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: "0.04em",
  cursor: "pointer",
};
const title: CSSProperties = { maxWidth: 820, margin: "0 auto", padding: "64px 0 10px", textAlign: "center" };
const logo: CSSProperties = { height: 104, width: "auto", display: "block", margin: "0 auto 28px" };
const rule: CSSProperties = { width: 56, height: 3, margin: "0 auto 26px", borderRadius: 2 };
const nameQuoted: CSSProperties = {
  fontSize: "clamp(24px, 4vw, 36px)",
  fontWeight: 700,
  lineHeight: 1.25,
  letterSpacing: "-0.01em",
};
const nameCaps: CSSProperties = {
  fontSize: "clamp(13px, 1.7vw, 16px)",
  fontWeight: 800,
  letterSpacing: "0.26em",
  margin: "14px 0 10px",
};
const namePlain: CSSProperties = { fontSize: "clamp(15px, 2vw, 19px)", fontWeight: 500 };
const about: CSSProperties = { maxWidth: 680, margin: "26px auto 0", fontSize: 15, lineHeight: 1.7 };
const section: CSSProperties = { maxWidth: 980, margin: "0 auto", paddingTop: 64 };
const sectionLabel: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  marginBottom: 18,
};
const list: CSSProperties = { listStyle: "none", margin: 0, padding: 0, borderTop: `1px solid ${RULE}` };
const row: CSSProperties = { borderBottom: "1px solid" };
const rowLink: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 20,
  padding: "18px 4px",
  textDecoration: "none",
  color: "inherit",
};
const num: CSSProperties = { fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", minWidth: 28 };
const rowUz: CSSProperties = { display: "block", fontSize: 16, fontWeight: 600, lineHeight: 1.4 };
const rowRu: CSSProperties = { display: "block", fontSize: 13, color: FAINT, marginTop: 3, lineHeight: 1.4 };
const arrow: CSSProperties = { marginLeft: "auto", fontSize: 18 };
const footer: CSSProperties = { maxWidth: 980, margin: "56px auto 0", paddingTop: 26, borderTop: "1px solid" };
const contacts: CSSProperties = { fontSize: 14, lineHeight: 1.7, marginBottom: 22 };
const note: CSSProperties = { fontSize: 12.5, lineHeight: 1.65, margin: "0 0 6px", maxWidth: 780 };
