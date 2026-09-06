"use client";

/* ==================================================================
 * ПРОВЕРКА ЧУЖОГО ПРОЕКТА ПО ҚМҚ 2.04.03-19
 *
 * Страница для случая, когда заказчик приносит чужой расчёт или
 * коммерческое предложение и спрашивает: это нормально или нас
 * обманывают. Проектировщик переносит сюда заявленные величины —
 * ровно те, что нашёл в документе, — и получает построчную сверку с
 * нормой, с пунктами и с последствиями.
 *
 * Пустое поле означает «в документе этого нет» и даёт запись «нет
 * данных», а не обвинение. Это принципиально: заключение уходит
 * заказчику, и каждое слово в нём должно быть защитимо.
 * ================================================================== */

import { CSSProperties, useMemo, useState } from "react";
import { auditProject, type AuditInput, type FindingLevel } from "../../../../calculations/audit";
import RequireAuth from "../../RequireAuth";

type FieldDef = {
  key: keyof AuditInput;
  label: string;
  unit?: string;
  hint?: string;
};

const GROUPS: { title: string; note?: string; fields: FieldDef[] }[] = [
  {
    title: "ИСХОДНЫЕ ДАННЫЕ ОБЪЕКТА",
    note: "Берутся из того же документа. Если в проекте они не указаны — это первая находка сама по себе.",
    fields: [
      { key: "flowM3Day", label: "Расход", unit: "м³/сут" },
      { key: "bodMgL", label: "БПК₅ на входе", unit: "мг/л" },
      { key: "tssMgL", label: "Взвешенные вещества", unit: "мг/л" },
      { key: "nitrogenMgL", label: "Азот общий", unit: "мг/л" },
      { key: "phosphorusMgL", label: "Фосфор общий", unit: "мг/л" },
      { key: "phValue", label: "pH" },
      { key: "waterTempAnnualC", label: "Температура воды, среднегодовая", unit: "°C", hint: "определяет объём" },
      { key: "waterTempSummerC", label: "Температура воды, среднелетняя", unit: "°C", hint: "определяет воздух" },
    ],
  },
  {
    title: "ЧТО ЗАЯВЛЕНО В ПРОЕКТЕ — БИОЛОГИЯ",
    fields: [
      { key: "declaredKMax", label: "Коэффициент неравномерности K gen.max" },
      { key: "aerationVolumeM3", label: "Объём биологической ступени", unit: "м³" },
      { key: "aerationHours", label: "Время аэрации", unit: "ч" },
      { key: "aerationSections", label: "Число секций", unit: "шт." },
      { key: "aerationDepthM", label: "Рабочая глубина", unit: "м" },
      { key: "aerationCorridorWidthM", label: "Ширина коридора", unit: "м" },
      { key: "mlssGL", label: "Доза ила", unit: "г/л" },
    ],
  },
  {
    title: "МЕХАНИЧЕСКАЯ ОЧИСТКА",
    fields: [
      { key: "screenGapMm", label: "Прозоры решётки", unit: "мм" },
      { key: "screenVelocityMS", label: "Скорость в прозорах", unit: "м/с" },
      { key: "gritUnits", label: "Число песколовок", unit: "шт." },
      { key: "gritVelocityMS", label: "Скорость в песколовке", unit: "м/с" },
      { key: "gritRetentionS", label: "Время пребывания", unit: "с" },
    ],
  },
  {
    title: "ОТСТОЙНИКИ, ВОЗДУХ, ИЛ",
    fields: [
      { key: "secondaryUnits", label: "Число вторичных отстойников", unit: "шт." },
      { key: "secondaryAreaM2", label: "Суммарная площадь вторичных", unit: "м²" },
      { key: "secondaryDepthM", label: "Глубина зоны отстаивания", unit: "м" },
      { key: "airNm3H", label: "Расход воздуха", unit: "Нм³/ч" },
      { key: "blowerKW", label: "Мощность воздуходувок", unit: "кВт" },
      { key: "excessSludgeKgDay", label: "Прирост избыточного ила", unit: "кг СВ/сут" },
    ],
  },
  {
    title: "РЕЗУЛЬТАТ И ПЛОЩАДКА",
    fields: [
      { key: "outSsMgL", label: "Взвешенные на выходе", unit: "мг/л" },
      { key: "outBodFullMgL", label: "БПКполн на выходе", unit: "мг/л" },
      { key: "contactMinutes", label: "Время контакта обеззараживания", unit: "мин" },
      { key: "distanceToHousingM", label: "Расстояние до жилой застройки", unit: "м" },
    ],
  },
];

const LEVELS: Record<FindingLevel, { title: string; color: string; back: string }> = {
  fail: { title: "НЕ СРАБОТАЕТ", color: "#ff9d8a", back: "#2a1512" },
  norm: { title: "НЕ ПО НОРМЕ", color: "#ffcf8a", back: "#2a2112" },
  doubt: { title: "ТРЕБУЕТ ПОЯСНЕНИЯ", color: "#9fd0ff", back: "#12202a" },
  ok: { title: "СООТВЕТСТВУЕТ", color: "#9fd6b4", back: "#122a1c" },
  nodata: { title: "НЕТ ДАННЫХ", color: "#8ca4ad", back: "#12202a" },
};

const ORDER: FindingLevel[] = ["fail", "norm", "doubt", "nodata", "ok"];

export default function AuditPage() {
  return (
    <RequireAuth>
      <AuditPageContent />
    </RequireAuth>
  );
}

function AuditPageContent() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [plantKind, setPlantKind] = useState<string>("");
  const [sludgeBeds, setSludgeBeds] = useState(false);
  const [disinfection, setDisinfection] = useState<"" | "yes" | "no">("");
  const [ran, setRan] = useState(false);

  const input: AuditInput = useMemo(() => {
    const out: Record<string, unknown> = {};
    Object.entries(values).forEach(([k, v]) => {
      const n = Number(String(v).replace(",", "."));
      if (v !== "" && Number.isFinite(n)) out[k] = n;
    });
    if (plantKind) out.plantKind = plantKind;
    out.sludgeBedsOnSite = sludgeBeds;
    if (disinfection) out.disinfection = disinfection === "yes";
    return out as AuditInput;
  }, [values, plantKind, sludgeBeds, disinfection]);

  const result = useMemo(() => (ran ? auditProject(input) : null), [ran, input]);

  const sorted = result
    ? [...result.findings].sort((a, b) => ORDER.indexOf(a.level) - ORDER.indexOf(b.level))
    : [];

  function set(key: string, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  return (
    <main style={page}>
      <div style={container}>
        <div style={eyebrow}>ЭКСПЕРТИЗА</div>
        <h1 style={title}>
          Проверка чужого
          <br />
          проекта по ҚМҚ 2.04.03-19
        </h1>
        <p style={lead}>
          Перенесите сюда величины, заявленные в чужом расчёте или коммерческом предложении.
          Система сверит их с нормой и покажет, где расхождение и чем оно обернётся на объекте.
          Поля, которых в документе нет, оставьте пустыми — они попадут в заключение как
          «не указано», и это тоже результат проверки.
        </p>

        {GROUPS.map((g) => (
          <section key={g.title} style={card}>
            <div style={sectionTitle}>{g.title}</div>
            {g.note && <p style={{ ...hint, marginTop: -8, marginBottom: 16 }}>{g.note}</p>}
            <div style={grid}>
              {g.fields.map((f) => (
                <label key={String(f.key)} style={field}>
                  <span style={fieldLabel}>
                    {f.label}
                    {f.unit ? `, ${f.unit}` : ""}
                  </span>
                  <input
                    inputMode="decimal"
                    value={values[String(f.key)] ?? ""}
                    onChange={(e) => set(String(f.key), e.target.value)}
                    placeholder="—"
                    style={inputStyle}
                  />
                  {f.hint && <span style={fieldHint}>{f.hint}</span>}
                </label>
              ))}
            </div>
          </section>
        ))}

        <section style={card}>
          <div style={sectionTitle}>СОСТАВ СООРУЖЕНИЙ</div>
          <div style={grid}>
            <label style={field}>
              <span style={fieldLabel}>Тип станции (для табл. 1 — СЗЗ)</span>
              <select value={plantKind} onChange={(e) => setPlantKind(e.target.value)} style={inputStyle}>
                <option value="">не указан</option>
                <option value="mechbio-sludge-beds">механическая и биологическая, с иловыми площадками</option>
                <option value="mechbio-thermal">то же, обработка осадка в закрытых помещениях</option>
                <option value="full-oxidation">установка на полное окисление</option>
                <option value="oxidation-ditch">циркуляционные окислительные каналы</option>
                <option value="bio-ponds">биологические пруды</option>
              </select>
            </label>
            <label style={field}>
              <span style={fieldLabel}>Обеззараживание</span>
              <select
                value={disinfection}
                onChange={(e) => setDisinfection(e.target.value as "" | "yes" | "no")}
                style={inputStyle}
              >
                <option value="">не указано</option>
                <option value="yes">предусмотрено</option>
                <option value="no">не предусмотрено</option>
              </select>
            </label>
            <label style={{ ...field, justifyContent: "center" }}>
              <span style={fieldLabel}>Иловые площадки на площадке</span>
              <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#b7cbd3", fontSize: 14 }}>
                <input type="checkbox" checked={sludgeBeds} onChange={(e) => setSludgeBeds(e.target.checked)} />
                есть
              </label>
            </label>
          </div>
        </section>

        <button type="button" style={runButton} onClick={() => setRan(true)}>
          Проверить по нормам
        </button>

        {result && (
          <>
            <section style={{ ...card, marginTop: 30 }}>
              <div style={sectionTitle}>ЗАКЛЮЧЕНИЕ</div>
              <p style={{ color: "#e7eef1", fontSize: 16, lineHeight: 1.7, margin: 0 }}>{result.summary}</p>
              <div style={countRow}>
                {ORDER.map((lvl) =>
                  result.counts[lvl] > 0 ? (
                    <span key={lvl} style={{ ...chip, color: LEVELS[lvl].color, background: LEVELS[lvl].back }}>
                      {LEVELS[lvl].title}: {result.counts[lvl]}
                    </span>
                  ) : null,
                )}
              </div>
              <p style={{ ...hint, marginTop: 16 }}>
                Заключение построено только на тех величинах, которые вы ввели. Оно не заменяет
                экспертизу проекта и не является оценкой добросовестности автора: расхождение может
                означать и другую расчётную схему — тогда автор обязан её показать.
              </p>
            </section>

            {sorted.map((f) => {
              const L = LEVELS[f.level];
              return (
                <section key={f.key} style={{ ...findingCard, borderColor: L.color + "44" }}>
                  <div style={{ ...badge, color: L.color, background: L.back }}>{L.title}</div>
                  <div style={{ color: "#e7eef1", fontWeight: 700, fontSize: 16, margin: "10px 0 12px" }}>
                    {f.subject}
                  </div>
                  <div style={twoCol}>
                    <div>
                      <div style={smallLabel}>ЗАЯВЛЕНО В ПРОЕКТЕ</div>
                      <div style={{ color: "#e7eef1", fontSize: 15 }}>{f.declared}</div>
                    </div>
                    <div>
                      <div style={smallLabel}>ПО НОРМЕ / ПО РАСЧЁТУ</div>
                      <div style={{ color: "#e7eef1", fontSize: 15 }}>{f.required}</div>
                    </div>
                  </div>
                  <p style={{ color: "#b7cbd3", fontSize: 14, lineHeight: 1.7, margin: "14px 0 0" }}>
                    {f.consequence}
                  </p>
                  {f.ref && <div style={refLine}>{f.ref}</div>}
                </section>
              );
            })}
          </>
        )}
      </div>
    </main>
  );
}

/* ---------------------------- стили ---------------------------- */

const page: CSSProperties = {
  minHeight: "100vh",
  background: "#06151d",
  color: "#f4f7f8",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const container: CSSProperties = {
  width: "min(1150px, calc(100% - 32px))",
  margin: "0 auto",
  padding: "60px 0 100px",
};

const eyebrow: CSSProperties = {
  color: "#5fb6c9",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "3px",
};

const title: CSSProperties = {
  fontSize: "clamp(30px, 5vw, 52px)",
  lineHeight: 1.1,
  margin: "18px 0 0",
};

const lead: CSSProperties = {
  maxWidth: 820,
  marginTop: 25,
  marginBottom: 40,
  color: "#8ca4ad",
  fontSize: 17,
  lineHeight: 1.7,
};

const card: CSSProperties = {
  background: "#081b24",
  border: "1px solid #1c3742",
  borderRadius: 12,
  padding: 22,
  marginBottom: 18,
};

const sectionTitle: CSSProperties = {
  color: "#657983",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "2px",
  marginBottom: 20,
};

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 14,
};

const field: CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };

const fieldLabel: CSSProperties = { color: "#8ca4ad", fontSize: 12, letterSpacing: "0.5px" };

const fieldHint: CSSProperties = { color: "#5c7280", fontSize: 11 };

const inputStyle: CSSProperties = {
  background: "#06151d",
  border: "1px solid #1c3742",
  borderRadius: 8,
  color: "#f4f7f8",
  padding: "10px 12px",
  fontSize: 15,
  outline: "none",
};

const hint: CSSProperties = { color: "#8ca4ad", fontSize: 13, lineHeight: 1.7 };

const runButton: CSSProperties = {
  marginTop: 12,
  background: "#0f5f73",
  border: 0,
  color: "#eaf7fa",
  borderRadius: 10,
  padding: "14px 26px",
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
};

const countRow: CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 };

const chip: CSSProperties = {
  borderRadius: 999,
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.5px",
};

const findingCard: CSSProperties = {
  background: "#081b24",
  border: "1px solid #1c3742",
  borderRadius: 12,
  padding: 20,
  marginBottom: 12,
};

const badge: CSSProperties = {
  display: "inline-block",
  borderRadius: 999,
  padding: "5px 11px",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "1px",
};

const twoCol: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 14,
};

const smallLabel: CSSProperties = {
  color: "#5c7280",
  fontSize: 11,
  letterSpacing: "1px",
  marginBottom: 5,
};

const refLine: CSSProperties = {
  marginTop: 12,
  color: "#5c7280",
  fontSize: 12,
};
