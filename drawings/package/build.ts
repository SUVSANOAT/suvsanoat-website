/* ==================================================================
 * СБОРКА КОМПЛЕКТА ЧЕРТЕЖЕЙ
 *
 * Вход — результат расчёта (DrawingInput), выход — набор листов А1
 * в DXF, упакованный в ZIP, плюс ведомость чертежей.
 *
 * Состав комплекта (по образцу концептуального проекта):
 *   C-01001  Генеральный план площадки
 *   C-01002… Лист на каждое сооружение (план, разрезы, изометрия)
 *   M-01001  Гидравлический профиль
 *   M-01002  Технологическая схема
 *   00       Ведомость чертежей (первый лист)
 *
 * Порядок листов сооружений — по ходу потока, как в компоновке.
 * ================================================================== */

import { Dxf } from "../core/dxf";
import { Sheet, objectCode, pickScale, sheetNo, A1 } from "../core/sheet";
import { makeZip, type ZipEntry } from "../core/zip";
import type { DrawingInput, SheetFile, StructureModel } from "../core/types";
import { layoutSite, type LayoutResult } from "../site/layout";
import { buildSitePlanSheet } from "../site/siteplan";
import { buildProfileSheet } from "../site/profile";
import { buildSchemeSheet } from "../site/scheme";

import { mechModel, mechScale } from "../structures/mech";
import { equalModel, equalScale } from "../structures/equal";
import { mbrModel } from "../structures/mbr";
import { blowerModel, blowerScale } from "../structures/blower";
import { uvModel, uvScale } from "../structures/uv";
import { contactModel, contactRequired, contactScale } from "../structures/contact";
import { thickenerModel, thickenerScale } from "../structures/thickener";
import { stabilizerModel, stabilizerScale } from "../structures/stabilizer";
import { dewateringModel, dewateringScale } from "../structures/dewatering";
import { sludgeBedsModel, sludgeBedsScale } from "../structures/sludge-beds";
import { pumpStationModel, pumpStationRequired, pumpStationScale } from "../structures/pump-station";

export type PackageOptions = {
  /** расстояние до жилой застройки, м — для проверки СЗЗ на генплане */
  housingDistM?: number;
  /** обеззараживание хлором вместо УФ — добавляет контактный резервуар */
  chlorine?: boolean;
  rev?: string;
};

export type DrawingPackage = {
  objectCode: string;
  sheets: SheetFile[];
  /** ведомость: номер, наименование, масштаб */
  register: { no: string; title: string; scale: string }[];
  layout: LayoutResult;
  models: StructureModel[];
  /** предупреждения: не помещается на участке, нужна КНС и т.п. */
  warnings: string[];
  zip: () => Uint8Array;
};

type Entry = { model: StructureModel; scale: number; title: string };

/**
 * Набор сооружений по цепочке расчёта. Порядок — по ходу потока:
 * приём → механическая → усреднение → биология → доочистка → сброс,
 * затем линия осадка и вспомогательные.
 */
export function buildModels(input: DrawingInput, opts: PackageOptions = {}): Entry[] {
  const has = (k: string) => input.chain.includes(k);
  const out: Entry[] = [];

  if (pumpStationRequired(input)) {
    out.push({ model: pumpStationModel(input), scale: pumpStationScale(input), title: "Канализационная насосная станция. План, разрезы" });
  }
  if (has("screen") || has("sand") || has("grease")) {
    out.push({ model: mechModel(input), scale: mechScale(input), title: "Сооружение механической очистки. План, разрезы, изометрия" });
  }
  if (has("avg")) {
    out.push({ model: equalModel(input), scale: equalScale(input), title: "Усреднитель расхода и состава. План, разрезы, изометрия" });
  }
  if (has("bio")) {
    const mbr = mbrModel(input);
    const fp = mbr.footprint;
    const maxDim = fp.shape === "rect" ? Math.max(fp.w, fp.l) : fp.d;
    out.push({ model: mbr, scale: pickScale(maxDim, (mbr.top - mbr.bottom) * 1000), title: "Мембранный биореактор. План, разрезы, изометрия" });
    out.push({ model: blowerModel(input), scale: blowerScale(input), title: "Воздуходувная станция. План, разрезы, изометрия" });
  }
  if (has("post") || has("disinfect")) {
    out.push({ model: uvModel(input), scale: uvScale(input), title: "Сооружения доочистки и УФ-обеззараживания. План, разрезы" });
  }
  if (opts.chlorine && contactRequired(input, { enabled: true })) {
    out.push({ model: contactModel(input, { enabled: true }), scale: contactScale(input), title: "Контактный резервуар. План, разрезы" });
  }
  if (has("sludge")) {
    out.push({ model: thickenerModel(input), scale: thickenerScale(input), title: "Гравитационный илоуплотнитель. План, разрезы, изометрия" });
    out.push({ model: stabilizerModel(input), scale: stabilizerScale(input), title: "Аэробный стабилизатор ила. План, разрезы, изометрия" });
    out.push({ model: dewateringModel(input), scale: dewateringScale(input), title: "Здание механического обезвоживания осадка. План, разрезы" });
    out.push({ model: sludgeBedsModel(input), scale: sludgeBedsScale(input), title: "Иловые площадки аварийные. План, разрезы" });
  }
  return out;
}

export function buildPackage(input: DrawingInput, opts: PackageOptions = {}): DrawingPackage {
  const code = objectCode(input.object);
  const entries = buildModels(input, opts);
  const models = entries.map((e) => e.model);
  const layout = layoutSite(input.site, models, { housingDistM: opts.housingDistM });

  /* номера позиций из компоновки переносим в модели — они печатаются на листах */
  for (const p of layout.placed) {
    const m = models.find((x) => x.id === p.model.id);
    if (m) m.no = p.no;
  }

  const sheets: SheetFile[] = [];
  const warnings: string[] = [];
  let idx = 0;

  const push = (discipline: "C" | "M", title: string, scale: number, draw: (s: Sheet) => void) => {
    idx += 1;
    const no = sheetNo(code, discipline, idx);
    const sheet = new Sheet({ no, title, object: input.object, scale, rev: opts.rev ?? "P01" });
    draw(sheet);
    sheet.revisionRow();
    sheets.push({ no, title, filename: `${no}.dxf`, dxf: sheet.d });
    return sheet;
  };

  /* --- C-01001 генплан --- */
  {
    idx += 1;
    const no = sheetNo(code, "C", idx);
    const s = buildSitePlanSheet(input, models, layout, { no, rev: opts.rev ?? "P01" });
    sheets.push({ no, title: "Генеральный план площадки очистных сооружений", filename: `${no}.dxf`, dxf: s.d });
  }
  if (!layout.fits) {
    warnings.push(
      `Сооружения не помещаются на заданном участке: требуется ${layout.needM2} м², задано ${layout.haveM2} м², дефицит ${layout.deficitM2} м². ` +
        layout.hint.join(" ")
    );
  }

  /* --- листы сооружений --- */
  for (const e of entries) {
    push("C", e.title, e.scale, (s) => e.model.draw(s));
  }

  /* --- M-01001 гидравлический профиль, M-01002 схема --- */
  {
    idx = 0;
    idx += 1;
    const no = sheetNo(code, "M", idx);
    const s = buildProfileSheet(input, models, layout, { no, rev: opts.rev ?? "P01" });
    sheets.push({ no, title: "Гидравлический профиль очистных сооружений", filename: `${no}.dxf`, dxf: s.d });
  }
  {
    idx += 1;
    const no = sheetNo(code, "M", idx);
    const s = buildSchemeSheet(input, models, { no, rev: opts.rev ?? "P01" });
    sheets.push({ no, title: "Технологическая схема очистных сооружений", filename: `${no}.dxf`, dxf: s.d });
  }

  /* --- ведомость чертежей (первым листом; включает саму себя) --- */
  const regNo = sheetNo(code, "C", 0);
  const register = [
    { no: regNo, title: "Ведомость чертежей", scale: "—" },
    ...sheets.map((s) => ({ no: s.no, title: s.title, scale: `1:${scaleOfSheet(s)}` })),
  ];
  const regSheet = buildRegisterSheet(input, register, warnings, layout, { no: regNo, rev: opts.rev ?? "P01" });
  sheets.unshift({ no: regNo, title: "Ведомость чертежей", filename: `${regNo}.dxf`, dxf: regSheet.d });

  return {
    objectCode: code,
    sheets,
    register,
    layout,
    models,
    warnings,
    zip: () =>
      makeZip(
        sheets.map<ZipEntry>((s) => ({ name: s.filename, data: s.dxf.toBytes() }))
      ),
  };
}

function scaleOfSheet(s: SheetFile): number {
  /* масштаб зашит в сам лист через Sheet.meta, но SheetFile хранит только Dxf;
     восстанавливаем по ширине рамки: рамка А1 нарисована шириной 841 × scale */
  const e = s.dxf.extents();
  return Math.max(1, Math.round((e.maxX - e.minX) / A1.w));
}

/* ==================================================================
 * ВЕДОМОСТЬ ЧЕРТЕЖЕЙ — первый лист комплекта
 * ================================================================== */

function buildRegisterSheet(
  input: DrawingInput,
  register: { no: string; title: string; scale: string }[],
  warnings: string[],
  layout: LayoutResult,
  meta: { no: string; rev: string }
): Sheet {
  const sheet = new Sheet({
    no: meta.no,
    title: "Ведомость чертежей комплекта",
    object: input.object,
    scale: 1,
    rev: meta.rev,
  });
  const d = sheet.d;
  const f = sheet.field;
  const th = sheet.th;
  const ts = sheet.ts;

  sheet.viewTitle(f.x0 + 10, f.y0 + f.h - 20, "ВЕДОМОСТЬ ЧЕРТЕЖЕЙ", "none");

  /* исходные данные объекта */
  let y = f.y0 + f.h - 45;
  const rows: [string, string][] = [
    ["Объект", input.object],
    ["Расчётный расход", `${input.q.toFixed(0)} м³/сут при ${input.hours} ч работы; Q max.час ${input.qMaxH.toFixed(1)} м³/ч`],
    ["Загрязнения на входе", `БПК₅ ${input.bod.toFixed(0)}, ХПК ${input.cod.toFixed(0)}, взвешенные ${input.ss.toFixed(0)}, азот ${input.tn.toFixed(0)} мг/л`],
    ["Технология", `${input.tech}; объём биологической ступени ${input.vBio.toFixed(0)} м³, воздух ${input.air.toFixed(0)} м³/ч`],
    ["Осадок", `${input.dryKg.toFixed(0)} кг сухого вещества в сутки`],
    ["Площадка", layout.generated
      ? `не ограничена, компоновка свободная; принято ${Math.round(layout.U)}×${Math.round(layout.V)} м, ${layout.haveM2} м²`
      : `задана ${layout.haveM2} м²; требуется ${layout.needM2} м²${layout.fits ? "" : ` — ДЕФИЦИТ ${layout.deficitM2} м²`}`],
    ["Санитарно-защитная зона", input.szz ? `${input.szz} м (табл. 1 ҚМҚ 2.04.03-19)` : "определяется по табл. 1 ҚМҚ 2.04.03-19"],
  ];
  for (const [k, v] of rows) {
    d.text(f.x0 + 10, y, ts, `${k}:`, { align: "left" });
    d.text(f.x0 + 120, y, ts, v, { align: "left" });
    y -= ts * 1.8;
  }

  /* таблица ведомости */
  y -= 15;
  const colX = [f.x0 + 10, f.x0 + 130, f.x0 + 520, f.x0 + 590];
  const rowH = ts * 2.0;
  const head = ["Номер чертежа", "Наименование", "Масштаб", ""];
  d.rect(colX[0], y - rowH, colX[3] - colX[0], rowH, "CONTOUR");
  head.slice(0, 3).forEach((h, i) => d.text(colX[i] + 4, y - rowH * 0.7, ts, h, { align: "left" }));
  y -= rowH;
  for (const r of register) {
    d.rect(colX[0], y - rowH, colX[3] - colX[0], rowH, "THIN");
    d.text(colX[0] + 4, y - rowH * 0.7, ts, r.no, { align: "left" });
    d.text(colX[1] + 4, y - rowH * 0.7, ts, r.title, { align: "left" });
    d.text(colX[2] + 4, y - rowH * 0.7, ts, r.scale, { align: "left" });
    y -= rowH;
  }
  for (const i of [0, 1, 2, 3]) d.line(colX[i], y, colX[i], y + rowH * (register.length + 1), "THIN");

  sheet.note("Комплект выдан по результатам онлайн-расчёта SUVSANOAT. Стадия — концептуальный проект (предпроектная проработка).");
  sheet.note("Габариты и отметки сооружений расчётные. Конструктивные решения, армирование, фундаменты, гидроизоляция и мероприятия при высоком уровне грунтовых вод определяются на стадии рабочего проектирования.");
  sheet.note("Все ёмкостные сооружения — монолитный железобетон.");
  for (const w of warnings) sheet.note(w);
  sheet.revisionRow();
  return sheet;
}
