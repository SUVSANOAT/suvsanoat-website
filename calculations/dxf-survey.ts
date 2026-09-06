/* ==================================================================
 * ЧТЕНИЕ ТОПОСЪЁМКИ ИЗ DXF
 *
 * Проектировщик кладёт файл съёмки, программа берёт оттуда точки с
 * высотами и снимает отметку земли в каждом колодце. Это избавляет от
 * ручного переноса отметок — самой утомительной и самой ошибкоопасной
 * части подготовки данных.
 *
 * ЧТО ЧИТАЕТСЯ
 *   POINT                  — координаты и высота (код 30);
 *   TEXT / MTEXT           — подпись отметки: если текст читается как
 *                            число, он и есть высота, а положение
 *                            берётся из точки вставки;
 *   LWPOLYLINE / POLYLINE  — горизонтали: высота из кода 38 или из Z
 *                            вершин;
 *   INSERT                 — блок точки съёмки, если у вставки задан Z.
 *
 * ЧТО НЕ ЧИТАЕТСЯ
 *   Двоичный DXF и DWG. DWG — закрытый формат, без библиотеки его не
 *   разобрать; проектировщик сохраняет из CAD «DXF (ASCII)». Так и
 *   написано в сообщении об ошибке, чтобы человек не гадал.
 *
 * ГЛАВНОЕ ПРАВИЛО
 * Отметка колодца не выдумывается. Она интерполируется по ближайшим
 * точкам съёмки, и рядом всегда возвращается расстояние до ближайшей
 * точки. Если ближайшая точка далеко — отметка помечается ненадёжной,
 * а не подставляется молча: на уклоне 7 мм/м ошибка в полметра
 * съедает четверть расчётного перепада участка.
 * ================================================================== */

export type SurveyPoint = { x: number; y: number; z: number; source: "point" | "text" | "contour" | "insert" };

export type SurveyPolyline = { layer: string; pts: [number, number][]; lengthM: number };

export type ParsedDxf = {
  points: SurveyPoint[];
  /** полилинии — кандидаты на трассу (без высоты или с ней) */
  polylines: SurveyPolyline[];
  /** слои, встреченные в файле */
  layers: string[];
  problems: string[];
};

/** пары «код — значение» из ASCII DXF */
function pairs(text: string): { code: number; value: string }[] {
  const lines = text.split(/\r?\n/);
  const out: { code: number; value: string }[] = [];
  for (let i = 0; i + 1 < lines.length; i += 2) {
    const code = parseInt(lines[i].trim(), 10);
    if (Number.isNaN(code)) continue;
    out.push({ code, value: lines[i + 1] });
  }
  return out;
}

const numOf = (v: string): number => {
  const n = Number(String(v).trim().replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};

export function parseDxfSurvey(text: string): ParsedDxf {
  const problems: string[] = [];
  const points: SurveyPoint[] = [];
  const polylines: SurveyPolyline[] = [];
  const layers = new Set<string>();

  if (!text.includes("SECTION")) {
    return {
      points: [],
      polylines: [],
      layers: [],
      problems: [
        "Это не текстовый DXF. Двоичный DXF и DWG прочитать нельзя — сохраните из CAD как «DXF (ASCII)» и приложите заново.",
      ],
    };
  }

  const p = pairs(text);

  /* текущая накопленная сущность */
  let type = "";
  let layer = "0";
  let x = NaN;
  let y = NaN;
  let z = NaN;
  let elev38 = NaN;
  let label = "";
  let poly: [number, number][] = [];
  let polyZ: number[] = [];
  let inPolyline = false;

  const flush = () => {
    if (!type) return;
    if (type === "POINT" && Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z) && z !== 0) {
      points.push({ x, y, z, source: "point" });
    }
    if ((type === "TEXT" || type === "MTEXT") && Number.isFinite(x) && Number.isFinite(y)) {
      /* Подпись отметки: «142.35», «142,35», иногда «H=142.35». Всё
         остальное (названия улиц, номера точек) отбрасывается. */
      const cleaned = label.replace(/[^0-9.,-]/g, "");
      const v = numOf(cleaned);
      if (Number.isFinite(v) && Math.abs(v) < 9000 && cleaned.length >= 3) {
        points.push({ x, y, z: v, source: "text" });
      } else if (Number.isFinite(z) && z !== 0) {
        points.push({ x, y, z, source: "text" });
      }
    }
    if (type === "INSERT" && Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z) && z !== 0) {
      points.push({ x, y, z, source: "insert" });
    }
    if ((type === "LWPOLYLINE" || type === "POLYLINE") && poly.length >= 2) {
      /* горизонталь: высота одна на всю полилинию (код 38) или у вершин */
      const zs = polyZ.filter((v) => Number.isFinite(v) && v !== 0);
      const zLine = Number.isFinite(elev38) && elev38 !== 0 ? elev38 : zs.length ? zs[0] : NaN;
      if (Number.isFinite(zLine)) {
        poly.forEach(([px, py]) => points.push({ x: px, y: py, z: zLine, source: "contour" }));
      }
      let len = 0;
      for (let i = 1; i < poly.length; i += 1) {
        len += Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]);
      }
      polylines.push({ layer, pts: poly, lengthM: Math.round(len) });
    }
    type = "";
    layer = "0";
    x = NaN;
    y = NaN;
    z = NaN;
    elev38 = NaN;
    label = "";
    poly = [];
    polyZ = [];
  };

  let inEntities = false;
  for (let i = 0; i < p.length; i += 1) {
    const { code, value } = p[i];
    const v = value.trim();

    if (code === 2 && (v === "ENTITIES" || v === "BLOCKS")) {
      inEntities = v === "ENTITIES";
      continue;
    }
    if (code === 0 && v === "ENDSEC") {
      flush();
      inEntities = false;
      continue;
    }
    if (!inEntities) continue;

    if (code === 0) {
      /* VERTEX принадлежит открытой POLYLINE — не сбрасываем накопленное */
      if (v === "VERTEX") {
        inPolyline = true;
        continue;
      }
      if (v === "SEQEND") {
        inPolyline = false;
        continue;
      }
      flush();
      type = v;
      inPolyline = false;
      continue;
    }

    if (code === 8) {
      layer = v;
      layers.add(v);
      continue;
    }
    if (code === 1 || code === 3) {
      label += v;
      continue;
    }
    if (code === 38) {
      elev38 = numOf(v);
      continue;
    }

    if (code === 10) {
      const nx = numOf(v);
      if (type === "LWPOLYLINE" || type === "POLYLINE" || inPolyline) {
        poly.push([nx, NaN]);
      } else {
        x = nx;
      }
      continue;
    }
    if (code === 20) {
      const ny = numOf(v);
      if (poly.length && Number.isNaN(poly[poly.length - 1][1])) {
        poly[poly.length - 1][1] = ny;
      } else {
        y = ny;
      }
      continue;
    }
    if (code === 30) {
      const nz = numOf(v);
      if (poly.length) polyZ.push(nz);
      else z = nz;
      continue;
    }
  }
  flush();

  /* вершины полилиний могли остаться без Y при кривом файле */
  const clean = points.filter((q) => Number.isFinite(q.x) && Number.isFinite(q.y) && Number.isFinite(q.z));
  if (!clean.length) {
    problems.push(
      "В файле не нашлось ни одной точки с высотой. Проверьте, что съёмка сохранена с отметками (POINT с Z, подписи отметок текстом или горизонтали с высотой).",
    );
  }

  return {
    points: clean,
    polylines: polylines.filter((l) => l.pts.every(([px, py]) => Number.isFinite(px) && Number.isFinite(py))).sort((a, b) => b.lengthM - a.lengthM),
    layers: [...layers].sort(),
    problems,
  };
}

/* ------------------------------------------------------------------
 * СНЯТИЕ ОТМЕТКИ В ТОЧКЕ
 *
 * Интерполяция по k ближайшим точкам с весом 1/d² (обратные квадраты
 * расстояний). Это тот же приём, каким инженер снимает отметку между
 * горизонталями, только считает не глазом. Возвращается расстояние до
 * ближайшей точки — по нему видно, чему верить.
 * ------------------------------------------------------------------ */
export type SampledElev = {
  z: number;
  /** расстояние до ближайшей точки съёмки, м */
  nearestM: number;
  /** сколько точек участвовало */
  used: number;
  /** надёжна ли отметка при заданном пределе */
  reliable: boolean;
};

export function sampleElevation(
  points: SurveyPoint[],
  x: number,
  y: number,
  opts: { k?: number; maxDistM?: number } = {},
): SampledElev | null {
  if (!points.length) return null;
  const k = Math.max(1, opts.k ?? 3);
  const maxDist = opts.maxDistM ?? 20;

  const withDist = points
    .map((p) => ({ p, d: Math.hypot(p.x - x, p.y - y) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k);

  const nearest = withDist[0].d;
  /* Точка попала прямо в съёмочную — берём её высоту без взвешивания. */
  if (nearest < 0.01) {
    return { z: withDist[0].p.z, nearestM: 0, used: 1, reliable: true };
  }

  let sw = 0;
  let sz = 0;
  withDist.forEach(({ p, d }) => {
    const w = 1 / (d * d);
    sw += w;
    sz += w * p.z;
  });

  return {
    z: Number((sz / sw).toFixed(2)),
    nearestM: Number(nearest.toFixed(1)),
    used: withDist.length,
    reliable: nearest <= maxDist,
  };
}

/** Полилиния трассы → узлы сети: вершина = колодец. */
export function nodesFromPolyline(
  line: SurveyPolyline,
  points: SurveyPoint[],
  prefix = "К-",
  maxDistM = 20,
): { nodes: { id: string; x: number; y: number; groundElev: number }[]; problems: string[] } {
  const problems: string[] = [];
  const nodes = line.pts.map(([x, y], i) => {
    const s = sampleElevation(points, x, y, { maxDistM });
    if (!s) {
      problems.push("В съёмке нет точек с высотами — отметки колодцев снять не с чего.");
      return { id: `${prefix}${i + 1}`, x, y, groundElev: 0 };
    }
    if (!s.reliable) {
      problems.push(
        `${prefix}${i + 1}: ближайшая точка съёмки в ${s.nearestM} м — отметка ${s.z} снята по дальним точкам, проверьте её по плану.`,
      );
    }
    return { id: `${prefix}${i + 1}`, x: Number(x.toFixed(2)), y: Number(y.toFixed(2)), groundElev: s.z };
  });
  return { nodes, problems };
}
