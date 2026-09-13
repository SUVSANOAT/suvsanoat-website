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
 * ЯЗЫК ОДИН НА ВЕСЬ САЙТ
 *
 * Переключатель наверху не свой: он переключает тот же язык, что и
 * остальные страницы (LanguageContext, хранится у человека в
 * браузере). Выбрал узбекский здесь — узбекский останется и в
 * расчётах, и после перехода по ссылке. Отдельная память языка для
 * одной страницы разошлась бы с остальным сайтом в первый же день.
 *
 * Наименование учреждения не переводится и остаётся на узбекском при
 * любом выборе: официальное название госучреждения пишется так, как
 * оно записано в документах, а не так, как удобно читателю.
 * ================================================================== */

import { CSSProperties, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../LanguageContext";

/**
 * Только оформление. Срок доступа и служебная запись о договоре сюда
 * не передаются намеренно: всё, что получает страница, видно в её
 * исходном коде.
 */
export type LandingBrand = {
  title: string;
  logo_url: string;
  accent: string;
  contact: string;
};

/* ---------- наименование учреждения ---------- */

const NAME_LINES: { text: string; style: "quoted" | "caps" | "plain" }[] = [
  { text: "“Kommunal loyiha ilmiy-tadqiqot instituti”", style: "quoted" },
  { text: "DAVLAT MUASSASASI", style: "caps" },
  { text: "G‘arbiy mintaqalararo filiali", style: "plain" },
];

/* ---------- перечень расчётов ---------- */

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

const T = {
  uz: {
    login: "Kirish",
    section: "Muhandislik hisoblari",
    disclaimer:
      "Dastlabki natija ishchi loyiha hisoblanmaydi. Yakuniy yechimlar dastlabki ma’lumotlar muhandis tomonidan tekshirilgandan so‘ng qabul qilinadi.",
  },
  ru: {
    login: "Войти",
    section: "Инженерные расчёты",
    disclaimer:
      "Предварительный результат не является рабочим проектом. Окончательные решения принимаются после проверки исходных данных инженером.",
  },
};

/* ---------- цвета бланка ---------- */

const PAPER = "#ffffff";
const INK = "#12222c";
const FAINT = "#63798a";
const RULE = "#dbe4ea";

export default function BrandLanding({ brand }: { brand: LandingBrand }) {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [logoOk, setLogoOk] = useState(true);
  const accent = brand.accent || "#0273d1";

  /* На этом листе два языка. Английский и китайский, выбранные на
     общем сайте, показываются по-русски — но выбор не сбрасывается:
     человек уйдёт в расчёты с тем языком, который поставил. */
  const uz = language === "uz";
  const t = uz ? T.uz : T.ru;

  return (
    <main style={page}>
      {/* ВЕРХНЯЯ ПОЛОСА: язык и вход. Ничего лишнего — страница
          закрыта, и первое действие здесь одно. */}
      <div style={{ ...topBar, borderColor: RULE }}>
        <span style={{ ...topMark, color: FAINT }}>{brand.contact}</span>

        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "inline-flex", border: `1px solid ${RULE}`, borderRadius: 4, overflow: "hidden" }}>
            {(["uz", "ru"] as const).map((code) => {
              const on = code === (uz ? "uz" : "ru");
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  style={{
                    border: 0,
                    background: on ? accent : "transparent",
                    color: on ? "#fff" : FAINT,
                    padding: "8px 14px",
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                  }}
                >
                  {code.toUpperCase()}
                </button>
              );
            })}
          </span>

          <button type="button" onClick={() => router.push("/engineering/login")} style={{ ...loginBtn, background: accent }}>
            {t.login}
          </button>
        </span>
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
      </section>

      {/* ПЕРЕЧЕНЬ РАСЧЁТОВ */}
      <section style={section}>
        <div style={{ ...sectionLabel, color: accent }}>{t.section}</div>

        <ol style={list}>
          {TOOLS.map((x, i) => (
            <li key={x.href} style={{ ...row, borderColor: RULE }}>
              <a href={x.href} style={rowLink}>
                <span style={{ ...num, color: accent }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={rowText}>{uz ? x.uz : x.ru}</span>
                <span style={{ ...arrow, color: accent }}>→</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      {/* ОГОВОРКА О СТАТУСЕ РЕЗУЛЬТАТА */}
      <footer style={{ ...footer, borderColor: RULE }}>
        <p style={note}>{t.disclaimer}</p>
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
const rowText: CSSProperties = { fontSize: 16, fontWeight: 600, lineHeight: 1.4 };
const arrow: CSSProperties = { marginLeft: "auto", fontSize: 18 };
const footer: CSSProperties = { maxWidth: 980, margin: "56px auto 0", paddingTop: 26, borderTop: "1px solid" };
const note: CSSProperties = { fontSize: 12.5, lineHeight: 1.65, margin: 0, maxWidth: 780, color: FAINT };
