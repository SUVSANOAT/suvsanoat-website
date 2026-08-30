"use client";

import { useEffect, useRef, useState } from "react";

import type { Language } from "../translations";
import s from "./new.module.css";

/* --------------------------------------------------------------
 * ПЕРВЫЙ ЭКРАН: СЛАЙДЕР РАЗРЕЗОВ ОБОРУДОВАНИЯ
 *
 * Шесть анимированных разрезов — по одному на линейку производства.
 * Внизу переключатели; слайды листаются сами каждые 7 секунд,
 * ручной выбор перезапускает таймер. calm = prefers-reduced-motion.
 * -------------------------------------------------------------- */

const LINE = "rgba(242,245,246,0.4)";
const FAINT = "rgba(242,245,246,0.16)";
const DIM = "#3ec3e6";
const WATER = "rgba(62,195,230,0.13)";
const WATER2 = "rgba(62,195,230,0.22)";
const FAT = "rgba(255,183,77,0.35)";
const SAND = "rgba(214,178,120,0.3)";
const SLUDGE = "rgba(150,120,90,0.28)";
const TXT = "rgba(242,245,246,0.6)";

type Slide = {
  key: string;
  code: string;
  name: Record<Language, string>;
};

const SLIDES: Slide[] = [
  { key: "zhir", code: "ЖИР", name: { ru: "Жироуловитель", uz: "Yog‘ tutgich", en: "Grease trap", zh: "隔油器" } },
  { key: "nef", code: "НЕФ", name: { ru: "Нефтеуловитель", uz: "Neft tutgich", en: "Oil separator", zh: "除油器" } },
  { key: "bio", code: "БИО", name: { ru: "Очистное сооружение", uz: "Tozalash inshooti", en: "Treatment plant", zh: "污水处理设备" } },
  { key: "kns", code: "КНС", name: { ru: "Насосная станция", uz: "Nasos stansiyasi", en: "Pumping station", zh: "污水泵站" } },
  { key: "rez", code: "РЕЗ", name: { ru: "Резервуар", uz: "Rezervuar", en: "GRP tank", zh: "玻璃钢储罐" } },
  { key: "elh", code: "ЭЛХ", name: { ru: "Электролизная установка", uz: "Elektroliz qurilmasi", en: "Electrochlorination", zh: "次氯酸钠发生器" } },
];

/* стрелка потока на патрубке */
function Flow({ x, y, dir }: { x: number; y: number; dir: 1 | -1 }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x + 26 * dir} y2={y} stroke={DIM} strokeWidth="3" />
      <path d={`M ${x + (26 + 10) * dir} ${y} l ${-10 * dir} -5 v 10 z`} fill={DIM} />
    </g>
  );
}

/* всплывающие капли: жир или нефть */
function Drops({ x0, w, y0, h, color, n, calm }: { x0: number; w: number; y0: number; h: number; color: string; n: number; calm: boolean }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <circle
          key={i}
          className={calm ? undefined : s.cutRise}
          style={calm ? undefined : { animationDelay: `${(i * 1.7) % 5}s`, animationDuration: `${4 + (i % 3)}s` }}
          cx={x0 + ((i * 37) % w)}
          cy={y0 + h - ((i * 53) % h)}
          r={2.4}
          fill={color}
        />
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
          style={calm ? undefined : { animationDelay: `${(i * 0.9) % 4}s`, animationDuration: `${2.6 + (i % 4) * 0.5}s` }}
          cx={x0 + ((i * 23) % w)}
          cy={y0 + h - ((i * 31) % h)}
          r={1.8}
          fill="none"
          stroke={DIM}
          strokeWidth="1"
          opacity="0.7"
        />
      ))}
    </g>
  );
}

function ZhirCut({ calm }: { calm: boolean }) {
  /* три камеры, слой жира сверху, полупогружные перегородки */
  return (
    <svg viewBox="0 0 640 420" aria-hidden="true">
      <line x1={40} y1={96} x2={600} y2={96} stroke={FAINT} />
      <rect x={90} y={110} width={460} height={220} rx={10} fill="none" stroke={LINE} strokeWidth="2" />
      {/* вода и жир */}
      <rect x={94} y={150} width={452} height={176} rx={8} fill={WATER} />
      <rect x={94} y={150} width={452} height={26} fill={FAT} />
      {/* перегородки */}
      <line x1={230} y1={128} x2={230} y2={326} stroke={LINE} strokeWidth="2.4" />
      <line x1={420} y1={110} x2={420} y2={280} stroke={LINE} strokeWidth="2.4" />
      {/* горловины */}
      <path d={`M 150 110 v -16 h 56 v 16`} fill="none" stroke={LINE} strokeWidth="2" />
      <path d={`M 300 110 v -16 h 56 v 16`} fill="none" stroke={LINE} strokeWidth="2" />
      <path d={`M 460 110 v -16 h 56 v 16`} fill="none" stroke={LINE} strokeWidth="2" />
      {/* капли жира */}
      <Drops x0={110} w={300} y0={182} h={130} color="rgba(255,183,77,0.8)" n={9} calm={calm} />
      {/* осадок */}
      <path d={`M 96 326 q 60 -16 130 0 q 40 -10 70 0 z`} fill={SLUDGE} />
      {/* патрубки */}
      <Flow x={54} y={158} dir={1} />
      <Flow x={556} y={176} dir={1} />
      <text x={90} y={368} fontSize="13" fill={TXT} fontFamily="inherit">DN160</text>
    </svg>
  );
}

function NefCut({ calm }: { calm: boolean }) {
  /* песколовка + ламельный блок + нефтесборник */
  return (
    <svg viewBox="0 0 640 420" aria-hidden="true">
      <line x1={40} y1={96} x2={600} y2={96} stroke={FAINT} />
      <rect x={90} y={110} width={460} height={220} rx={10} fill="none" stroke={LINE} strokeWidth="2" />
      <rect x={94} y={146} width={452} height={180} rx={8} fill={WATER} />
      {/* плёнка нефти */}
      <rect x={250} y={146} width={200} height={14} fill={FAT} />
      {/* перегородки */}
      <line x1={240} y1={126} x2={240} y2={326} stroke={LINE} strokeWidth="2.4" />
      <line x1={470} y1={110} x2={470} y2={286} stroke={LINE} strokeWidth="2.4" />
      {/* ламели */}
      {Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1={272 + i * 24} y1={296} x2={296 + i * 24} y2={196} stroke={DIM} strokeWidth="1.6" opacity="0.55" />
      ))}
      {/* песок в первой камере, капли во второй */}
      <path d={`M 96 326 q 70 -22 142 0 z`} fill={SAND} />
      <Drops x0={260} w={190} y0={170} h={140} color="rgba(255,150,80,0.8)" n={8} calm={calm} />
      <path d={`M 150 110 v -16 h 56 v 16`} fill="none" stroke={LINE} strokeWidth="2" />
      <path d={`M 330 110 v -16 h 56 v 16`} fill="none" stroke={LINE} strokeWidth="2" />
      <Flow x={54} y={156} dir={1} />
      <Flow x={556} y={172} dir={1} />
      <text x={90} y={368} fontSize="13" fill={TXT} fontFamily="inherit">DN200</text>
    </svg>
  );
}

function BioCut({ calm }: { calm: boolean }) {
  /* денитрификатор + аэротенк с пузырьками + отстойник */
  return (
    <svg viewBox="0 0 640 420" aria-hidden="true">
      <line x1={40} y1={96} x2={600} y2={96} stroke={FAINT} />
      <rect x={80} y={110} width={480} height={220} rx={10} fill="none" stroke={LINE} strokeWidth="2" />
      <rect x={84} y={144} width={472} height={182} rx={8} fill={WATER} />
      <line x1={200} y1={110} x2={200} y2={310} stroke={LINE} strokeWidth="2.4" />
      <line x1={430} y1={110} x2={430} y2={310} stroke={LINE} strokeWidth="2.4" />
      {/* мешалка в денитрификаторе */}
      <line x1={140} y1={122} x2={140} y2={280} stroke={LINE} strokeWidth="2" />
      <line x1={118} y1={280} x2={162} y2={280} stroke={LINE} strokeWidth="3" />
      {/* аэрация */}
      <line x1={216} y1={314} x2={416} y2={314} stroke={DIM} strokeWidth="2" opacity="0.5" strokeDasharray="8 7" />
      <Bubbles x0={216} w={200} y0={160} h={150} n={16} calm={calm} />
      {/* наклонное днище отстойника + ил */}
      <path d={`M 434 326 L 490 268 L 552 326 z`} fill={SLUDGE} />
      <path d={`M 434 326 L 490 268 L 552 326`} fill="none" stroke={FAINT} strokeWidth="1.6" />
      <path d={`M 150 110 v -16 h 52 v 16`} fill="none" stroke={LINE} strokeWidth="2" />
      <path d={`M 300 110 v -16 h 52 v 16`} fill="none" stroke={LINE} strokeWidth="2" />
      <path d={`M 460 110 v -16 h 52 v 16`} fill="none" stroke={LINE} strokeWidth="2" />
      <Flow x={44} y={154} dir={1} />
      <Flow x={566} y={166} dir={1} />
      <text x={80} y={368} fontSize="13" fill={TXT} fontFamily="inherit">O₂ · DWA-A 131</text>
    </svg>
  );
}

function KnsCut({ calm }: { calm: boolean }) {
  /* вертикальный корпус, два насоса, напорный стояк */
  return (
    <svg viewBox="0 0 640 420" aria-hidden="true">
      <line x1={60} y1={92} x2={580} y2={92} stroke={FAINT} />
      {Array.from({ length: 16 }, (_, i) => (
        <line key={i} x1={70 + i * 33} y1={92} x2={60 + i * 33} y2={102} stroke={FAINT} />
      ))}
      <rect x={230} y={92} width={180} height={264} fill="none" stroke={LINE} strokeWidth="2" />
      <rect x={233} y={210} width={174} height={143} fill={WATER} />
      {/* уровни пуска и остановки */}
      <line x1={236} y1={210} x2={404} y2={210} stroke={DIM} strokeDasharray="7 5" opacity="0.8" />
      <line x1={236} y1={330} x2={404} y2={330} stroke={DIM} strokeDasharray="7 5" opacity="0.45" />
      {/* насосы на направляющих */}
      {[286, 354].map((px) => (
        <g key={px} stroke={LINE} fill="none">
          <line x1={px} y1={98} x2={px} y2={348} stroke={FAINT} strokeDasharray="4 6" />
          <rect x={px - 11} y={318} width={22} height={34} rx={4} strokeWidth="2" />
        </g>
      ))}
      {/* напорный стояк */}
      <line x1={396} y1={312} x2={396} y2={64} stroke={DIM} strokeWidth="3" opacity="0.8" />
      <path d="M 396 54 l -6 11 h 12 z" fill={DIM} opacity="0.8" />
      {!calm && (
        <circle className={s.cutRise} style={{ animationDuration: "3s" }} cx={396} cy={300} r={2.4} fill={DIM} />
      )}
      {/* подводящий */}
      <Flow x={186} y={170} dir={1} />
      <path d={`M 268 92 v -14 h 44 v 14`} fill="none" stroke={LINE} strokeWidth="2" />
      <text x={230} y={392} fontSize="13" fill={TXT} fontFamily="inherit">1 + 1</text>
    </svg>
  );
}

function RezCut({ calm }: { calm: boolean }) {
  /* горизонтальный цилиндр, кольца жёсткости */
  return (
    <svg viewBox="0 0 640 420" aria-hidden="true">
      <line x1={40} y1={110} x2={600} y2={110} stroke={FAINT} />
      <rect x={100} y={130} width={440} height={190} rx={54} fill="none" stroke={LINE} strokeWidth="2" />
      <ellipse cx={126} cy={225} rx={26} ry={95} fill="none" stroke={FAINT} />
      <ellipse cx={514} cy={225} rx={26} ry={95} fill="none" stroke={FAINT} />
      <rect x={104} y={186} width={432} height={130} rx={40} fill={WATER} />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={148 + i * 50} y1={126} x2={148 + i * 50} y2={324} stroke={DIM} strokeWidth="1.6" opacity="0.5" />
      ))}
      <path d={`M 200 130 v -18 h 48 v 18`} fill="none" stroke={LINE} strokeWidth="2" />
      <path d={`M 390 130 v -18 h 48 v 18`} fill="none" stroke={LINE} strokeWidth="2" />
      {!calm && (
        <circle className={s.cutRise} style={{ animationDuration: "5s" }} cx={320} cy={280} r={2.2} fill={DIM} opacity="0.7" />
      )}
      <Flow x={62} y={176} dir={1} />
      <Flow x={548} y={196} dir={1} />
      <text x={100} y={366} fontSize="13" fill={TXT} fontFamily="inherit">⌀2400 · 800 mm</text>
    </svg>
  );
}

function ElhCut({ calm }: { calm: boolean }) {
  /* скид: соль -> ячейка -> бак раствора, водород вверх */
  return (
    <svg viewBox="0 0 640 420" aria-hidden="true">
      <line x1={90} y1={340} x2={550} y2={340} stroke={LINE} strokeWidth="3" />
      {/* бак соли */}
      <rect x={110} y={200} width={110} height={134} rx={8} fill="none" stroke={LINE} strokeWidth="2" />
      <path d="M 110 250 h 110" stroke={FAINT} />
      {/* шкаф с ячейкой */}
      <rect x={260} y={140} width={120} height={194} rx={6} fill="none" stroke={LINE} strokeWidth="2" />
      <circle cx={320} cy={206} r={20} fill="none" stroke={DIM} strokeWidth="2" className={calm ? undefined : s.cutPulse} />
      <line x1={272} y1={268} x2={368} y2={268} stroke={FAINT} />
      {/* бак раствора */}
      <rect x={420} y={168} width={120} height={166} rx={8} fill="none" stroke={LINE} strokeWidth="2" />
      <rect x={424} y={210} width={112} height={120} rx={6} fill={WATER2} />
      <Bubbles x0={434} w={92} y0={216} h={106} n={8} calm={calm} />
      {/* связи */}
      <path d="M 220 244 H 260" stroke={DIM} strokeWidth="2" />
      <path d="M 380 226 H 420" stroke={DIM} strokeWidth="2" />
      {/* вентиляция H2 */}
      <line x1={480} y1={168} x2={480} y2={110} stroke={FAINT} />
      <path d="M 472 110 h 16" stroke={FAINT} />
      <text x={492} y={106} fontSize="13" fill={TXT} fontFamily="inherit">H₂↑</text>
      <Flow x={548} y={300} dir={1} />
      <text x={110} y={382} fontSize="13" fill={TXT} fontFamily="inherit">NaCl → NaOCl</text>
    </svg>
  );
}

const CUTS: Record<string, (props: { calm: boolean }) => ReturnType<typeof ZhirCut>> = {
  zhir: ZhirCut,
  nef: NefCut,
  bio: BioCut,
  kns: KnsCut,
  rez: RezCut,
  elh: ElhCut,
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
    }, 7000);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [calm]);

  /* ручной выбор перезапускает автолистание */
  const pick = (index: number) => {
    setActive(index);

    if (timer.current) {
      clearInterval(timer.current);
      timer.current = calm
        ? null
        : setInterval(() => {
            setActive((current) => (current + 1) % SLIDES.length);
          }, 7000);
    }
  };

  return (
    <div className={s.cuts} aria-hidden="false">
      <div className={s.cutStage}>
        {SLIDES.map((slide, index) => {
          const Cut = CUTS[slide.key];

          return (
            <div
              key={slide.key}
              className={`${s.cutSlide} ${index === active ? s.cutOn : ""}`}
            >
              <Cut calm={calm} />
            </div>
          );
        })}

        <div className={s.cutName}>{SLIDES[active].name[language]}</div>
      </div>

      <div className={s.cutTabs} role="tablist">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.key}
            type="button"
            role="tab"
            aria-selected={index === active}
            className={index === active ? s.cutTabOn : ""}
            onClick={() => pick(index)}
          >
            {slide.code}
          </button>
        ))}
      </div>
    </div>
  );
}
