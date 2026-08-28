"use client";

import type { Language } from "../../translations";
import type { Model } from "../data";

/* --------------------------------------------------------------
 * ГАБАРИТНЫЙ ЧЕРТЁЖ МОДЕЛИ
 *
 * Рисуется автоматически из данных модели: габариты, патрубки,
 * люки, кольца жёсткости, уровень воды, насосы. Один компонент —
 * 78 чертежей. Схематический вид сбоку, не для строительства.
 * -------------------------------------------------------------- */

const LINE = "rgba(242,245,246,0.34)";
const FAINT = "rgba(242,245,246,0.14)";
const DIM = "#3ec3e6";
const WATER = "rgba(62,195,230,0.14)";
const TEXTC = "rgba(242,245,246,0.75)";

const FS = 11;

export const DRAW_TITLE: Record<Language, string> = {
  ru: "Габаритный чертёж",
  uz: "Gabarit chizmasi",
  en: "Dimensional drawing",
  zh: "外形简图",
};

export const DRAW_NOTE: Record<Language, string> = {
  ru: "Схема автоматически построена по параметрам модели. Вид сбоку, размеры в мм. Не является рабочим чертежом.",
  uz: "Sxema model parametrlari bo‘yicha avtomatik qurilgan. Yon ko‘rinish, o‘lchamlar mm da. Ishchi chizma emas.",
  en: "Generated automatically from the model's parameters. Side view, dimensions in mm. Not a construction drawing.",
  zh: "按型号参数自动生成。侧视图，尺寸为毫米。非施工图。",
};

/* размерная линия по горизонтали */
function DimH({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g stroke={DIM} strokeWidth="1">
      <line x1={x1} y1={y - 5} x2={x1} y2={y + 5} />
      <line x1={x2} y1={y - 5} x2={x2} y2={y + 5} />
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <path d={`M ${x1} ${y} l 7 -3 v 6 z`} fill={DIM} stroke="none" />
      <path d={`M ${x2} ${y} l -7 -3 v 6 z`} fill={DIM} stroke="none" />
      <text
        x={(x1 + x2) / 2}
        y={y - 6}
        textAnchor="middle"
        fontSize={FS}
        fill={TEXTC}
        stroke="none"
        fontFamily="inherit"
      >
        {label}
      </text>
    </g>
  );
}

/* размерная линия по вертикали */
function DimV({ x, y1, y2, label }: { x: number; y1: number; y2: number; label: string }) {
  return (
    <g stroke={DIM} strokeWidth="1">
      <line x1={x - 5} y1={y1} x2={x + 5} y2={y1} />
      <line x1={x - 5} y1={y2} x2={x + 5} y2={y2} />
      <line x1={x} y1={y1} x2={x} y2={y2} />
      <path d={`M ${x} ${y1} l -3 7 h 6 z`} fill={DIM} stroke="none" />
      <path d={`M ${x} ${y2} l -3 -7 h 6 z`} fill={DIM} stroke="none" />
      <text
        x={x + 8}
        y={(y1 + y2) / 2 + 4}
        fontSize={FS}
        fill={TEXTC}
        stroke="none"
        fontFamily="inherit"
      >
        {label}
      </text>
    </g>
  );
}

/* уровень воды: штрих и флажок ▽ */
function WaterMark({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={DIM} strokeWidth="1" fill="none">
      <path d={`M ${x - 7} ${y - 9} h 14 l -7 9 z`} />
      <line x1={x - 10} y1={y} x2={x + 10} y2={y} />
      <line x1={x - 6} y1={y + 3} x2={x + 6} y2={y + 3} />
      <line x1={x - 3} y1={y + 6} x2={x + 3} y2={y + 6} />
    </g>
  );
}

/* горловина с крышкой на верхе корпуса */
function Neck({ x, y, w = 20 }: { x: number; y: number; w?: number }) {
  return (
    <g stroke={LINE} fill="none">
      <line x1={x - w / 2} y1={y} x2={x - w / 2} y2={y - 12} />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y - 12} />
      <line x1={x - w / 2 - 4} y1={y - 12} x2={x + w / 2 + 4} y2={y - 12} />
      <line x1={x - w / 2 - 4} y1={y - 15} x2={x + w / 2 + 4} y2={y - 15} />
    </g>
  );
}

/* патрубок с подписью DN */
function Stub({
  x, y, dir, dn,
}: { x: number; y: number; dir: 1 | -1; dn: number }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x + 16 * dir} y2={y} stroke={DIM} strokeWidth="2.4" />
      <path
        d={`M ${x + (16 + 7) * dir} ${y} l ${-7 * dir} -4 v 8 z`}
        fill={DIM}
      />
      <text
        x={x + 20 * dir}
        y={y - 7}
        textAnchor={dir === 1 ? "start" : "end"}
        fontSize={FS - 1}
        fill={TEXTC}
        fontFamily="inherit"
      >
        DN{dn}
      </text>
    </g>
  );
}

/* насос погружной: корпус + патрубок вверх */
function Pump({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={LINE} fill="none">
      <rect x={x - 7} y={y - 22} width={14} height={22} rx={3} />
      <line x1={x} y1={y - 22} x2={x} y2={y - 34} />
      <path d={`M ${x - 4} ${y - 8} l 8 -8 M ${x - 4} ${y - 16} l 8 8`} stroke={FAINT} />
    </g>
  );
}

export default function ModelDrawing({
  model,
  language,
}: {
  model: Model;
  language: Language;
}) {
  const W = 560;
  const H = 330;
  const mm = (v: number) => String(v);

  const bodies = model.bodies ?? 1;
  const isCylH = model.diameter !== undefined && model.line !== "pump-stations" && model.line !== "dosing" && model.line !== "chlorinators";
  const isKns = model.line === "pump-stations";
  const isSkid = model.line === "chlorinators";
  const isDozCyl = model.line === "dosing" && model.diameter !== undefined;

  /* ---------- ГОРИЗОНТАЛЬНЫЙ ЦИЛИНДР: резервуары, крупные ЛОС ---------- */
  if (isCylH) {
    const Lr = model.length;
    const Dr = model.diameter!;
    const scale = Math.min(380 / Lr, 170 / Dr);
    const bw = Lr * scale;
    const bh = Dr * scale;
    const x0 = (W - 60 - bw) / 2 + 10;
    const y0 = 90;
    const rings = model.rings ?? 0;
    const hat = Math.min(Math.ceil(model.hatches / bodies), 3);

    return (
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={DRAW_TITLE[language]}>
        {/* корпус */}
        <rect x={x0} y={y0} width={bw} height={bh} rx={bh / 2 * 0.22} fill="none" stroke={LINE} strokeWidth="1.6" />
        <ellipse cx={x0 + bh * 0.11} cy={y0 + bh / 2} rx={bh * 0.11} ry={bh / 2} fill="none" stroke={FAINT} />
        <ellipse cx={x0 + bw - bh * 0.11} cy={y0 + bh / 2} rx={bh * 0.11} ry={bh / 2} fill="none" stroke={FAINT} />

        {/* кольца жёсткости */}
        {Array.from({ length: rings }, (_, index) => {
          const rx = x0 + ((index + 1) * bw) / (rings + 1);
          return <line key={index} x1={rx} y1={y0 - 3} x2={rx} y2={y0 + bh + 3} stroke={DIM} strokeWidth="1.2" opacity="0.55" />;
        })}

        {/* горловины и вода */}
        {Array.from({ length: hat }, (_, index) => (
          <Neck key={index} x={x0 + bw * (0.2 + index * 0.3)} y={y0} />
        ))}
        <rect x={x0 + 2} y={y0 + bh * 0.25} width={bw - 4} height={bh * 0.73} rx={6} fill={WATER} stroke="none" />
        <WaterMark x={x0 + bw * 0.5} y={y0 + bh * 0.25} />

        {/* патрубки */}
        <Stub x={x0} y={y0 + bh * 0.28} dir={-1} dn={model.dn} />
        <Stub x={x0 + bw} y={y0 + bh * 0.34} dir={1} dn={model.dn} />

        {/* количество корпусов */}
        {bodies > 1 && (
          <text x={x0 + bw / 2} y={y0 - 34} textAnchor="middle" fontSize={FS + 2} fill={DIM} fontFamily="inherit" fontWeight="700">
            × {bodies}
          </text>
        )}

        <DimH x1={x0} x2={x0 + bw} y={y0 + bh + 44} label={mm(Lr)} />
        <DimV x={x0 + bw + 52} y1={y0} y2={y0 + bh} label={`⌀${mm(Dr)}`} />
      </svg>
    );
  }

  /* ---------- КНС: вертикальный корпус с насосами ---------- */
  if (isKns) {
    const Dr = model.diameter!;
    const Hh = model.depth ?? model.length;
    const scale = Math.min(190 / Dr, 230 / Hh);
    const bw = Dr * scale;
    const bh = Hh * scale;
    const x0 = (W - 120 - bw) / 2;
    const y0 = 46;
    const pumps = model.pumps ?? 2;
    const useful = model.useful ?? 0;
    const area = Math.PI * (Dr / 1000) ** 2 / 4;
    const hu = ((useful / area) * 1000) * scale; // высота полезного объёма в px

    return (
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={DRAW_TITLE[language]}>
        {/* уровень земли */}
        <line x1={x0 - 70} y1={y0} x2={x0 + bw + 70} y2={y0} stroke={LINE} />
        {Array.from({ length: 12 }, (_, index) => (
          <line key={index} x1={x0 - 66 + index * ((bw + 132) / 12)} y1={y0} x2={x0 - 74 + index * ((bw + 132) / 12)} y2={y0 + 8} stroke={FAINT} />
        ))}

        {/* корпус */}
        <rect x={x0} y={y0} width={bw} height={bh} fill="none" stroke={LINE} strokeWidth="1.6" />
        <Neck x={x0 + bw * 0.3} y={y0} w={26} />

        {/* направляющие и насосы */}
        {Array.from({ length: pumps }, (_, index) => {
          const px = x0 + bw * ((index + 1) / (pumps + 1));
          return (
            <g key={index}>
              <line x1={px} y1={y0 + 4} x2={px} y2={y0 + bh - 4} stroke={FAINT} strokeDasharray="4 5" />
              <Pump x={px} y={y0 + bh - 6} />
            </g>
          );
        })}

        {/* уровни пуска/остановки */}
        <line x1={x0 + 4} y1={y0 + bh - 24 - hu} x2={x0 + bw - 4} y2={y0 + bh - 24 - hu} stroke={DIM} strokeDasharray="6 4" opacity="0.8" />
        <line x1={x0 + 4} y1={y0 + bh - 24} x2={x0 + bw - 4} y2={y0 + bh - 24} stroke={DIM} strokeDasharray="6 4" opacity="0.5" />
        <rect x={x0 + 2} y={y0 + bh - 24 - hu} width={bw - 4} height={hu} fill={WATER} stroke="none" />

        {/* подводящий и напорный */}
        <Stub x={x0} y={y0 + 34} dir={-1} dn={model.dn} />
        <g>
          <line x1={x0 + bw - 14} y1={y0 + bh - 40} x2={x0 + bw - 14} y2={y0 - 16} stroke={DIM} strokeWidth="2" opacity="0.75" />
          <path d={`M ${x0 + bw - 14} ${y0 - 22} l -4 7 h 8 z`} fill={DIM} opacity="0.75" />
        </g>

        <DimH x1={x0} x2={x0 + bw} y={y0 + bh + 34} label={`⌀${mm(Dr)}`} />
        <DimV x={x0 + bw + 62} y1={y0} y2={y0 + bh} label={mm(Hh)} />
        <text x={x0 - 8} y={y0 + bh - 26 - hu} textAnchor="end" fontSize={FS - 1} fill={TEXTC} fontFamily="inherit">
          {language === "zh" ? "启" : "пуск"}
        </text>
        <text x={x0 - 8} y={y0 + bh - 26} textAnchor="end" fontSize={FS - 1} fill={TEXTC} fontFamily="inherit">
          {language === "zh" ? "停" : "стоп"}
        </text>
      </svg>
    );
  }

  /* ---------- ХЛОРАТОР: рама с баками и шкафом ---------- */
  if (isSkid) {
    const Lr = model.length;
    const Hh = model.height ?? 1700;
    const scale = Math.min(330 / Lr, 210 / Hh);
    const bw = Lr * scale;
    const bh = Hh * scale;
    const x0 = (W - 80 - bw) / 2;
    const y0 = 250 - bh;

    /* компоновка по долям ширины рамы: соль | шкаф | бак раствора */
    const saltX = x0 + bw * 0.02;
    const saltW = bw * 0.24;
    const cabX = x0 + bw * 0.32;
    const cabW = bw * 0.28;
    const solX = x0 + bw * 0.66;
    const solW = bw * 0.32;

    return (
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={DRAW_TITLE[language]}>
        {/* рама */}
        <line x1={x0 - 14} y1={y0 + bh} x2={x0 + bw + 14} y2={y0 + bh} stroke={LINE} strokeWidth="2" />
        <rect x={x0} y={y0} width={bw} height={bh} fill="none" stroke={FAINT} />

        {/* бак-сатуратор соли */}
        <rect x={saltX} y={y0 + bh * 0.3} width={saltW} height={bh * 0.7 - 6} rx={6} fill="none" stroke={LINE} strokeWidth="1.5" />
        <path d={`M ${saltX} ${y0 + bh * 0.52} h ${saltW}`} stroke={FAINT} />

        {/* шкаф с ячейкой */}
        <rect x={cabX} y={y0 + 6} width={cabW} height={bh - 12} rx={4} fill="none" stroke={LINE} strokeWidth="1.5" />
        <circle cx={cabX + cabW / 2} cy={y0 + bh * 0.32} r={Math.min(9, bw * 0.09)} fill="none" stroke={DIM} />
        <line x1={cabX + 4} y1={y0 + bh * 0.6} x2={cabX + cabW - 4} y2={y0 + bh * 0.6} stroke={FAINT} />

        {/* бак раствора */}
        <rect x={solX} y={y0 + bh * 0.16} width={solW} height={bh * 0.84 - 6} rx={6} fill="none" stroke={LINE} strokeWidth="1.5" />
        <rect x={solX + 3} y={y0 + bh * 0.34} width={solW - 6} height={bh * 0.64} fill={WATER} stroke="none" />
        <WaterMark x={solX + solW / 2} y={y0 + bh * 0.34} />

        {/* связи: соль -> ячейка -> бак */}
        <path d={`M ${saltX + saltW} ${y0 + bh * 0.5} H ${cabX}`} stroke={DIM} strokeWidth="1.4" fill="none" />
        <path d={`M ${cabX + cabW} ${y0 + bh * 0.4} H ${solX}`} stroke={DIM} strokeWidth="1.4" fill="none" />

        {/* отвод раствора и вентиляция */}
        <Stub x={x0 + bw} y={y0 + bh * 0.82} dir={1} dn={model.dn} />
        <g stroke={FAINT} fill="none">
          <line x1={solX + solW / 2} y1={y0 + bh * 0.16} x2={solX + solW / 2} y2={y0 - 20} />
          <path d={`M ${solX + solW / 2 - 6} ${y0 - 20} h 12`} />
        </g>
        <text x={solX + solW / 2 + 6} y={y0 - 24} fontSize={FS - 1} fill={TEXTC} fontFamily="inherit">
          H₂↑
        </text>

        <DimH x1={x0 - 14} x2={x0 + bw + 14} y={y0 + bh + 40} label={mm(Lr)} />
        <DimV x={x0 + bw + 58} y1={y0} y2={y0 + bh} label={mm(Hh)} />
      </svg>
    );
  }

  /* ---------- ДОЗАТОР ЦИЛИНДРИЧЕСКИЙ (2 000–10 000 л) ---------- */
  if (isDozCyl) {
    const Dr = model.diameter!;
    const Hh = model.length;
    const scale = Math.min(200 / Dr, 200 / Hh);
    const bw = Dr * scale;
    const bh = Hh * scale;
    const x0 = (W - 100 - bw) / 2;
    const y0 = 258 - bh;

    return (
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={DRAW_TITLE[language]}>
        <line x1={x0 - 40} y1={y0 + bh} x2={x0 + bw + 40} y2={y0 + bh} stroke={LINE} strokeWidth="2" />

        {/* бак */}
        <rect x={x0} y={y0} width={bw} height={bh} rx={10} fill="none" stroke={LINE} strokeWidth="1.6" />
        <rect x={x0 + 3} y={y0 + bh * 0.22} width={bw - 6} height={bh * 0.76} rx={8} fill={WATER} stroke="none" />
        <WaterMark x={x0 + bw * 0.32} y={y0 + bh * 0.22} />

        {/* мешалка */}
        <g stroke={LINE} fill="none">
          <rect x={x0 + bw / 2 - 12} y={y0 - 26} width={24} height={18} rx={3} />
          <line x1={x0 + bw / 2} y1={y0 - 8} x2={x0 + bw / 2} y2={y0 + bh * 0.72} />
          <line x1={x0 + bw / 2 - 14} y1={y0 + bh * 0.72} x2={x0 + bw / 2 + 14} y2={y0 + bh * 0.72} strokeWidth="2" />
        </g>
        <text x={x0 + bw / 2 + 16} y={y0 - 12} fontSize={FS - 1} fill={TEXTC} fontFamily="inherit">
          M
        </text>

        {/* два насоса-дозатора на раме */}
        {[0, 1].map((index) => (
          <g key={index} stroke={LINE} fill="none">
            <rect x={x0 + bw + 24} y={y0 + bh - 34 - index * 30} width={26} height={20} rx={3} />
            <circle cx={x0 + bw + 37} cy={y0 + bh - 24 - index * 30} r={5} stroke={DIM} />
          </g>
        ))}
        <path d={`M ${x0 + bw} ${y0 + bh - 14} h 24 M ${x0 + bw + 50} ${y0 + bh - 24} h 18`} stroke={DIM} strokeWidth="1.4" fill="none" />
        <path d={`M ${x0 + bw + 74} ${y0 + bh - 24} l -7 -4 v 8 z`} fill={DIM} />

        <DimH x1={x0} x2={x0 + bw} y={y0 + bh + 36} label={`⌀${mm(Dr)}`} />
        <DimV x={x0 - 46} y1={y0} y2={y0 + bh} label={mm(Hh)} />
      </svg>
    );
  }

  /* ---------- ПРЯМОУГОЛЬНЫЙ КОРПУС: ЖИР, НЕФ, ПЕС, малые БИО и ДОЗ ---------- */
  const Lr = model.length;
  const Hh = model.height ?? 1500;
  const buried = model.line !== "dosing";
  const scale = Math.min(390 / Lr, 180 / Hh);
  const bw = Lr * scale;
  const bh = Hh * scale;
  const x0 = (W - 70 - bw) / 2 + 6;
  const y0 = buried ? 84 : 240 - bh;

  const hat = Math.min(Math.ceil(model.hatches / bodies) || 1, 5);
  const wl = model.volumeWork && model.width
    ? Math.min(0.9, (model.volumeWork / bodies) / ((Lr / 1000) * (model.width / 1000) * (Hh / 1000)))
    : 0.8;
  const wy = y0 + bh * (1 - wl);

  /* перегородки: у сепараторов и ЛОС по назначению */
  const walls =
    model.line === "grease-traps" ? [0.3, 0.78]
    : model.line === "oil-separators" ? [0.42, 0.62, 0.86]
    : model.line === "sand-traps" ? [0.55]
    : model.line === "bio-plants" ? [0.24, 0.62, 0.82]
    : [];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={DRAW_TITLE[language]}>
      {buried && (
        <g>
          <line x1={x0 - 60} y1={y0 - 16} x2={x0 + bw + 60} y2={y0 - 16} stroke={LINE} />
          {Array.from({ length: 14 }, (_, index) => (
            <line key={index} x1={x0 - 56 + index * ((bw + 112) / 14)} y1={y0 - 16} x2={x0 - 64 + index * ((bw + 112) / 14)} y2={y0 - 8} stroke={FAINT} />
          ))}
        </g>
      )}
      {!buried && <line x1={x0 - 30} y1={y0 + bh} x2={x0 + bw + 30} y2={y0 + bh} stroke={LINE} strokeWidth="2" />}

      {/* корпус */}
      <rect x={x0} y={y0} width={bw} height={bh} fill="none" stroke={LINE} strokeWidth="1.6" />

      {/* вода */}
      <rect x={x0 + 2} y={wy} width={bw - 4} height={y0 + bh - wy - 2} fill={WATER} stroke="none" />
      <WaterMark x={x0 + bw * 0.14} y={wy} />

      {/* перегородки полупогружные */}
      {walls.map((position, index) => (
        <line
          key={index}
          x1={x0 + bw * position}
          y1={index % 2 === 0 ? y0 + bh * 0.14 : y0 + 4}
          x2={x0 + bw * position}
          y2={index % 2 === 0 ? y0 + bh - 4 : y0 + bh * 0.7}
          stroke={LINE}
          strokeWidth="1.4"
        />
      ))}

      {/* горловины */}
      {Array.from({ length: hat }, (_, index) => (
        <Neck key={index} x={x0 + bw * ((index + 1) / (hat + 1))} y={y0} />
      ))}

      {/* патрубки: вход выше, выход ниже */}
      <Stub x={x0} y={y0 + bh * 0.22} dir={-1} dn={model.dn} />
      <Stub x={x0 + bw} y={y0 + bh * 0.3} dir={1} dn={model.dn} />

      {bodies > 1 && (
        <text x={x0 + bw / 2} y={y0 - 30} textAnchor="middle" fontSize={FS + 2} fill={DIM} fontFamily="inherit" fontWeight="700">
          × {bodies}
        </text>
      )}

      <DimH x1={x0} x2={x0 + bw} y={y0 + bh + 40} label={mm(Lr)} />
      <DimV x={x0 + bw + 54} y1={y0} y2={y0 + bh} label={mm(Hh)} />
      {model.width !== undefined && (
        <text x={x0} y={y0 + bh + 62} fontSize={FS - 1} fill={TEXTC} fontFamily="inherit">
          B = {mm(model.width)}
        </text>
      )}
    </svg>
  );
}
