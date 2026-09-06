/* ==================================================================
 * ГЕОМЕТРИЯ ДЛЯ АНИМАЦИИ НА СТРАНИЦЕ «ИНЖИНИРИНГ»
 *
 * Чертёж, который прорисовывается по мере прокрутки, должен быть
 * настоящим, а не декоративным: проектировщик, зашедший на сайт,
 * первым делом смотрит, сходятся ли размеры. Поэтому контуры здесь
 * не рисуются от руки — они считаются теми же функциями библиотеки
 * чертежей (drawings/structures/*), что и комплект DXF, который
 * потом скачивает пользователь. Меняются коэффициенты расчёта —
 * меняется и картинка на главной, рассинхронизироваться они не могут.
 *
 * Отличие от листа А1 только в подаче: здесь берутся план и разрез
 * без рамки, штампа и ведомости, координаты приводятся к аккуратному
 * viewBox, а размерные линии оставлены только самые важные — на
 * экране телефона больше и не прочитать.
 *
 * Модуль чистый (без обращений к сети и файлам), поэтому одинаково
 * работает и на сервере при отрисовке страницы, и в браузере.
 * ================================================================== */

import { mbrDefaults, mbrGeometry } from "../../drawings/structures/mbr";
import type { DrawingInput } from "../../drawings/core/types";

/** Отрезок контура: путь SVG и слой, по которому задаётся цвет и очередь появления. */
export type StoryPath = {
  d: string;
  /** contour — стены и перегородки, water — уровень воды, equip — оборудование,
   *  dim — размерные линии, hatch — штриховка бетона */
  layer: "contour" | "water" | "equip" | "dim" | "hatch";
};

export type StoryLabel = {
  x: number;
  y: number;
  text: string;
  /** размер шрифта в единицах viewBox */
  size: number;
  anchor: "start" | "middle" | "end";
  layer: "dim" | "text";
};

/** ключи подписи под чертежом — текст подставляет компонент на своём языке */
export type CaptionKey =
  | "flow"
  | "lines"
  | "size"
  | "depth"
  | "depthWork"
  | "heightTotal"
  | "wall"
  | "bottomElev";

export type StoryDrawing = {
  viewBox: string;
  paths: StoryPath[];
  labels: StoryLabel[];
  /** что за сооружение и по каким числам посчитано; заголовок — ключ вида "plan" | "section" */
  caption: { titleKey: "plan" | "section"; numbers: { key: CaptionKey; value: string }[] };
  /** объём воды в собственных единицах чертежа: разрезу нужен, чтобы
   *  сооружение на экране наполнялось снизу вверх, а не «проявляло»
   *  готовый уровень. У плана воды в сечении нет — поля нет */
  waterBox?: { x: number; y: number; w: number; h: number };
};

/**
 * Показательный объект для главной: посёлок на 1500 м³/сут.
 *
 * Расход подобран не случайно. При малых расходах и рабочей глубине
 * 4,5 м коридор биореактора вырождается: его длина становится меньше
 * ширины (при 510 м³/сут — 5400 против 4500 мм), сооружение работает
 * как ёмкость с перемешиванием, и на плане это выглядит непохоже на
 * коридорный биореактор. При 1500 м³/сут отношение длины к ширине
 * выходит на проектные 3:1, а габарит 14,9 × 10,5 м ложится в
 * горизонтальный формат экрана. Показывать надо типичный случай, а не
 * граничный.
 */
export const STORY_INPUT: DrawingInput = {
  object: "Посёлок",
  industryId: "settlement",
  q: 1500,
  hours: 24,
  qMaxH: 128,
  bod: 300,
  cod: 600,
  ss: 280,
  fats: 50,
  tn: 45,
  chain: ["screen", "sand", "avg", "bio", "post", "disinfect", "sludge"],
  tech: "MBR",
  vAvg: 250,
  vBio: 560,
  air: 1150,
  dryKg: 450,
  scale: "concrete",
  lang: "ru",
};

const f0 = (v: number) => Math.round(v).toLocaleString("ru-RU");
const f1 = (v: number) => v.toLocaleString("ru-RU", { maximumFractionDigits: 1 });

/** прямоугольник как путь SVG */
function rect(x: number, y: number, w: number, h: number): string {
  return `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`;
}

/** горизонтальная размерная линия с засечками */
function dimH(x1: number, x2: number, y: number, tick: number): string {
  return (
    `M ${x1} ${y} H ${x2}` +
    ` M ${x1} ${y - tick} L ${x1} ${y + tick}` +
    ` M ${x2} ${y - tick} L ${x2} ${y + tick}`
  );
}

/** вертикальная размерная линия с засечками */
function dimV(x: number, y1: number, y2: number, tick: number): string {
  return (
    `M ${x} ${y1} V ${y2}` +
    ` M ${x - tick} ${y1} L ${x + tick} ${y1}` +
    ` M ${x - tick} ${y2} L ${x + tick} ${y2}`
  );
}

/** косая штриховка внутри прямоугольника — обозначение железобетона */
function hatch(x: number, y: number, w: number, h: number, step: number): string {
  const parts: string[] = [];
  for (let s = -h; s < w; s += step) {
    const x1 = Math.max(x + s, x);
    const y1 = s < 0 ? y - s + (x - x) : y;
    const x2 = Math.min(x + s + h, x + w);
    const y2 = y + (x2 - (x + s));
    if (x2 > x1) parts.push(`M ${x1} ${Math.min(y1, y + h)} L ${x2} ${Math.min(y2, y + h)}`);
  }
  return parts.join(" ");
}

/**
 * ПЛАН МЕМБРАННОГО БИОРЕАКТОРА.
 *
 * Две технологические линии (п. 6.150 ҚМҚ 2.04.03-19 — секций не менее
 * двух), в каждой по ходу потока: аноксидная зона, аэробная зона,
 * мембранный отсек. Все размеры — из mbrGeometry, в миллиметрах;
 * для viewBox они делятся на 10, чтобы числа оставались читаемыми.
 */
export function mbrPlan(input: DrawingInput = STORY_INPUT): StoryDrawing {
  const p = mbrDefaults(input);
  const g = mbrGeometry(input, p);
  const k = 10; // мм → единицы viewBox
  const s = (v: number) => v / k;

  const wall = s(g.wall);
  const B = s(g.B);
  const L = s(g.L);
  const Lanox = s(g.Lanox);
  const Lmem = s(g.Lmem);
  const W = s(g.W);
  const Lout = s(g.Lout);

  /* Поля вокруг чертежа несимметричны, и это не произвол: слева нужно
     место только под подпись подводящего коллектора, справа — под неё же
     плюс вынесенную размерную линию ширины с её числом. Если задать одно
     общее поле, размер «10 500» уезжает за границу viewBox и обрезается. */
  const padLeft = 110;
  const padRight = 170;
  const padTop = 90;
  const padBottom = 90;
  const x0 = padLeft;
  const y0 = padTop;

  const paths: StoryPath[] = [];
  const labels: StoryLabel[] = [];

  /* наружный контур сооружения */
  paths.push({ d: rect(x0, y0, Lout, W), layer: "contour" });

  /* линии и перегородки зон */
  for (let i = 0; i < g.lines; i++) {
    const ly = y0 + wall + i * (B + wall);
    const lx = x0 + wall;
    /* контур линии в свету */
    paths.push({ d: rect(lx, ly, L, B), layer: "contour" });
    /* перегородка аноксидная / аэробная */
    if (Lanox > 0) {
      paths.push({ d: `M ${lx + Lanox} ${ly} V ${ly + B}`, layer: "contour" });
    }
    /* перегородка аэробная / мембранный отсек */
    paths.push({ d: `M ${lx + L - Lmem} ${ly} V ${ly + B}`, layer: "contour" });

    /* мембранные модули — вертикальные пакеты в отсеке */
    const mem = 4;
    for (let m = 0; m < mem; m++) {
      const mx = lx + L - Lmem + (Lmem / (mem + 1)) * (m + 1);
      paths.push({ d: `M ${mx} ${ly + B * 0.18} V ${ly + B * 0.82}`, layer: "equip" });
    }
    /* аэрационные линии в аэробной зоне */
    const rows = 5;
    for (let r = 0; r < rows; r++) {
      const ax = lx + Lanox + ((L - Lanox - Lmem) / (rows + 1)) * (r + 1);
      paths.push({ d: `M ${ax} ${ly + B * 0.12} V ${ly + B * 0.88}`, layer: "equip" });
    }
    /* мешалка аноксидной зоны */
    if (Lanox > 0) {
      const cx = lx + Lanox / 2;
      const cy = ly + B / 2;
      const r = Math.min(Lanox, B) * 0.16;
      paths.push({
        d: `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy}`,
        layer: "equip",
      });
    }

    labels.push({ x: lx + Lanox / 2, y: ly + B * 0.16, text: "АНОКСИДНАЯ", size: 11, anchor: "middle", layer: "text" });
    labels.push({ x: lx + Lanox + (L - Lanox - Lmem) / 2, y: ly + B * 0.16, text: "АЭРОБНАЯ ЗОНА", size: 11, anchor: "middle", layer: "text" });
    /* подпись мембранного отсека поднята над пакетами модулей: по центру
       отсека она ложилась бы прямо на их линии и не читалась */
    labels.push({ x: lx + L - Lmem / 2, y: ly + B * 0.12, text: "МЕМБРАНЫ", size: 9, anchor: "middle", layer: "text" });
  }

  /* подвод и отвод */
  const midY = y0 + W / 2;
  /* Подписи коллекторов подняты над самим отрезком трубы и вынесены
     наружу габарита: внутри сооружения на этой отметке проходит средняя
     продольная стена, текст поверх неё не читался бы. */
  paths.push({ d: `M ${x0 - 34} ${midY} H ${x0}`, layer: "water" });
  paths.push({ d: `M ${x0 + Lout} ${midY} H ${x0 + Lout + 34}`, layer: "water" });
  labels.push({ x: x0 - 6, y: midY - 10, text: "ОТ МЕХ. ОЧИСТКИ", size: 10, anchor: "end", layer: "text" });
  labels.push({ x: x0 + Lout + 6, y: midY - 10, text: "ПЕРМЕАТ", size: 10, anchor: "start", layer: "text" });

  /* размерные линии: общая длина и общая ширина */
  const dy = y0 + W + 42;
  paths.push({ d: dimH(x0, x0 + Lout, dy, 7), layer: "dim" });
  labels.push({ x: x0 + Lout / 2, y: dy - 10, text: `${f0(g.Lout)}`, size: 13, anchor: "middle", layer: "dim" });

  /* размер ширины вынесен за подпись «ПЕРМЕАТ», иначе выносная линия
     проходит прямо по тексту отвода */
  const dx = x0 + Lout + 90;
  paths.push({ d: dimV(dx, y0, y0 + W, 7), layer: "dim" });
  labels.push({ x: dx + 14, y: y0 + W / 2, text: `${f0(g.W)}`, size: 13, anchor: "start", layer: "dim" });

  const width = x0 + Lout + padRight;
  const height = y0 + W + padBottom;

  return {
    viewBox: `0 0 ${Math.round(width)} ${Math.round(height)}`,
    paths,
    labels,
    caption: {
      titleKey: "plan",
      numbers: [
        { key: "flow", value: `${f0(input.q)} м³/сут` },
        { key: "lines", value: `${g.lines}` },
        { key: "size", value: `${f0(g.Lout)} × ${f0(g.W)} мм` },
        { key: "depth", value: `${f1(g.Hw / 1000)} м` },
      ],
    },
  };
}

/**
 * РАЗРЕЗ ПО ЛИНИИ.
 *
 * Показывает то, чего не видно в плане и что чаще всего проверяют
 * первым: рабочую глубину, борт и отметки дна, воды и верха стен.
 */
export function mbrSection(input: DrawingInput = STORY_INPUT): StoryDrawing {
  const p = mbrDefaults(input);
  const g = mbrGeometry(input, p);
  const k = 10;
  const s = (v: number) => v / k;

  const wall = s(g.wall);
  const L = s(g.L);
  const Lanox = s(g.Lanox);
  const Lmem = s(g.Lmem);
  const Htot = s(g.Htot);
  const Hw = s(g.Hw);
  const slab = s(p.slabMm);

  /* Слева уходят две вынесенные размерные линии (рабочая глубина и полная
     высота) с числами — это заметно больше, чем поле сверху и снизу,
     поэтому левое поле считается отдельно, а не берётся общим. */
  const padLeft = 180;
  const padRight = 130;
  const pad = 90;
  const x0 = padLeft;
  const yTop = pad; // верх стен
  const yBottom = yTop + Htot; // дно в свету
  const yWater = yTop + (Htot - Hw);

  const paths: StoryPath[] = [];
  const labels: StoryLabel[] = [];

  /* стены и днище — сечение по железобетону */
  paths.push({ d: rect(x0 - wall, yTop, wall, Htot), layer: "contour" });
  paths.push({ d: rect(x0 + L, yTop, wall, Htot), layer: "contour" });
  paths.push({ d: rect(x0 - wall, yBottom, L + 2 * wall, slab), layer: "contour" });
  paths.push({ d: hatch(x0 - wall, yTop, wall, Htot, 9), layer: "hatch" });
  paths.push({ d: hatch(x0 + L, yTop, wall, Htot, 9), layer: "hatch" });
  paths.push({ d: hatch(x0 - wall, yBottom, L + 2 * wall, slab, 9), layer: "hatch" });

  /* перегородки зон */
  if (Lanox > 0) paths.push({ d: rect(x0 + Lanox, yTop, wall * 0.6, Htot), layer: "contour" });
  paths.push({ d: rect(x0 + L - Lmem, yTop, wall * 0.6, Htot), layer: "contour" });

  /* уровень воды */
  paths.push({ d: `M ${x0} ${yWater} H ${x0 + L}`, layer: "water" });
  const tri = 9;
  paths.push({
    d: `M ${x0 + L * 0.12 - tri} ${yWater - tri * 1.4} L ${x0 + L * 0.12 + tri} ${yWater - tri * 1.4} L ${x0 + L * 0.12} ${yWater} Z`,
    layer: "water",
  });

  /* аэрационная система по дну аэробной зоны */
  const rows = 7;
  for (let r = 0; r < rows; r++) {
    const ax = x0 + Lanox + ((L - Lanox - Lmem) / (rows + 1)) * (r + 1);
    paths.push({ d: `M ${ax} ${yBottom - 8} V ${yWater + 6}`, layer: "equip" });
  }
  /* мембранный пакет */
  paths.push({
    d: rect(x0 + L - Lmem + Lmem * 0.2, yWater + Hw * 0.12, Lmem * 0.6, Hw * 0.62),
    layer: "equip",
  });

  /* размерные линии: рабочая глубина и полная высота */
  const dx = x0 - wall - 40;
  paths.push({ d: dimV(dx, yWater, yBottom, 7), layer: "dim" });
  labels.push({ x: dx - 12, y: yWater + Hw / 2, text: `${f0(g.Hw)}`, size: 13, anchor: "end", layer: "dim" });

  const dx2 = dx - 46;
  paths.push({ d: dimV(dx2, yTop, yBottom, 7), layer: "dim" });
  labels.push({ x: dx2 - 12, y: yTop + Htot / 2, text: `${f0(g.Htot)}`, size: 13, anchor: "end", layer: "dim" });

  /* отметки */
  const mark = (y: number, v: number, text: string) => {
    const mx = x0 + L + wall + 24;
    paths.push({ d: `M ${x0 + L + wall} ${y} H ${mx + 46}`, layer: "dim" });
    paths.push({ d: `M ${mx} ${y - 9} L ${mx + 9} ${y} L ${mx} ${y + 9} Z`, layer: "dim" });
    labels.push({ x: mx + 14, y: y - 6, text: `${text} ${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(3)}`, size: 12, anchor: "start", layer: "dim" });
  };
  mark(yTop, g.top, "верх");
  mark(yWater, g.water, "вода");
  mark(yBottom, g.bottom, "дно");

  labels.push({ x: x0 + Lanox / 2, y: yTop - 16, text: "АНОКСИДНАЯ", size: 11, anchor: "middle", layer: "text" });
  labels.push({ x: x0 + Lanox + (L - Lanox - Lmem) / 2, y: yTop - 16, text: "АЭРОБНАЯ ЗОНА", size: 11, anchor: "middle", layer: "text" });
  labels.push({ x: x0 + L - Lmem / 2, y: yTop - 16, text: "МЕМБРАНЫ", size: 9, anchor: "middle", layer: "text" });

  const width = x0 + L + wall + padRight;
  const height = yBottom + slab + pad;

  return {
    viewBox: `0 0 ${Math.round(width)} ${Math.round(height)}`,
    paths,
    labels,
    waterBox: { x: x0, y: yWater, w: L, h: yBottom - yWater },
    caption: {
      titleKey: "section",
      numbers: [
        { key: "depthWork", value: `${f0(g.Hw)} мм` },
        { key: "heightTotal", value: `${f0(g.Htot)} мм` },
        { key: "wall", value: `${f0(g.wall)} мм` },
        { key: "bottomElev", value: `${g.bottom.toFixed(3)} м` },
      ],
    },
  };
}

/**
 * Числа расчёта, которые «вырастают» на третьем экране.
 *
 * Наименования и основания здесь не хранятся: страница четырёхъязычная,
 * и русская строка внутри узбекской или китайской версии смотрелась бы
 * так же плохо, как и любой другой недопереведённый текст. Модуль
 * отдаёт ключ, число и единицу, а подписи подставляет компонент из
 * своего словаря. Единственное исключение — ссылки на пункты
 * ҚМҚ 2.04.03-19: их номера одинаковы на всех языках.
 */
export type StoryNumberKey =
  | "flow"
  | "flowMax"
  | "vBio"
  | "lines"
  | "width"
  | "membrane"
  | "air"
  | "size";

export type StoryNumber = {
  key: StoryNumberKey;
  value: string;
  /** число для анимации счётчика; null — если величина составная */
  numeric: number | null;
  unit: string;
  /** пункт норматива, если величина им задана */
  clause?: string;
};

export function storyNumbers(input: DrawingInput = STORY_INPUT): StoryNumber[] {
  const p = mbrDefaults(input);
  const g = mbrGeometry(input, p);
  return [
    { key: "flow", value: f0(input.q), numeric: input.q, unit: "м³/сут" },
    { key: "flowMax", value: f0(input.qMaxH), numeric: input.qMaxH, unit: "м³/ч", clause: "ҚМҚ 2.04.03-19, п. 2.7, табл. 2" },
    { key: "vBio", value: f0(input.vBio), numeric: input.vBio, unit: "м³" },
    { key: "lines", value: String(g.lines), numeric: g.lines, unit: "шт.", clause: "ҚМҚ 2.04.03-19, п. 6.150" },
    { key: "width", value: f0(g.B), numeric: g.B, unit: "мм", clause: "ҚМҚ 2.04.03-19, п. 6.150" },
    { key: "membrane", value: f0(p.membraneAreaM2), numeric: p.membraneAreaM2, unit: "м²" },
    { key: "air", value: f0(input.air), numeric: input.air, unit: "м³/ч", clause: "ҚМҚ 2.04.03-19, п. 6.156, ф. (70)" },
    { key: "size", value: `${f0(g.Lout)} × ${f0(g.W)}`, numeric: null, unit: "мм" },
  ];
}

/* ==================================================================
 * ЕДИНАЯ СЦЕНА ДЛЯ КАМЕРЫ
 *
 * Анимация на странице — не набор слайдов, а один мир, по которому
 * едет камера: общий вид площадки → линия очистки → план биореактора
 * → его разрез. Это не приём ради красоты. Площадка, расстановка
 * сооружений и сам биореактор посчитаны настоящими функциями
 * библиотеки (layoutSite, mbrGeometry) и лежат в ОДНИХ координатах,
 * в метрах. Поэтому наезд камеры с генплана на биореактор физически
 * честен: масштаб не подменяется, сооружение действительно занимает
 * на площадке ровно столько места, сколько показано.
 *
 * Разрез на плане существовать не может, поэтому он вынесен ниже
 * площадки в том же мире — камера просто уезжает к нему вниз.
 *
 * Координаты плана и разреза остаются в собственных единицах модулей
 * (мм/10), а в мир вписываются через SVG-трансформацию: так ничего не
 * приходится пересчитывать в строках путей и негде ошибиться.
 * ================================================================== */

import type { StructureKind } from "../../drawings/core/types";
import { buildModels } from "../../drawings/package/build";
import { layoutSite } from "../../drawings/site/layout";

export type SceneShot = {
  key: "site" | "train" | "plan" | "section" | "profile";
  /** прямоугольник кадра в метрах: камера интерполирует между ними */
  x: number;
  y: number;
  w: number;
  h: number;
};

export type ScenePoly = { pts: [number, number][]; closed: boolean; layer: StoryPath["layer"] };

export type SceneBlock = {
  no: string;
  /** тип сооружения — по нему компонент подставляет название ступени
   *  на своём языке; по порядковому номеру этого делать нельзя, состав
   *  цепочки зависит от отрасли и меняется вместе с ней */
  kind: StructureKind;
  x: number;
  y: number;
  w: number;
  h: number;
  row: "water" | "sludge" | "building";
  /** порядковый номер по ходу потока — определяет очередь появления */
  order: number;
};

export type StoryScene = {
  /** контур участка, ограждение, проезды, резерв — в метрах */
  site: ScenePoly[];
  fence: ScenePoly | null;
  roads: { x: number; y: number; w: number; h: number }[];
  blocks: SceneBlock[];
  /** ось потока: от точки входа коллектора к точке выпуска */
  flow: [number, number][];
  /** габариты мира, чтобы посчитать кадры */
  world: { x: number; y: number; w: number; h: number };
  shots: SceneShot[];
  /** вписывание плана и разреза в мир: translate + scale для <g> */
  planFit: { x: number; y: number; k: number };
  sectionFit: { x: number; y: number; k: number };
  /**
   * Гидравлический профиль живёт в том же мире, ниже разреза, но в
   * собственной системе: по горизонтали — путь вдоль потока в метрах
   * один к одному, по вертикали отметки растянуты (vk), иначе перепад
   * в метр на полусотне метров пути на экране не разглядеть. Растяжка
   * вертикали на профилях — обычная чертёжная практика, а не подгонка.
   */
  profileFit: { x: number; y: number; vk: number };
  /** сколько всего площади требуют сооружения, м² — из расчёта */
  needM2: number;
  fits: boolean;
};

/** кадр с заданным центром и шириной,高 по соотношению сторон сцены */
function shot(key: SceneShot["key"], cx: number, cy: number, w: number, aspect: number): SceneShot {
  const h = w / aspect;
  return { key, x: cx - w / 2, y: cy - h / 2, w, h };
}

/** ширина кадра, при которой в него целиком входит прямоугольник w×h */
function fitW(w: number, h: number, aspect: number, margin = 1.08): number {
  return Math.max(w, h * aspect) * margin;
}

/**
 * Собрать сцену. `aspect` — соотношение сторон площадки на экране
 * (ширина/высота); кадры считаются под него, чтобы при наезде ничего
 * не обрезалось.
 */
export function storyScene(input: DrawingInput = STORY_INPUT, aspect = 16 / 9): StoryScene {
  const models = buildModels(input).map((e) => e.model);
  const L = layoutSite(input.site, models, {});
  const prof = storyProfile(input);

  const site: ScenePoly[] = [{ pts: L.site.map((p) => [p[0], p[1]] as [number, number]), closed: true, layer: "contour" }];
  const fence: ScenePoly | null = L.fence.length
    ? { pts: L.fence.map((p) => [p[0], p[1]] as [number, number]), closed: true, layer: "dim" }
    : null;

  /* Порядок появления блоков — по ходу потока: сначала линия воды в
     порядке очистки, затем линия осадка, затем здания. Именно так
     проектировщик и читает генплан. */
  const rowRank = { water: 0, sludge: 1, building: 2 } as const;
  const sorted = [...L.placed].sort((a, b) => rowRank[a.row] - rowRank[b.row] || a.u0 - b.u0);
  const blocks: SceneBlock[] = sorted.map((p, i) => ({
    no: p.no,
    kind: p.model.kind,
    x: p.x,
    y: p.y,
    w: p.w,
    h: p.h,
    row: p.row,
    order: i,
  }));

  /* ось потока — ломаная по центрам сооружений линии воды */
  const water = sorted.filter((p) => p.row === "water");
  const flow: [number, number][] = [
    [L.inlet[0], L.inlet[1]],
    ...water.map((p) => [p.x + p.w / 2, p.y + p.h / 2] as [number, number]),
    [L.outlet[0], L.outlet[1]],
  ];

  /* габарит участка */
  const xs = L.site.map((p) => p[0]);
  const ys = L.site.map((p) => p[1]);
  const sx = Math.min(...xs);
  const sy = Math.min(...ys);
  const sw = Math.max(...xs) - sx;
  const sh = Math.max(...ys) - sy;

  /* вписывание плана биореактора: его единицы — мм/10, то есть
     1 единица = 0,01 м; поля вокруг чертежа надо снять, чтобы наружный
     угол сооружения встал ровно на своё место на площадке.
     Поля у плана несимметричны (слева 110 единиц под подпись коллектора,
     сверху 90), поэтому смещение по X и Y разное: возьми одно общее —
     и чертёж уедет с блока на 0,2 м, что как раз и увидит проектировщик,
     ради которого вся эта честность и затевалась. */
  const plan = mbrPlan(input);
  const k = 0.01;
  const PLAN_PAD_X = 110;
  const PLAN_PAD_Y = 90;
  /* у разреза левое поле шире (180 единиц под две вынесенные размерные
     линии) — снимаем его, и тело разреза встаёт точно под телом плана */
  const SEC_PAD_X = 180;
  const SEC_PAD_Y = 90;
  const mbr = L.placed.find((p) => p.model.kind === "mbr");
  const px = mbr ? mbr.x : sx + sw / 2;
  const py = mbr ? mbr.y : sy + sh / 2;
  const planFit = { x: px - PLAN_PAD_X * k, y: py - PLAN_PAD_Y * k, k };

  /* разрез вынесен под площадку: на плане ему места нет */
  const sectionY = sy + sh + Math.max(18, sh * 0.25);
  const sectionFit = { x: px - SEC_PAD_X * k, y: sectionY - SEC_PAD_Y * k, k };

  const section = mbrSection(input);
  const [, , secW, secH] = section.viewBox.split(" ").map(Number);

  /* профиль — ещё ниже разреза; вертикаль растянута, чтобы перепад
     уровней воды был виден рядом с длиной пути */
  const profileY = sectionY + secH * k + Math.max(14, sh * 0.2);
  const profileFit = { x: 0, y: profileY, vk: 6 };

  /* Мир должен накрывать и содержимое, и все кадры камеры: на широком
     экране кадр общего вида шире участка, на узком — выше, и если мир
     останется по участку, на краях кадра будет видна граница фона. */
  const contentBox = {
    x0: sx - sw * 0.12,
    y0: sy - sh * 0.12,
    x1: sx + sw * 1.12,
    y1: profileY + (prof.elevMax - prof.elevMin) * profileFit.vk + 14,
  };

  /* КАДРЫ.
     site  — весь участок с полем;
     train — линия очистки: от входа коллектора до выпуска;
     plan  — наезд на биореактор с запасом на размерные линии;
     section — разрез целиком. */
  const [, , planW, planH] = plan.viewBox.split(" ").map(Number);
  /* Кадр линии очистки строится по самим сооружениям, а не по точкам
     входа и выпуска на границе участка: те стоят на краях, и кадр по
     ним совпал бы с общим видом — наезда бы не получилось. */
  const trainX0 = water.length ? Math.min(...water.map((p) => p.x)) : sx;
  const trainX1 = water.length ? Math.max(...water.map((p) => p.x + p.w)) : sx + sw;
  const trainY0 = water.length ? Math.min(...water.map((p) => p.y)) : sy;
  const trainY1 = water.length ? Math.max(...water.map((p) => p.y + p.h)) : sy + sh;
  const trainY = (trainY0 + trainY1) / 2;

  const shots: SceneShot[] = [
    shot("site", sx + sw / 2, sy + sh / 2, fitW(sw, sh, aspect, 1.08), aspect),
    /* по высоте ряд воды узкий, поэтому здесь важна только ширина,
       но fitW всё равно страхует от вертикального экрана телефона */
    shot("train", (trainX0 + trainX1) / 2, trainY, fitW(trainX1 - trainX0, trainY1 - trainY0, aspect, 1.22), aspect),
    /* Кадры плана и разреза считаются прямо от их вписывания в мир: так
       центр кадра не может разойтись с тем, где чертёж на самом деле.
       Ширина берётся не по ширине чертежа, а по большей из двух сторон,
       приведённых к формату экрана, — иначе на вытянутом по вертикали
       чертеже кадр сойдётся по ширине и срежет нижнюю размерную линию,
       то есть ровно то, ради чего на чертёж и наезжают. */
    shot("plan", planFit.x + (planW * k) / 2, planFit.y + (planH * k) / 2, fitW(planW * k, planH * k, aspect), aspect),
    shot("section", sectionFit.x + (secW * k) / 2, sectionFit.y + (secH * k) / 2, fitW(secW * k, secH * k, aspect), aspect),
    /* профиль: по горизонтали — путь вдоль потока, по вертикали —
       отметки, растянутые в vk раз и отложенные вниз от profileFit.y */
    shot(
      "profile",
      (prof.uMin + prof.uMax) / 2,
      profileFit.y - ((prof.elevMax + prof.elevMin) / 2) * profileFit.vk,
      /* Поля вокруг профиля скупые, и это не жадность. Из-за растянутой
         вертикали профиль почти квадратный (39 м пути против 36 единиц
         по высоте), а экран широкий: кадр всё равно строится по высоте,
         и каждая лишняя доля поля отгоняет камеру назад, оставляя по
         бокам пустоту. Снизу оставлено ровно на строку отметки дна. */
      fitW((prof.uMax - prof.uMin) * 1.14, (prof.elevMax - prof.elevMin) * profileFit.vk * 1.16, aspect),
      aspect
    ),
  ];

  /* объединяем содержимое со всеми кадрами */
  let wx0 = contentBox.x0;
  let wy0 = contentBox.y0;
  let wx1 = contentBox.x1;
  let wy1 = contentBox.y1;
  for (const sh of shots) {
    if (sh.x < wx0) wx0 = sh.x;
    if (sh.y < wy0) wy0 = sh.y;
    if (sh.x + sh.w > wx1) wx1 = sh.x + sh.w;
    if (sh.y + sh.h > wy1) wy1 = sh.y + sh.h;
  }
  const world = { x: wx0, y: wy0, w: wx1 - wx0, h: wy1 - wy0 };

  return {
    site,
    fence,
    roads: L.roads.map((r) => ({ x: r.x, y: r.y, w: r.w, h: r.h })),
    blocks,
    flow,
    world,
    shots,
    planFit,
    sectionFit,
    profileFit,
    needM2: L.needM2,
    fits: L.fits,
  };
}

/* ==================================================================
 * ГИДРАВЛИЧЕСКИЙ ПРОФИЛЬ ДЛЯ СЦЕНЫ
 *
 * Ещё один этап, который на сайте показать нечем, кроме настоящего
 * расчёта: вода идёт по сооружениям самотёком, и весь вопрос — хватит
 * ли перепада. computeProfile считает это от точки сброса назад,
 * вычитая потери на сооружениях и уклоны труб, где уклон берётся
 * большим из условия незаиливания (Шези–Маннинг при минимальной
 * скорости, табл. 16 п. 2.34) и практического 1/DN.
 *
 * Для сцены профиль разворачивается в отдельный кадр: горизонталь —
 * путь вдоль потока в метрах, вертикаль — отметки. Масштабы по осям
 * разные (перепад около метра на сотне метров пути иначе не увиден),
 * и это на чертежах профиля обычная практика.
 * ================================================================== */

import { computeProfile } from "../../drawings/site/profile";

export type ProfileStep = {
  no: string;
  /** координаты вдоль потока, м */
  u0: number;
  u1: number;
  /** отметки, м от планировочной 0.000 */
  bottom: number;
  water: number;
  top: number;
  waterIn: number;
  waterOut: number;
  headLoss: number;
};

export type StoryProfile = {
  steps: ProfileStep[];
  /** ломаная уровня воды вдоль всего пути: [u, отметка] */
  line: [number, number][];
  /** земля — планировочная отметка 0.000 */
  groundElev: number;
  /** пределы: путь и отметки */
  uMin: number;
  uMax: number;
  elevMin: number;
  elevMax: number;
  requiredInletInvert: number;
  dischargeElev: number;
  needsPumping: boolean;
  pumpHeadM: number;
};

export function storyProfile(input: DrawingInput = STORY_INPUT): StoryProfile {
  const models = buildModels(input).map((e) => e.model);
  const layout = layoutSite(input.site, models, {});
  const pr = computeProfile(input, models, layout);

  const steps: ProfileStep[] = pr.nodes.map((n) => ({
    no: n.no,
    u0: n.u0,
    u1: n.u1,
    bottom: n.bottom,
    water: n.water,
    top: n.top,
    waterIn: n.waterIn,
    waterOut: n.waterOut,
    headLoss: n.headLoss,
  }));

  /* Ломаная уровня воды: внутри сооружения уровень постоянен, между
     сооружениями падает по уклону трубы. Именно этот ступенчатый спуск
     и объясняет проектировщику, почему самотёк проходит или нет. */
  const line: [number, number][] = [];
  for (const n of steps) {
    line.push([n.u0, n.waterIn]);
    line.push([n.u1, n.waterOut]);
  }

  const us = steps.flatMap((n) => [n.u0, n.u1]);
  const elevs = steps.flatMap((n) => [n.bottom, n.top, n.waterIn, n.waterOut]);
  elevs.push(pr.requiredInletInvert, pr.dischargeElev, 0);

  return {
    steps,
    line,
    groundElev: 0,
    uMin: us.length ? Math.min(...us) : 0,
    uMax: us.length ? Math.max(...us) : 1,
    elevMin: Math.min(...elevs),
    elevMax: Math.max(...elevs),
    requiredInletInvert: pr.requiredInletInvert,
    dischargeElev: pr.dischargeElev,
    needsPumping: pr.needsPumping,
    pumpHeadM: pr.pumpHeadM,
  };
}
