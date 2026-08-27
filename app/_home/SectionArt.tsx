"use client";

/* --------------------------------------------------------------
 * ДЕКОРАТИВНЫЕ АНИМАЦИИ РАЗДЕЛОВ ГЛАВНОЙ
 *
 * Каждый раздел получает собственную сцену в стиле «пути воды»:
 * тонкие линии, акцент var(--accent), SMIL-анимация без скриптов.
 * Все сцены чисто декоративные (aria-hidden), клики сквозь них
 * проходят, при calm-режиме анимации не монтируются.
 * -------------------------------------------------------------- */

const ACC = "#3ec3e6";
const OK = "#46d9a0";
const LINE = "rgba(242,245,246,0.16)";
const FAINT = "rgba(242,245,246,0.08)";

/* ============ ПРОИЗВОДСТВО: намотка корпуса ============
 * Цилиндр резервуара, по которому идёт спиральная намотка
 * стеклоленты; кольца жёсткости появляются одно за другим,
 * затем корпус наполняется водой — гидроиспытание. */
export function MakeArt({ calm = false }: { calm?: boolean }) {
  const rings = [70, 130, 190, 250, 310];

  return (
    <svg viewBox="0 0 420 300" aria-hidden="true" focusable="false">
      {/* ось вращения */}
      <line x1="10" y1="150" x2="410" y2="150" stroke={FAINT} strokeDasharray="3 7" />

      {/* корпус: горизонтальный цилиндр */}
      <ellipse cx="40" cy="150" rx="16" ry="58" fill="none" stroke={LINE} />
      <ellipse cx="380" cy="150" rx="16" ry="58" fill="none" stroke={LINE} />
      <line x1="40" y1="92" x2="380" y2="92" stroke={LINE} />
      <line x1="40" y1="208" x2="380" y2="208" stroke={LINE} />

      {/* вода гидроиспытания: уровень поднимается и держится */}
      <clipPath id="makeShell">
        <rect x="40" y="92" width="340" height="116" rx="14" />
      </clipPath>
      <g clipPath="url(#makeShell)">
        <rect x="40" y="208" width="340" height="120" fill={ACC} opacity="0.1">
          {!calm && (
            <animate
              attributeName="y"
              values="208;208;104;104;208"
              keyTimes="0;0.45;0.6;0.92;1"
              dur="16s"
              repeatCount="indefinite"
            />
          )}
        </rect>
      </g>

      {/* спиральная намотка: витки прорисовываются слева направо */}
      {Array.from({ length: 12 }, (_, index) => {
        const x = 52 + index * 27;
        return (
          <path
            key={index}
            d={`M ${x} 208 C ${x + 9} 170, ${x + 18} 130, ${x + 27} 92`}
            fill="none"
            stroke={ACC}
            strokeWidth="1.4"
            opacity="0.55"
            strokeDasharray="130"
            strokeDashoffset={calm ? 0 : 130}
          >
            {!calm && (
              <animate
                attributeName="stroke-dashoffset"
                values="130;0;0;130"
                keyTimes={`0;${0.05 + index * 0.028};0.95;1`}
                dur="16s"
                repeatCount="indefinite"
              />
            )}
          </path>
        );
      })}

      {/* кольца жёсткости появляются после намотки */}
      {rings.map((x, index) => (
        <ellipse
          key={x}
          cx={x}
          cy="150"
          rx="10"
          ry="60"
          fill="none"
          stroke={ACC}
          strokeWidth="1.6"
          opacity={calm ? 0.8 : 0}
        >
          {!calm && (
            <animate
              attributeName="opacity"
              values={`0;0;0.85;0.85;0`}
              keyTimes={`0;${0.4 + index * 0.02};${0.45 + index * 0.02};0.93;1`}
              dur="16s"
              repeatCount="indefinite"
            />
          )}
        </ellipse>
      ))}

      {/* каретка намотки бежит вдоль корпуса */}
      {!calm && (
        <g>
          <rect x="-8" y="66" width="16" height="18" fill="none" stroke={ACC} strokeWidth="1.4" />
          <line x1="0" y1="84" x2="0" y2="110" stroke={ACC} strokeWidth="1" opacity="0.6" />
          <animateMotion
            path="M 52 0 L 376 0 L 52 0"
            keyTimes="0;0.4;1"
            keyPoints="0;1;1"
            calcMode="linear"
            dur="16s"
            repeatCount="indefinite"
          />
          <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.4;0.45;1" dur="16s" repeatCount="indefinite" />
        </g>
      )}

      {/* манометр гидроиспытания оживает в конце цикла */}
      <g opacity={calm ? 1 : 0}>
        <circle cx="380" cy="60" r="14" fill="none" stroke={LINE} />
        <line x1="380" y1="60" x2="371" y2="52" stroke={OK} strokeWidth="1.6">
          {!calm && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 380 60;110 380 60;110 380 60"
              keyTimes="0;0.3;1"
              dur="16s"
              repeatCount="indefinite"
            />
          )}
        </line>
        <line x1="380" y1="74" x2="380" y2="92" stroke={LINE} />
        {!calm && (
          <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.6;0.66;0.92;1" dur="16s" repeatCount="indefinite" />
        )}
      </g>
    </svg>
  );
}

/* ============ ТЕХНОЛОГИИ: мембранное разделение ============
 * Поток идёт слева; мелкие частицы проходят сквозь мембранные
 * волокна, крупные отражаются и уходят вниз в концентрат. */
export function TechArt({ calm = false }: { calm?: boolean }) {
  const fibers = [150, 175, 200];
  const pass = [
    { y: 60, d: 7.2, delay: 0 },
    { y: 95, d: 8.4, delay: 2.1 },
    { y: 130, d: 7.8, delay: 4.4 },
    { y: 168, d: 8.9, delay: 1.2 },
  ];
  const reject = [
    { y: 78, d: 8.1, delay: 0.8, r: 4.4 },
    { y: 116, d: 9.3, delay: 3.4, r: 5.2 },
    { y: 150, d: 8.6, delay: 5.6, r: 4.8 },
  ];

  return (
    <svg viewBox="0 0 360 240" aria-hidden="true" focusable="false">
      {/* канал */}
      <line x1="10" y1="30" x2="350" y2="30" stroke={LINE} />
      <line x1="10" y1="198" x2="130" y2="198" stroke={LINE} />
      <line x1="220" y1="198" x2="350" y2="198" stroke={LINE} />

      {/* мембранные волокна */}
      {fibers.map((x) => (
        <g key={x}>
          <line x1={x} y1="30" x2={x} y2="198" stroke={ACC} strokeWidth="1.5" opacity="0.7" />
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} cx={x} cy={44 + i * 18} r="1.4" fill={ACC} opacity="0.5" />
          ))}
        </g>
      ))}

      {/* отвод концентрата вниз */}
      <path d="M 130 198 L 130 226 M 220 198 L 220 226" stroke={LINE} fill="none" />
      <text x="175" y="222" textAnchor="middle" fontSize="9" fill="rgba(242,245,246,0.3)" fontFamily="inherit">
        ↓
      </text>

      {/* чистая вода: мелкие точки проходят насквозь */}
      {!calm &&
        pass.map((p, index) => (
          <circle key={`p${index}`} r="2.2" fill={OK}>
            <animateMotion
              path={`M 14 ${p.y} L 346 ${p.y}`}
              dur={`${p.d}s`}
              begin={`${p.delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;1;0"
              keyTimes="0;0.06;0.5;0.94;1"
              dur={`${p.d}s`}
              begin={`${p.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

      {/* загрязнение: крупные точки отражаются от первого волокна */}
      {!calm &&
        reject.map((p, index) => (
          <circle key={`r${index}`} r={p.r} fill="none" stroke="#ff8265" strokeWidth="1.4">
            <animateMotion
              path={`M 14 ${p.y} L 143 ${p.y} C 132 ${p.y + 30}, 128 150, 126 224`}
              dur={`${p.d}s`}
              begin={`${p.delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.08;0.82;1"
              dur={`${p.d}s`}
              begin={`${p.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
    </svg>
  );
}

/* ============ ОТРАСЛИ: карта Узбекистана ============
 * Стилизованная точечная карта; города пульсируют. */
const UZ_OUTLINE: [number, number][] = [
  [36, 128], [66, 84], [120, 52], [196, 38], [252, 52], [284, 88],
  [318, 96], [330, 128], [368, 118], [402, 140], [430, 118], [468, 128],
  [500, 108], [548, 118], [584, 104], [600, 122], [586, 144], [552, 148],
  [524, 168], [488, 158], [456, 184], [420, 170], [400, 196], [362, 206],
  [340, 240], [300, 268], [252, 292], [206, 296], [172, 262], [148, 276],
  [112, 240], [82, 196], [52, 168],
];

function inside(x: number, y: number) {
  let ok = false;
  for (let i = 0, j = UZ_OUTLINE.length - 1; i < UZ_OUTLINE.length; j = i++) {
    const [xi, yi] = UZ_OUTLINE[i];
    const [xj, yj] = UZ_OUTLINE[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      ok = !ok;
    }
  }
  return ok;
}

const UZ_DOTS: [number, number][] = [];
for (let y = 40; y < 300; y += 13) {
  for (let x = 30; x < 610; x += 13) {
    if (inside(x, y)) UZ_DOTS.push([x, y]);
  }
}

const CITIES: { x: number; y: number; delay: number }[] = [
  { x: 500, y: 128, delay: 0 },      // Ташкент
  { x: 396, y: 182, delay: 1.4 },    // Самарканд
  { x: 330, y: 208, delay: 2.8 },    // Бухара
  { x: 576, y: 126, delay: 2.1 },    // Фергана
  { x: 130, y: 160, delay: 3.5 },    // Ургенч
  { x: 88, y: 120, delay: 4.2 },     // Нукус
  { x: 356, y: 244, delay: 4.9 },    // Карши
  { x: 300, y: 150, delay: 5.6 },    // Навои
];

export function IndustryArt({ calm = false }: { calm?: boolean }) {
  return (
    <svg viewBox="0 0 640 320" aria-hidden="true" focusable="false">
      {UZ_DOTS.map(([x, y], index) => (
        <circle key={index} cx={x} cy={y} r="1.5" fill="rgba(242,245,246,0.14)" />
      ))}

      {CITIES.map((city, index) => (
        <g key={index}>
          <circle cx={city.x} cy={city.y} r="3" fill={ACC} />
          {!calm && (
            <>
              <circle cx={city.x} cy={city.y} r="3" fill="none" stroke={ACC} strokeWidth="1">
                <animate
                  attributeName="r"
                  values="3;20"
                  dur="3.4s"
                  begin={`${city.delay}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.8;0"
                  dur="3.4s"
                  begin={`${city.delay}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

/* ============ ЭТАПЫ РАБОТ: линия проекта ============
 * Импульс проходит по линии, узлы этапов зажигаются по очереди. */
export function ServiceArt({ calm = false, steps = 7 }: { calm?: boolean; steps?: number }) {
  const width = 700;
  const pad = 24;
  const gap = (width - pad * 2) / (steps - 1);
  const DUR = 9;

  return (
    <svg viewBox={`0 0 ${width} 56`} aria-hidden="true" focusable="false">
      <line x1={pad} y1="28" x2={width - pad} y2="28" stroke={LINE} />

      {/* заполняющаяся линия */}
      {!calm && (
        <line x1={pad} y1="28" x2={width - pad} y2="28" stroke={ACC} strokeWidth="1.6" strokeDasharray={width - pad * 2} strokeDashoffset={width - pad * 2}>
          <animate
            attributeName="stroke-dashoffset"
            values={`${width - pad * 2};0;0`}
            keyTimes="0;0.75;1"
            dur={`${DUR}s`}
            repeatCount="indefinite"
          />
        </line>
      )}

      {Array.from({ length: steps }, (_, index) => {
        const x = pad + gap * index;
        const at = (0.75 * index) / (steps - 1);
        return (
          <g key={index}>
            <circle cx={x} cy="28" r="5" fill="#161d21" stroke={LINE} strokeWidth="1.4" />
            <circle cx={x} cy="28" r="5" fill="none" stroke={ACC} strokeWidth="1.6" opacity={calm ? 1 : 0}>
              {!calm && (
                <animate
                  attributeName="opacity"
                  values={`0;0;1;1;0`}
                  keyTimes={`0;${Math.max(at - 0.001, 0)};${Math.min(at + 0.02, 1)};0.96;1`}
                  dur={`${DUR}s`}
                  repeatCount="indefinite"
                />
              )}
            </circle>
            <circle cx={x} cy="28" r="2" fill={ACC} opacity={calm ? 1 : 0.35} />
          </g>
        );
      })}

      {/* бегущий импульс */}
      {!calm && (
        <circle r="3.4" fill={ACC}>
          <animateMotion
            path={`M ${pad} 28 L ${width - pad} 28`}
            keyPoints="0;1;1"
            keyTimes="0;0.75;1"
            calcMode="linear"
            dur={`${DUR}s`}
            repeatCount="indefinite"
          />
          <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.74;0.78;1" dur={`${DUR}s`} repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

/* ============ КОНТАКТЫ: сигнал ============
 * Точка связи, от которой расходятся кольца. */
export function ContactArt({ calm = false }: { calm?: boolean }) {
  return (
    <svg viewBox="0 0 300 300" aria-hidden="true" focusable="false">
      <circle cx="150" cy="150" r="4" fill={ACC} />
      {[0, 1.3, 2.6].map((delay, index) => (
        <circle key={index} cx="150" cy="150" r="6" fill="none" stroke={ACC} strokeWidth="1.2" opacity={calm ? 0.25 : 0}>
          {!calm && (
            <>
              <animate attributeName="r" values="6;140" dur="4s" begin={`${delay}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0" dur="4s" begin={`${delay}s`} repeatCount="indefinite" />
            </>
          )}
        </circle>
      ))}
      {calm && (
        <>
          <circle cx="150" cy="150" r="60" fill="none" stroke={ACC} strokeWidth="1" opacity="0.3" />
          <circle cx="150" cy="150" r="110" fill="none" stroke={ACC} strokeWidth="1" opacity="0.15" />
        </>
      )}
    </svg>
  );
}

/* ============ КАТАЛОГ: коллектор ============
 * Один вход разветвляется на линейки — поток расходится
 * по направлениям каталога. */
export function CatalogArt({ calm = false }: { calm?: boolean }) {
  const outs = [34, 70, 106, 142, 178, 214];

  return (
    <svg viewBox="0 0 360 248" aria-hidden="true" focusable="false">
      {/* магистраль и гребёнка */}
      <line x1="10" y1="124" x2="120" y2="124" stroke={LINE} />
      <line x1="120" y1="34" x2="120" y2="214" stroke={LINE} />
      {outs.map((y) => (
        <g key={y}>
          <line x1="120" y1={y} x2="330" y2={y} stroke={LINE} />
          <circle cx="336" cy={y} r="3" fill="none" stroke={ACC} strokeWidth="1.2" opacity="0.6" />
        </g>
      ))}

      {/* задвижка на входе */}
      <path d="M 60 116 L 76 132 M 76 116 L 60 132" stroke={ACC} strokeWidth="1.2" opacity="0.5" />

      {/* поток: капли расходятся по веткам */}
      {!calm &&
        outs.map((y, index) => (
          <circle key={y} r="2.4" fill={ACC}>
            <animateMotion
              path={`M 10 124 L 120 124 L 120 ${y} L 332 ${y}`}
              dur={`${5.6 + index * 0.7}s`}
              begin={`${index * 0.9}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.06;0.9;1"
              dur={`${5.6 + index * 0.7}s`}
              begin={`${index * 0.9}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
    </svg>
  );
}
