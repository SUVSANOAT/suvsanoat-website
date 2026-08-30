"use client";

import { useEffect, useRef, useState } from "react";

import type { Language } from "../translations";
import s from "./new.module.css";

/* --------------------------------------------------------------
 * ПЕРВЫЙ ЭКРАН: СЛАЙДЕР ПРОЕКТНЫХ РАЗРЕЗОВ
 *
 * Пять аннотированных разрезов в чертёжном стиле: зоны с выносками,
 * размерные линии, штриховка стен, отметки уровней. Подписи внутри
 * чертежа — по-русски, как в проектной документации; вкладки и
 * подписи под чертежом переводятся. Автолистание каждые 8 секунд.
 * -------------------------------------------------------------- */

const LINE = "rgba(242,245,246,0.45)";
const FAINT = "rgba(242,245,246,0.16)";
const DIM = "#3ec3e6";
const WATER = "rgba(62,195,230,0.10)";
const FAT = "rgba(255,183,77,0.4)";
const SLUDGE = "rgba(150,110,80,0.45)";
const RETURN = "rgba(255,150,80,0.55)";
const TXT = "rgba(242,245,246,0.62)";
const BRIGHT = "rgba(242,245,246,0.9)";

const FS = 12;
const LS = "0.16em";

type Slide = {
  key: string;
  code: string;
  name: Record<Language, string>;
  sub: Record<Language, string>;
};

const NOTE: Record<Language, string> = {
  ru: "Ø И ОТМЕТКИ — ПРЕДВАРИТЕЛЬНЫЕ",
  uz: "O‘LCHAMLAR — DASTLABKI",
  en: "DIMENSIONS PRELIMINARY",
  zh: "尺寸为初步值",
};

const SLIDES: Slide[] = [
  {
    key: "osv",
    code: "ПРО-ОСВ",
    name: { ru: "Комплекс очистных сооружений", uz: "Tozalash inshootlari majmuasi", en: "Treatment complex", zh: "污水处理综合设施" },
    sub: { ru: "РАЗРЕЗ ПО СООРУЖЕНИЯМ", uz: "INSHOOTLAR KESIMI", en: "SECTION THROUGH UNITS", zh: "构筑物剖面" },
  },
  {
    key: "bio",
    code: "БИО-ЛОС",
    name: { ru: "Блочная установка биоочистки", uz: "Blokli bio tozalash qurilmasi", en: "Package bio plant", zh: "一体化生化设备" },
    sub: { ru: "ПРОДОЛЬНЫЙ РАЗРЕЗ", uz: "BO‘YLAMA KESIM", en: "LONGITUDINAL SECTION", zh: "纵剖面" },
  },
  {
    key: "nef",
    code: "НЕФ",
    name: { ru: "Нефтеуловитель для автомойки", uz: "Avtoyuvish uchun neft tutgich", en: "Car-wash oil separator", zh: "洗车场除油器" },
    sub: { ru: "ПРОДОЛЬНЫЙ РАЗРЕЗ", uz: "BO‘YLAMA KESIM", en: "LONGITUDINAL SECTION", zh: "纵剖面" },
  },
  {
    key: "kns",
    code: "КНС",
    name: { ru: "Насосная станция", uz: "Nasos stansiyasi", en: "Pumping station", zh: "污水泵站" },
    sub: { ru: "ВЕРТИКАЛЬНЫЙ РАЗРЕЗ", uz: "VERTIKAL KESIM", en: "VERTICAL SECTION", zh: "竖向剖面" },
  },
  {
    key: "ro",
    code: "RO",
    name: { ru: "Установка обратного осмоса", uz: "Teskari osmos qurilmasi", en: "Reverse osmosis unit", zh: "反渗透装置" },
    sub: { ru: "КОМПОНОВКА БЛОКА", uz: "BLOK KOMPONOVKASI", en: "SKID LAYOUT", zh: "撬装布置" },
  },
];

/* подпись чертёжным шрифтом */
function T({
  x, y, children, anchor = "start", bright = false, size = FS,
}: { x: number; y: number; children: React.ReactNode; anchor?: "start" | "middle" | "end"; bright?: boolean; size?: number }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      letterSpacing={LS}
      fill={bright ? BRIGHT : TXT}
      fontFamily="ui-monospace, 'Cascadia Mono', Consolas, monospace"
    >
      {children}
    </text>
  );
}

/* размерная линия по горизонтали: засечки-штрихи, как на чертеже */
function DimH({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g stroke={FAINT} strokeWidth="1">
      <line x1={x1} y1={y - 8} x2={x1} y2={y + 8} />
      <line x1={x2} y1={y - 8} x2={x2} y2={y + 8} />
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <line x1={x1 - 5} y1={y + 5} x2={x1 + 5} y2={y - 5} stroke={LINE} />
      <line x1={x2 - 5} y1={y + 5} x2={x2 + 5} y2={y - 5} stroke={LINE} />
      <T x={(x1 + x2) / 2} y={y - 8} anchor="middle">{label}</T>
    </g>
  );
}

/* размерная линия по вертикали, подпись повёрнута */
function DimV({ x, y1, y2, label }: { x: number; y1: number; y2: number; label: string }) {
  return (
    <g stroke={FAINT} strokeWidth="1">
      <line x1={x - 8} y1={y1} x2={x + 8} y2={y1} />
      <line x1={x - 8} y1={y2} x2={x + 8} y2={y2} />
      <line x1={x} y1={y1} x2={x} y2={y2} />
      <line x1={x - 5} y1={y1 + 5} x2={x + 5} y2={y1 - 5} stroke={LINE} />
      <line x1={x - 5} y1={y2 + 5} x2={x + 5} y2={y2 - 5} stroke={LINE} />
      <g transform={`rotate(-90 ${x - 10} ${(y1 + y2) / 2})`}>
        <T x={x - 10} y={(y1 + y2) / 2} anchor="middle">{label}</T>
      </g>
    </g>
  );
}

/* зона: подпись сверху + выноска вниз */
function Zone({ x, y, to, label }: { x: number; y: number; to: number; label: string }) {
  return (
    <g>
      <T x={x} y={y} anchor="middle">{label}</T>
      <line x1={x} y1={y + 6} x2={x} y2={to} stroke={FAINT} strokeDasharray="2 4" />
    </g>
  );
}

/* стрелка потока */
function Flow({ x, y, dir = 1, len = 40 }: { x: number; y: number; dir?: 1 | -1; len?: number }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x + len * dir} y2={y} stroke={DIM} strokeWidth="2" />
      <path d={`M ${x + (len + 9) * dir} ${y} l ${-9 * dir} -4.5 v 9 z`} fill={DIM} />
    </g>
  );
}

/* уровень грунта со штрихами */
function Ground({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  const n = Math.floor((x2 - x1) / 34);
  return (
    <g stroke={FAINT}>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={LINE} />
      {Array.from({ length: n }, (_, i) => (
        <line key={i} x1={x1 + 10 + i * 34} y1={y} x2={x1 + i * 34} y2={y + 9} />
      ))}
    </g>
  );
}

/* пузырьки аэрации */
function Bubbles({ x0, w, y0, h, n, calm }: { x0: number; w: number; y0: number; h: number; n: number; calm: boolean }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <circle
          key={i}
          className={calm ? undefined : s.cutRise}
          style={calm ? undefined : { animationDelay: `${(i * 0.9) % 4}s`, animationDuration: `${2.8 + (i % 4) * 0.5}s` }}
          cx={x0 + ((i * 29) % w)}
          cy={y0 + h - ((i * 37) % h)}
          r={2}
          fill="none"
          stroke={DIM}
          strokeWidth="1"
          opacity="0.7"
        />
      ))}
    </g>
  );
}

/* точечная загрузка (доочистка, песок) */
function Dots({ x0, w, y0, h, step = 14 }: { x0: number; w: number; y0: number; h: number; step?: number }) {
  const cols = Math.floor(w / step);
  const rows = Math.floor(h / step);
  return (
    <g fill={FAINT}>
      {Array.from({ length: cols * rows }, (_, i) => {
        const r = Math.floor(i / cols);
        return (
          <circle
            key={i}
            cx={x0 + (i % cols) * step + (r % 2 ? step / 2 : 0) + 4}
            cy={y0 + r * step + 5}
            r={1.4}
          />
        );
      })}
    </g>
  );
}

/* штриховка стен: полоса между двойным контуром */
function Hatch({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={id} patternUnits="userSpaceOnUse" width="8" height="8">
        <path d="M 0 8 L 8 0" stroke={FAINT} strokeWidth="1" />
      </pattern>
    </defs>
  );
}

/* ---------- ПРО-ОСВ: комплекс из отдельных сооружений ---------- */
function OsvCut({ calm }: { calm: boolean }) {
  const boxes = [
    { x: 100, w: 90, label: "РЕШЁТКА" },
    { x: 210, w: 110, label: "ПЕСКОЛОВКА" },
    { x: 340, w: 130, label: "ПЕРВИЧНЫЙ" },
    { x: 490, w: 160, label: "АЭРОТЕНК" },
    { x: 670, w: 130, label: "ВТОРИЧНЫЙ" },
    { x: 820, w: 100, label: "УФ" },
  ];
  const y0 = 200;
  const y1 = 430;

  return (
    <svg viewBox="0 0 960 540" aria-hidden="true">
      <DimH x1={100} x2={920} y={120} label="42 000" />
      <DimV x={62} y1={y0} y2={y1} label="4 500" />

      {boxes.map((b) => (
        <g key={b.label}>
          <rect x={b.x} y={y0} width={b.w} height={y1 - y0} fill="none" stroke={LINE} strokeWidth="1.6" />
          <rect x={b.x + 6} y={y0 + 6} width={b.w - 12} height={y1 - y0 - 12} fill="none" stroke={FAINT} />
          <T x={b.x + b.w / 2} y={172} anchor="middle">{b.label}</T>
          <line x1={b.x + b.w / 2} y1={178} x2={b.x + b.w / 2} y2={y0 - 4} stroke={FAINT} strokeDasharray="2 4" />
          <line x1={b.x + 10} y1={y0 + 34} x2={b.x + b.w - 10} y2={y0 + 34} stroke={DIM} strokeDasharray="5 5" opacity="0.5" />
        </g>
      ))}

      {/* перетоки между сооружениями */}
      {boxes.slice(0, -1).map((b, i) => (
        <line key={i} x1={b.x + b.w} y1={252} x2={boxes[i + 1].x} y2={252} stroke={DIM} strokeWidth="1.6" opacity="0.6" />
      ))}

      {/* решётка */}
      <line x1={118} y1={410} x2={172} y2={220} stroke={DIM} strokeWidth="1.6" opacity="0.8" />
      {Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1={124 + i * 7} y1={396 - i * 25} x2={114 + i * 7} y2={388 - i * 25} stroke={DIM} opacity="0.6" />
      ))}

      {/* песколовка: песок */}
      <Dots x0={222} w={88} y0={392} h={28} step={11} />

      {/* первичный: конус осадка */}
      <path d="M 352 424 L 405 372 L 458 424 z" fill={SLUDGE} />

      {/* аэротенк: воздух и пузырьки */}
      <line x1={570} y1={92} x2={570} y2={416} stroke={DIM} strokeWidth="1.8" opacity="0.8" />
      <T x={584} y={104} bright>ВОЗДУХ</T>
      {Array.from({ length: 4 }, (_, i) => (
        <line key={i} x1={504 + i * 36} y1={418} x2={526 + i * 36} y2={418} stroke={DIM} strokeWidth="3" opacity="0.7" />
      ))}
      <Bubbles x0={504} w={132} y0={250} h={160} n={10} calm={calm} />

      {/* вторичный: тонкослойный модуль + конус */}
      {Array.from({ length: 4 }, (_, i) => (
        <line key={i} x1={686 + i * 26} y1={392} x2={706 + i * 26} y2={272} stroke={DIM} strokeWidth="1.4" opacity="0.5" />
      ))}
      <path d="M 682 424 L 735 380 L 788 424 z" fill={SLUDGE} />

      {/* УФ: лампы */}
      {Array.from({ length: 3 }, (_, i) => (
        <line key={i} x1={834} y1={290 + i * 34} x2={906} y2={290 + i * 34} stroke={DIM} strokeWidth="2.4" opacity="0.8" />
      ))}

      {/* возвратный ил */}
      <path d="M 735 430 V 476 H 570 V 430" fill="none" stroke={RETURN} strokeWidth="1.4" strokeDasharray="6 5" />
      <T x={652} y={498} anchor="middle">ВОЗВРАТНЫЙ ИЛ</T>

      {/* вход и выход */}
      <T x={30} y={230}>СТОК</T>
      <Flow x={30} y={252} len={60} />
      <T x={930} y={230} anchor="end" bright>В ВОДОЁМ</T>
      <Flow x={860} y={252} len={50} />
    </svg>
  );
}

/* ---------- БИО-ЛОС: продольный разрез цилиндра ---------- */
function BioCut({ calm }: { calm: boolean }) {
  return (
    <svg viewBox="0 0 960 540" aria-hidden="true">
      <DimV x={70} y1={150} y2={430} label="⌀ 2 000" />
      <DimH x1={120} x2={840} y={486} label="6 000" />

      {/* двойная стенка корпуса */}
      <rect x={120} y={150} width={720} height={280} rx={140} fill="none" stroke={LINE} strokeWidth="1.8" />
      <rect x={130} y={160} width={700} height={260} rx={130} fill="none" stroke={FAINT} />
      <rect x={132} y={196} width={696} height={222} rx={110} fill={WATER} />

      {/* зоны */}
      <Zone x={228} y={116} to={148} label="УСРЕДНЕНИЕ" />
      <Zone x={445} y={116} to={148} label="АЭРАЦИЯ" />
      <Zone x={640} y={116} to={148} label="ОТСТАИВАНИЕ" />
      <Zone x={782} y={116} to={148} label="ДООЧИСТКА" />
      <line x1={332} y1={166} x2={332} y2={424} stroke={LINE} strokeWidth="1.6" />
      <line x1={560} y1={166} x2={560} y2={424} stroke={LINE} strokeWidth="1.6" />
      <line x1={722} y1={166} x2={722} y2={424} stroke={LINE} strokeWidth="1.6" />

      {/* уровень воды */}
      <line x1={140} y1={200} x2={820} y2={200} stroke={DIM} strokeDasharray="6 6" opacity="0.55" />
      <path d="M 252 186 h 16 l -8 10 z" fill="none" stroke={DIM} />

      {/* вход и выход */}
      <T x={30} y={168} bright>ВХОД · 20 м³/сут</T>
      <Flow x={30} y={186} len={72} />
      <T x={930} y={210} anchor="end" bright>БПК₅ ≤ 15 мг/л</T>
      <Flow x={848} y={232} len={62} />

      {/* аэрация: воздух, аэраторы, пузырьки */}
      <line x1={470} y1={86} x2={470} y2={402} stroke={DIM} strokeWidth="1.8" opacity="0.8" />
      <T x={484} y={98} bright>ВОЗДУХ</T>
      {Array.from({ length: 5 }, (_, i) => (
        <line key={i} x1={352 + i * 42} y1={404} x2={378 + i * 42} y2={404} stroke={DIM} strokeWidth="3.4" opacity="0.7" />
      ))}
      <Bubbles x0={348} w={200} y0={216} h={180} n={14} calm={calm} />

      {/* отстаивание: пластины + ил */}
      {Array.from({ length: 4 }, (_, i) => (
        <line key={i} x1={584 + i * 28} y1={330} x2={606 + i * 28} y2={222} stroke={DIM} strokeWidth="1.4" opacity="0.5" />
      ))}
      <path d="M 578 420 L 641 352 L 704 420 z" fill={SLUDGE} />

      {/* доочистка: загрузка */}
      <Dots x0={730} w={92} y0={224} h={186} />

      {/* редкие частицы в усреднителе */}
      <Bubbles x0={160} w={150} y0={230} h={160} n={4} calm={calm} />
    </svg>
  );
}

/* ---------- НЕФ: продольный разрез нефтеуловителя ---------- */
function NefCut({ calm }: { calm: boolean }) {
  return (
    <svg viewBox="0 0 960 540" aria-hidden="true">
      <Hatch id="hatch-nef" />

      <Ground x1={60} x2={900} y={150} />
      <DimH x1={160} x2={800} y={492} label="3 750" />
      <DimV x={128} y1={180} y2={430} label="1 800" />

      {/* двойная стенка со штриховкой */}
      <rect x={160} y={180} width={640} height={250} fill="none" stroke={LINE} strokeWidth="1.8" />
      <rect x={170} y={190} width={620} height={230} fill="none" stroke={FAINT} />
      <path
        d="M 160 180 h 640 v 250 h -640 z M 170 190 v 230 h 620 v -230 z"
        fill="url(#hatch-nef)"
        fillRule="evenodd"
      />
      <rect x={172} y={210} width={616} height={208} fill={WATER} />

      {/* горловины */}
      <path d="M 240 180 v -20 h 52 v 20" fill="none" stroke={LINE} strokeWidth="1.6" />
      <path d="M 480 180 v -20 h 52 v 20" fill="none" stroke={LINE} strokeWidth="1.6" />

      {/* зоны */}
      <Zone x={270} y={116} to={155} label="ПЕСКОЛОВКА" />
      <Zone x={510} y={116} to={155} label="ТОНКОСЛОЙНЫЙ МОДУЛЬ" />
      <Zone x={730} y={116} to={155} label="ОТВОД" />
      <line x1={390} y1={196} x2={390} y2={424} stroke={LINE} strokeWidth="1.6" />
      <line x1={646} y1={180} x2={646} y2={380} stroke={LINE} strokeWidth="1.6" />

      {/* уровень воды и плёнка нефти */}
      <line x1={176} y1={212} x2={784} y2={212} stroke={DIM} strokeDasharray="6 6" opacity="0.5" />
      <rect x={394} y={214} width={248} height={12} fill={FAT} />

      {/* песок */}
      <Dots x0={182} w={196} y0={392} h={28} step={11} />

      {/* ламели */}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={408 + i * 28} y1={396} x2={432 + i * 28} y2={252} stroke={DIM} strokeWidth="1.4" opacity="0.55" />
      ))}

      {/* всплывающие капли */}
      {Array.from({ length: 6 }, (_, i) => (
        <circle
          key={i}
          className={calm ? undefined : s.cutRise}
          style={calm ? undefined : { animationDelay: `${(i * 1.4) % 4}s`, animationDuration: `${3.4 + (i % 3)}s` }}
          cx={410 + ((i * 41) % 220)}
          cy={380 - ((i * 47) % 120)}
          r={2.4}
          fill="rgba(255,160,80,0.85)"
        />
      ))}

      {/* вход и выход */}
      <T x={30} y={228} bright>СТОК</T>
      <Flow x={30} y={248} len={74} />
      <T x={920} y={318} anchor="end" bright>ОЧИЩЕННАЯ ВОДА</T>
      <Flow x={806} y={340} len={100} />
    </svg>
  );
}

/* ---------- КНС: вертикальный разрез ---------- */
function KnsCut({ calm }: { calm: boolean }) {
  const x0 = 430;
  const x1 = 610;
  const y0 = 150;
  const y1 = 470;

  return (
    <svg viewBox="0 0 960 540" aria-hidden="true">
      <Hatch id="hatch-kns" />

      <Ground x1={90} x2={430} y={170} />
      <Ground x1={610} x2={900} y={170} />

      {/* корпус: двойная стенка со штриховкой */}
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="none" stroke={LINE} strokeWidth="1.8" />
      <rect x={x0 + 12} y={y0 + 12} width={x1 - x0 - 24} height={y1 - y0 - 24} fill="none" stroke={FAINT} />
      <path
        d={`M ${x0} ${y0} h ${x1 - x0} v ${y1 - y0} h ${-(x1 - x0)} z M ${x0 + 12} ${y0 + 12} v ${y1 - y0 - 24} h ${x1 - x0 - 24} v ${-(y1 - y0 - 24)} z`}
        fill="url(#hatch-kns)"
        fillRule="evenodd"
      />

      {/* люк */}
      <rect x={488} y={y0 - 14} width={64} height={14} fill="none" stroke={LINE} strokeWidth="1.6" />
      <T x={520} y={108} anchor="middle" bright>ЛЮК · ГЕРМЕТИЧНЫЙ</T>
      <line x1={520} y1={114} x2={520} y2={y0 - 18} stroke={FAINT} strokeDasharray="2 4" />

      {/* вода */}
      <rect x={x0 + 14} y={292} width={x1 - x0 - 28} height={162} fill={WATER} />

      {/* уровни */}
      {[
        { y: 292, label: "ВКЛ", op: 0.8 },
        { y: 344, label: "ВЫКЛ", op: 0.55 },
        { y: 396, label: "СУХОЙ ХОД", op: 0.35 },
      ].map((lvl) => (
        <g key={lvl.label}>
          <line x1={x0 + 14} y1={lvl.y} x2={x1 - 14} y2={lvl.y} stroke={DIM} strokeDasharray="6 5" opacity={lvl.op} />
          <line x1={x1 + 4} y1={lvl.y} x2={x1 + 34} y2={lvl.y} stroke={FAINT} strokeDasharray="2 4" />
          <T x={x1 + 42} y={lvl.y + 4}>{lvl.label}</T>
        </g>
      ))}

      {/* насосы */}
      {[486, 556].map((px) => (
        <g key={px}>
          <rect x={px - 16} y={400} width={32} height={26} fill="none" stroke={DIM} strokeWidth="1.6" />
          <circle cx={px} cy={442} r={14} fill="none" stroke={DIM} strokeWidth="1.6" />
        </g>
      ))}
      <T x={520} y={494} anchor="middle" size={FS - 2}>РАБОЧИЙ · РЕЗЕРВНЫЙ</T>

      {/* напорный трубопровод: стояк, задвижка, клапан */}
      <line x1={584} y1={400} x2={584} y2={206} stroke={DIM} strokeWidth="2" opacity="0.85" />
      <line x1={584} y1={206} x2={800} y2={206} stroke={DIM} strokeWidth="2" opacity="0.85" />
      <path d="M 660 198 l 16 8 l -16 8 z M 692 198 l -16 8 l 16 8 z" fill="none" stroke={DIM} strokeWidth="1.6" />
      <circle cx={730} cy={206} r={11} fill="none" stroke={DIM} strokeWidth="1.6" />
      <line x1={722} y1={199} x2={738} y2={213} stroke={DIM} />
      <path d="M 812 206 l -9 -4.5 v 9 z" fill={DIM} />
      <T x={676} y={182} anchor="middle">ЗАДВИЖКА</T>
      <T x={730} y={240} anchor="middle">КЛАПАН</T>
      <T x={900} y={190} anchor="end" bright>НАПОРНЫЙ ТРУБОПРОВОД</T>

      {/* приток */}
      <T x={286} y={266}>ПРИТОК</T>
      <Flow x={286} y={286} len={116} />

      {/* пузырёк в стояке */}
      {!calm && (
        <circle className={s.cutRise} style={{ animationDuration: "3s" }} cx={584} cy={380} r={2.4} fill={DIM} />
      )}

      <DimV x={398} y1={y0} y2={y1} label="5 000" />
      <DimH x1={x0} x2={x1} y={522} label="Ø 2 400" />
    </svg>
  );
}

/* ---------- RO: компоновка блока обратного осмоса ---------- */
function RoCut({ calm }: { calm: boolean }) {
  return (
    <svg viewBox="0 0 960 540" aria-hidden="true">
      {/* рама */}
      <rect x={150} y={160} width={720} height={280} fill="none" stroke={FAINT} />
      <line x1={130} y1={440} x2={890} y2={440} stroke={LINE} strokeWidth="2" />
      <path d="M 160 440 l -12 16 m 24 -16 l -12 16 M 848 440 l -12 16 m 24 -16 l -12 16" stroke={FAINT} fill="none" />

      <T x={540} y={140} anchor="middle" bright>МЕМБРАННЫЕ КОРПУСА · 3 × 4040</T>

      {/* три корпуса */}
      {[190, 244, 298].map((y, row) => (
        <g key={y}>
          <rect x={280} y={y} width={540} height={34} rx={17} fill="none" stroke={DIM} strokeWidth="1.6" opacity="0.85" />
          {Array.from({ length: 5 }, (_, i) => (
            <line key={i} x1={370 + i * 90} y1={y + 3} x2={370 + i * 90} y2={y + 31} stroke={FAINT} />
          ))}
          {/* обвязка между корпусами */}
          {row < 2 && <line x1={row % 2 ? 292 : 808} y1={y + 34} x2={row % 2 ? 292 : 808} y2={y + 54} stroke={DIM} opacity="0.6" strokeWidth="1.6" />}
        </g>
      ))}

      {/* насос высокого давления */}
      <rect x={175} y={342} width={58} height={44} fill="none" stroke={DIM} strokeWidth="1.6" />
      <circle cx={258} cy={364} r={18} fill="none" stroke={DIM} strokeWidth="1.6" />
      <line x1={276} y1={364} x2={300} y2={364} stroke={DIM} strokeWidth="1.6" />
      <line x1={300} y1={364} x2={300} y2={315} stroke={DIM} strokeWidth="1.6" opacity="0.7" />
      <T x={216} y={414} anchor="middle">НАСОС ВД</T>

      {/* щит управления */}
      <rect x={600} y={330} width={160} height={90} rx={4} fill="none" stroke={LINE} strokeWidth="1.6" />
      <line x1={616} y1={356} x2={700} y2={356} stroke={FAINT} />
      <line x1={616} y1={376} x2={686} y2={376} stroke={FAINT} />
      <circle cx={722} cy={356} r={4} fill={DIM} className={calm ? undefined : s.cutPulse} />
      <circle cx={738} cy={356} r={4} fill="none" stroke={FAINT} />
      <T x={680} y={472} anchor="middle">ЩИТ УПРАВЛЕНИЯ</T>

      {/* потоки */}
      <T x={30} y={330} bright>ИСХОДНАЯ ВОДА</T>
      <Flow x={30} y={364} len={130} />
      <line x1={820} y1={207} x2={870} y2={207} stroke={DIM} opacity="0.7" strokeWidth="1.6" />
      <line x1={870} y1={207} x2={870} y2={300} stroke={DIM} opacity="0.7" strokeWidth="1.6" />
      <T x={950} y={296} anchor="end" bright>ПЕРМЕАТ</T>
      <Flow x={870} y={316} len={48} />
      <T x={950} y={352} anchor="end">КОНЦЕНТРАТ</T>
      <Flow x={870} y={372} len={48} />

      <DimV x={110} y1={160} y2={440} label="1 800" />
      <DimH x1={150} x2={870} y={492} label="2 400" />
    </svg>
  );
}

const CUTS: Record<string, (props: { calm: boolean }) => ReturnType<typeof BioCut>> = {
  osv: OsvCut,
  bio: BioCut,
  nef: NefCut,
  kns: KnsCut,
  ro: RoCut,
};

export default function HeroCuts({
  language,
  calm,
}: {
  language: Language;
  calm: boolean;
}) {
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (calm) return;

    timer.current = setInterval(() => {
      setActive((current) => (current + 1) % SLIDES.length);
    }, 8000);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [calm]);

  /* ручной выбор перезапускает автолистание */
  const pick = (index: number) => {
    setActive(index);

    if (timer.current) clearInterval(timer.current);
    timer.current = calm
      ? null
      : setInterval(() => {
          setActive((current) => (current + 1) % SLIDES.length);
        }, 8000);
  };

  const slide = SLIDES[active];

  return (
    <div className={s.cuts}>
      <div className={s.cutStage}>
        {SLIDES.map((item, index) => {
          const Cut = CUTS[item.key];

          return (
            <div
              key={item.key}
              className={`${s.cutSlide} ${index === active ? s.cutOn : ""}`}
            >
              <Cut calm={calm} />
            </div>
          );
        })}
      </div>

      <div className={s.cutCap}>
        <span>
          {"SUVSANOAT "}
          <b>{slide.code}</b>
          {" · "}
          {slide.sub[language]}
        </span>
        <span className={s.cutCapNote}>{NOTE[language]}</span>
      </div>

      <div className={s.cutTabs} role="tablist">
        {SLIDES.map((item, index) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={index === active}
            className={index === active ? s.cutTabOn : ""}
            onClick={() => pick(index)}
          >
            <i>{item.code}</i>
            <b>{item.name[language]}</b>
          </button>
        ))}
      </div>
    </div>
  );
}
