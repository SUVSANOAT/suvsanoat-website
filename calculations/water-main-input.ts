/* ==================================================================
 * ЧТЕНИЕ ПРОДОЛЬНОГО ПРОФИЛЯ ТРАССЫ ВОДОВОДА
 *
 * Профиль — единственные данные, которые проектировщик обязан ввести
 * сам: расход он знает, отметки берёт из съёмки, а всё остальное
 * считается. Поэтому ввод сделан под то, что у него уже есть на руках,
 * а не под удобную для программы форму.
 *
 * ТРИ ВХОДА
 *   1. Таблица «пикет — отметка», вставленная из Excel или CSV.
 *      Пикет понимается в любом обычном написании: ПК12+50, 12+50,
 *      1250, 1,25 км.
 *   2. KML из Google Earth — линия трассы с высотами.
 *   3. Упрощённый ввод: начало, конец, длина, характер рельефа.
 *      Профиль строится линейно, и расчёт помечается предварительным.
 *
 * Разбор детерминированный: если строку прочитать нельзя, так и
 * говорится. Ничего не достраивается молча — на профиле молчаливая
 * ошибка в одну отметку сдвигает насосную станцию на километр.
 * ================================================================== */

import type { ProfilePoint } from "./water-main";

export type ParsedProfile = {
  points: ProfilePoint[];
  /** какие столбцы распознаны */
  columns: string[];
  problems: string[];
  /** длина трассы по прочитанным точкам, м */
  lengthM: number;
  /** профиль синтезирован, а не снят */
  synthetic: boolean;
};

const HEADERS: Record<string, string[]> = {
  station: ["пикет", "пк", "расстояние", "station", "l, м", "l,м", "пикетаж", "км"],
  ground: ["отметка земли", "отметка з", "натурная", "земля", "отметка", "elev", "z", "высота"],
  invert: ["отметка лотка", "лоток", "низ трубы", "проектная отметка", "проектная"],
  label: ["примечание", "подпись", "точка", "узел"],
};

/**
 * Пикет в метры. Понимает «ПК12+50», «12+50», «1250», «1,25 км».
 * Возвращает null, если это не пикет.
 */
export function parseStation(raw: string | undefined): number | null {
  if (!raw) return null;
  let s = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (!s) return null;

  const km = /^(\d+[.,]?\d*)км$/.exec(s);
  if (km) return Number(km[1].replace(",", ".")) * 1000;

  const hadPk = s.startsWith("пк");
  s = s.replace(/^пк/, "");
  const plus = /^(\d+)\+(\d+[.,]?\d*)$/.exec(s);
  if (plus) return Number(plus[1]) * 100 + Number(plus[2].replace(",", "."));

  const n = Number(s.replace(",", "."));
  if (!Number.isFinite(n)) return null;
  /* «ПК3» — это третий пикет, то есть 300 метров, а не 3 метра.
     Голое «300» без приставки — уже метры. Разница в сто раз, и если её
     не сделать здесь, вся трасса схлопнется в несколько метров, а
     расчёт всё равно выдаст правдоподобные с виду числа. */
  if (hadPk) return n * 100;
  /* Голое число может быть и номером пикета, и метрами: различается по
     шагу всей колонки — см. normalizeStations ниже. */
  return n;
}

function detectDelimiter(text: string): string {
  const line = text.split(/\r?\n/).find((l) => l.trim().length > 0) ?? "";
  if (line.includes("\t")) return "\t";
  if (line.includes(";")) return ";";
  if (line.includes(",") && !/\d,\d/.test(line)) return ",";
  return /\s{2,}/.test(line) ? " WS" : ";";
}

function splitLine(line: string, delim: string): string[] {
  if (delim === " WS") return line.trim().split(/\s{2,}/);
  return line.split(delim);
}

function matchHeader(cell: string): string | null {
  const v = cell.trim().toLowerCase().replace(/[«»"']/g, "");
  if (!v) return null;
  for (const [key, variants] of Object.entries(HEADERS)) {
    if (variants.some((x) => (x.length <= 2 ? v === x : v === x || v.startsWith(x)))) return key;
  }
  return null;
}

function cellNum(v: string | undefined): number | undefined {
  if (v === undefined) return undefined;
  const s = v.replace(/\s/g, "").replace(",", ".");
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Голые числа в столбце пикетов: 0, 1, 2, 3 — это номера пикетов, а
 * 0, 100, 200 — метры. Различаем по шагу: если средний шаг меньше 10,
 * значит считали пикетами, и числа надо умножить на 100.
 */
function normalizeStations(values: number[], hadExplicitPiket: boolean): { values: number[]; note?: string } {
  if (hadExplicitPiket || values.length < 3) return { values };
  const steps: number[] = [];
  for (let i = 1; i < values.length; i += 1) steps.push(Math.abs(values[i] - values[i - 1]));
  const mean = steps.reduce((a, b) => a + b, 0) / Math.max(1, steps.length);
  if (mean > 0 && mean < 10) {
    return {
      values: values.map((v) => v * 100),
      note: `Столбец пикетов прочитан как номера пикетов (средний шаг ${mean.toFixed(1)}): значения умножены на 100 и приняты за метры. Если это были метры, укажите пикеты в виде «ПК0», «ПК1».`,
    };
  }
  return { values };
}

export function parseProfileTable(text: string): ParsedProfile {
  const problems: string[] = [];
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { points: [], columns: [], problems: ["В таблице меньше двух строк — нужна шапка и хотя бы две точки профиля."], lengthM: 0, synthetic: false };
  }

  const delim = detectDelimiter(text);
  const headerCells = splitLine(lines[0], delim);
  const map = new Map<number, string>();
  headerCells.forEach((c, i) => {
    const key = matchHeader(c);
    if (key && ![...map.values()].includes(key)) map.set(i, key);
  });

  /* Шапки может не быть вовсе: проектировщик вставил два столбца из
     Excel. Тогда первый столбец — пикет, второй — отметка. Это
     допущение, и оно попадает в problems, чтобы человек его увидел. */
  let startRow = 1;
  if (!map.size) {
    const first = splitLine(lines[0], delim);
    if (first.length >= 2 && parseStation(first[0]) !== null && cellNum(first[1]) !== undefined) {
      map.set(0, "station");
      map.set(1, "ground");
      if (first.length >= 3 && cellNum(first[2]) !== undefined) map.set(2, "invert");
      startRow = 0;
      problems.push("Шапка не найдена: первый столбец принят за пикет, второй за отметку земли, третий (если есть) за отметку лотка трубы.");
    } else {
      return { points: [], columns: [], problems: ["Не удалось распознать столбцы. Назовите их «Пикет» и «Отметка земли»."], lengthM: 0, synthetic: false };
    }
  }
  if (![...map.values()].includes("station")) problems.push("Не найден столбец с пикетом. Назовите его «Пикет» или «Расстояние».");
  if (![...map.values()].includes("ground")) problems.push("Не найден столбец с отметкой земли. Назовите его «Отметка земли».");

  const rawStations: number[] = [];
  const rows: { ground: number; invert?: number; label?: string }[] = [];
  let hadExplicitPiket = false;

  for (let r = startRow; r < lines.length; r += 1) {
    const cells = splitLine(lines[r], delim);
    const get = (key: string): string | undefined => {
      for (const [i, k] of map) if (k === key) return cells[i];
      return undefined;
    };
    const rawSt = get("station");
    if (rawSt && /пк|\+|км/i.test(rawSt)) hadExplicitPiket = true;
    const st = parseStation(rawSt);
    const ground = cellNum(get("ground"));
    if (st === null || ground === undefined) {
      if (r > startRow || startRow === 0) problems.push(`Строка ${r + 1}: не прочитаны пикет или отметка — строка пропущена.`);
      continue;
    }
    rawStations.push(st);
    rows.push({ ground, invert: cellNum(get("invert")), label: (get("label") ?? "").trim() || undefined });
  }

  if (rows.length < 2) {
    return { points: [], columns: [...map.values()], problems: [...problems, "Прочитано меньше двух точек профиля."], lengthM: 0, synthetic: false };
  }

  const norm = normalizeStations(rawStations, hadExplicitPiket);
  if (norm.note) problems.push(norm.note);

  const points: ProfilePoint[] = norm.values
    .map((stationM, i) => ({ stationM, groundM: rows[i].ground, invertM: rows[i].invert, label: rows[i].label }))
    .sort((a, b) => a.stationM - b.stationM);

  /* Дубли пикетов — обычная беда при вставке из Excel со сдвоенной
     шапкой. Их надо назвать, а не тихо схлопнуть. */
  const dup: string[] = [];
  for (let i = 1; i < points.length; i += 1) {
    if (points[i].stationM === points[i - 1].stationM) dup.push(String(points[i].stationM));
  }
  if (dup.length) problems.push(`Повторяющиеся пикеты: ${dup.slice(0, 8).join(", ")}${dup.length > 8 ? " и другие" : ""}. Проверьте таблицу — при повторе участок получает нулевую длину.`);

  /* Отметка лотка выше земли — верный признак перепутанных столбцов. */
  const wrongInvert = points.filter((p) => p.invertM !== undefined && p.invertM > p.groundM).length;
  if (wrongInvert > 0) {
    problems.push(`В ${wrongInvert} точках отметка лотка выше отметки земли — похоже, столбцы «земля» и «лоток» перепутаны местами.`);
  }

  return {
    points,
    columns: [...map.values()],
    problems,
    lengthM: Math.round(points[points.length - 1].stationM - points[0].stationM),
    synthetic: false,
  };
}

/* ------------------------------------------------------------------
 * KML ИЗ GOOGLE EARTH
 * ------------------------------------------------------------------ */

const R_EARTH = 6371008.8;

export function parseProfileKml(text: string): ParsedProfile {
  const problems: string[] = [];
  const block = /<coordinates>([\s\S]*?)<\/coordinates>/i.exec(text);
  if (!block) {
    return { points: [], columns: [], problems: ["В файле нет линии с координатами. Сохраните трассу как путь (Path), а не как метку."], lengthM: 0, synthetic: false };
  }
  const pts = block[1]
    .trim()
    .split(/\s+/)
    .map((p) => p.split(",").map(Number))
    .filter((p) => p.length >= 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]));
  if (pts.length < 2) {
    return { points: [], columns: [], problems: ["В линии меньше двух точек."], lengthM: 0, synthetic: false };
  }
  const withZ = pts.every((p) => p.length >= 3 && Number.isFinite(p[2]) && p[2] !== 0);
  if (!withZ) {
    return {
      points: [],
      columns: [],
      problems: [
        "В файле нет высот (или они нулевые): Google Earth пишет высоту только при сохранении пути с привязкой к рельефу. Для водовода отметки обязательны — возьмите их из съёмки.",
      ],
      lengthM: 0,
      synthetic: false,
    };
  }
  problems.push(
    "Высоты взяты из Google Earth. Их погрешность — метры, а расчёт каскада насосных станций к отметкам чувствителен. Годится для предварительной проработки, для стадии П нужна съёмка.",
  );

  const rad = Math.PI / 180;
  let acc = 0;
  const points: ProfilePoint[] = pts.map((p, i) => {
    if (i > 0) {
      const [lon0, lat0] = pts[i - 1];
      const dx = (p[0] - lon0) * rad * R_EARTH * Math.cos(((p[1] + lat0) / 2) * rad);
      const dy = (p[1] - lat0) * rad * R_EARTH;
      acc += Math.hypot(dx, dy);
    }
    return { stationM: Number(acc.toFixed(1)), groundM: Number(p[2].toFixed(2)) };
  });

  return { points, columns: ["station", "ground"], problems, lengthM: Math.round(acc), synthetic: false };
}

/* ------------------------------------------------------------------
 * УПРОЩЁННЫЙ ВВОД
 *
 * Когда съёмки ещё нет, а порядок величин нужен сегодня. Профиль
 * строится по трём числам, и результат честно помечается как
 * предварительный: расстановка станций на синтетическом профиле
 * показывает только их число, а не места.
 * ------------------------------------------------------------------ */

export type SimpleProfileInput = {
  startElevM: number;
  endElevM: number;
  lengthM: number;
  /** характер рельефа — задаёт волнистость профиля */
  terrain?: "flat" | "hills" | "mountain";
  /** шаг разбивки, м */
  stepM?: number;
};

export function synthesizeProfile(input: SimpleProfileInput): ParsedProfile {
  const step = Math.max(20, input.stepM ?? 100);
  const L = Math.max(step, input.lengthM);
  const n = Math.max(2, Math.round(L / step) + 1);
  const terrain = input.terrain ?? "hills";
  /* Амплитуда волнистости — доля от перепада; на равнине профиль почти
     прямой, в горах между началом и концом есть промежуточные вершины
     и седловины, и именно они определяют, где нужны вантузы. */
  const amp = terrain === "flat" ? 0 : terrain === "hills" ? 0.04 : 0.10;
  const dz = input.endElevM - input.startElevM;

  const points: ProfilePoint[] = [];
  for (let i = 0; i < n; i += 1) {
    const t = i / (n - 1);
    const wave = amp * Math.abs(dz) * Math.sin(t * Math.PI * (terrain === "mountain" ? 5 : 3));
    points.push({
      stationM: Number((t * L).toFixed(1)),
      groundM: Number((input.startElevM + dz * t + wave).toFixed(2)),
    });
  }

  return {
    points,
    columns: ["station", "ground"],
    problems: [
      "Профиль синтезирован по трём числам, а не снят с местности. Число насосных станций и порядок давлений он показывает верно, места станций, вершин и вантузов — нет. Для стадии П нужен настоящий продольный профиль.",
    ],
    lengthM: Math.round(L),
    synthetic: true,
  };
}
