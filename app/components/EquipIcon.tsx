"use client";

/* --------------------------------------------------------------
 * ИКОНКИ ОБОРУДОВАНИЯ
 *
 * Линейный набор, сетка 24 × 24, единая толщина линии.
 * Цвет наследуется через currentColor, поэтому иконка сама
 * подхватывает подсветку при наведении на карточку.
 * -------------------------------------------------------------- */

export type IconName =
  | "ball"
  | "bio"
  | "blower"
  | "carriers"
  | "check"
  | "chem"
  | "cycle"
  | "daf"
  | "dewater"
  | "diffuser"
  | "disc"
  | "dosing"
  | "drum"
  | "factory"
  | "filter"
  | "flow"
  | "gate"
  | "gear"
  | "grid"
  | "grit"
  | "heat"
  | "kns"
  | "lab"
  | "lamella"
  | "membrane"
  | "mixer"
  | "panel"
  | "pipe"
  | "plan"
  | "plc"
  | "press"
  | "pump"
  | "pumpCentr"
  | "pumpDrain"
  | "pumpSub"
  | "pumpVert"
  | "ro"
  | "screen"
  | "screw"
  | "sensor"
  | "settler"
  | "sludge"
  | "station"
  | "tank"
  | "truck"
  | "turnkey"
  | "uv"
  | "valve"
  | "water"
  | "wrench"
  | "zones";

const SHAPES: Record<IconName, React.ReactNode> = {
  ball: (
    <>
      <circle cx={12} cy={12} r={4.6} /> <path d="M3.5 12 h3.9" /> <path d="M16.6 12 h3.9" /> <path d="M12 7.4 v-3.9" /> <path d="M9.5 3.5 h5" />
    </>
  ),
  bio: (
    <>
      <circle cx={12} cy={12} r={8.5} /> <circle cx={9} cy={10} r={1.5} /> <circle cx={14.5} cy={9} r={1.2} /> <circle cx={12} cy={15} r={1.7} /> <circle cx={15.5} cy={14} r={1.1} />
    </>
  ),
  blower: (
    <>
      <circle cx={11} cy={12} r={5} /> <path d="M16.5 12 h4.5" /> <path d="M18.5 9.5 l2.5 2.5 l-2.5 2.5" />
    </>
  ),
  carriers: (
    <>
      <rect x={4} y={5} width={16} height={14} rx={1} /> <circle cx={8.5} cy={10} r={1.6} /> <circle cx={13} cy={9} r={1.4} /> <circle cx={16} cy={12.5} r={1.5} /> <circle cx={9.5} cy={14.5} r={1.4} /> <circle cx={14} cy={15.2} r={1.6} />
    </>
  ),
  check: (
    <>
      <path d="M3.5 12 h6" /> <path d="M14.5 12 h6" /> <path d="M9.5 7.5 l5 4.5 l-5 4.5 z" /> <path d="M14.5 7.5 v9" />
    </>
  ),
  chem: (
    <>
      <path d="M9.5 3 h5" /> <path d="M10.5 3 v6 l-4.5 9.5 a1 1 0 0 0 0.9 1.5 h10.2 a1 1 0 0 0 0.9 -1.5 l-4.5 -9.5 v-6" /> <path d="M7.6 15 h8.8" />
    </>
  ),
  cycle: (
    <>
      <path d="M19.5 12 a7.5 7.5 0 1 1 -3.2 -6.4" /> <path d="M16.3 5.6 h3.6 v3.6" />
    </>
  ),
  daf: (
    <>
      <rect x={4} y={6.5} width={16} height={12} rx={1} /> <path d="M4 9 h16" /> <circle cx={8} cy={15} r={1.2} /> <circle cx={11} cy={12} r={1.2} /> <circle cx={14} cy={14} r={1.2} /> <circle cx={17} cy={11} r={1.2} />
    </>
  ),
  dewater: (
    <>
      <rect x={3} y={8} width={18} height={8} rx={4} /> <path d="M6.5 8 q3.5 4 0 8" /> <path d="M11.5 8 q3.5 4 0 8" /> <path d="M16.5 8 q3.5 4 0 8" />
    </>
  ),
  diffuser: (
    <>
      <rect x={5} y={15} width={14} height={3} rx={1.5} /> <circle cx={8} cy={11} r={1.3} /> <circle cx={12} cy={8.5} r={1.3} /> <circle cx={16} cy={11} r={1.3} />
    </>
  ),
  disc: (
    <>
      <circle cx={12} cy={12} r={5.6} /> <path d="M8.6 15 l6.8 -6" /> <path d="M12 6.4 v-2.9" /> <path d="M9.5 3.5 h5" />
    </>
  ),
  dosing: (
    <>
      <rect x={6} y={3} width={8} height={9} rx={1} /> <path d="M10 12 v3" /> <circle cx={10} cy={18.5} r={2.5} /> <path d="M6.5 7 h7" />
    </>
  ),
  drum: (
    <>
      <rect x={3} y={7} width={18} height={10} rx={5} /> <path d="M8 7 v10" /> <path d="M12 9.5 h5" /> <path d="M12 12 h5" /> <path d="M12 14.5 h5" />
    </>
  ),
  factory: (
    <>
      <path d="M3.5 20 v-8 l5 3 v-3 l5 3 v-3 l5 3 v5 z" /> <path d="M3.5 20 h17" /> <path d="M17 12 V4.5 h3 V12" />
    </>
  ),
  filter: (
    <>
      <path d="M7 3 h10 v13 a5 5 0 0 1 -10 0 z" /> <path d="M7 9 h10" /> <path d="M7 13 h10" />
    </>
  ),
  flow: (
    <>
      <path d="M2.5 12 h5" /> <path d="M16.5 12 h5" /> <circle cx={12} cy={12} r={4.5} /> <path d="M12 12 l2.8 -2.8" /> <path d="M12 7.5 v1.2" /> <path d="M16.5 12 h-1.2" />
    </>
  ),
  gate: (
    <>
      <path d="M3.5 12 h5" /> <path d="M15.5 12 h5" /> <rect x={8.5} y={7} width={7} height={10} rx={0.6} /> <path d="M12 7 v-3.5" /> <path d="M9.5 3.5 h5" />
    </>
  ),
  gear: (
    <>
      <circle cx={12} cy={12} r={3} /> <circle cx={12} cy={12} r={7} /> <path d="M12 5 v-2.5" /> <path d="M12 21.5 v-2.5" /> <path d="M19 12 h2.5" /> <path d="M2.5 12 h2.5" /> <path d="M17 7 l1.8 -1.8" /> <path d="M5.2 18.8 l1.8 -1.8" /> <path d="M17 17 l1.8 1.8" /> <path d="M5.2 5.2 l1.8 1.8" />
    </>
  ),
  grid: (
    <>
      <path d="M3.5 16 h17" /> <path d="M3.5 19.5 h17" /> <path d="M8 16 v3.5" /> <path d="M12 16 v3.5" /> <path d="M16 16 v3.5" /> <circle cx={8} cy={11.5} r={1.2} /> <circle cx={12} cy={9} r={1.2} /> <circle cx={16} cy={11.5} r={1.2} />
    </>
  ),
  grit: (
    <>
      <path d="M4 5 h16 l-4.5 10 h-7 z" /> <circle cx={9} cy={18} r={1.1} /> <circle cx={12} cy={19} r={1.1} /> <circle cx={15} cy={18} r={1.1} />
    </>
  ),
  heat: (
    <>
      <path d="M3.5 8.5 q3 -4 6 0 t6 0 t5 0" /> <path d="M3.5 15 q3 -4 6 0 t6 0 t5 0" />
    </>
  ),
  kns: (
    <>
      <rect x={6} y={3} width={12} height={17} rx={1} /> <path d="M6 8 h12" /> <circle cx={12} cy={14.5} r={2.6} /> <path d="M12 3 v5" />
    </>
  ),
  lab: (
    <>
      <circle cx={11} cy={11} r={6} /> <path d="M15.4 15.4 L21 21" /> <path d="M8.5 11 h5" /> <path d="M11 8.5 v5" />
    </>
  ),
  lamella: (
    <>
      <rect x={4} y={4} width={16} height={16} rx={1} /> <path d="M6 18 L12 6" /> <path d="M10 18 L16 6" /> <path d="M14 18 L20 6" />
    </>
  ),
  membrane: (
    <>
      <rect x={4} y={4} width={16} height={16} rx={2} /> <path d="M8 4 v16" /> <path d="M12 4 v16" /> <path d="M16 4 v16" />
    </>
  ),
  mixer: (
    <>
      <rect x={9.5} y={2.5} width={5} height={3} rx={0.6} /> <path d="M12 5.5 v11.5" /> <path d="M6.5 12.5 q5.5 3.5 11 0" /> <path d="M6.5 16.5 q5.5 3.5 11 0" />
    </>
  ),
  panel: (
    <>
      <rect x={5} y={3} width={14} height={18} rx={1} /> <circle cx={9} cy={8} r={1.1} /> <circle cx={13} cy={8} r={1.1} /> <path d="M8 13 h8" /> <path d="M8 16.5 h8" />
    </>
  ),
  pipe: (
    <>
      <path d="M3 9 h18" /> <path d="M3 15 h18" /> <path d="M7 6.5 v11" /> <path d="M17 6.5 v11" />
    </>
  ),
  plan: (
    <>
      <rect x={4} y={5} width={16} height={14} rx={1} /> <path d="M4 9 h16" /> <path d="M8 9 v10" /> <path d="M11 12.5 h6" /> <path d="M11 15.5 h4" />
    </>
  ),
  plc: (
    <>
      <rect x={7} y={7} width={10} height={10} rx={1} /> <path d="M10 7 v-3.5" /> <path d="M14 7 v-3.5" /> <path d="M10 17 v3.5" /> <path d="M14 17 v3.5" /> <path d="M7 10 h-3.5" /> <path d="M7 14 h-3.5" /> <path d="M17 10 h3.5" /> <path d="M17 14 h3.5" />
    </>
  ),
  press: (
    <>
      <rect x={4} y={3} width={16} height={3.5} rx={1} /> <path d="M8.5 6.5 v3" /> <path d="M15.5 6.5 v3" /> <rect x={5} y={9.5} width={14} height={10.5} rx={1} /> <path d="M9 15 h6" />
    </>
  ),
  pump: (
    <>
      <circle cx={10} cy={13} r={5} /> <rect x={15} y={10} width={5} height={6} rx={1} /> <path d="M10 8 v-4 h4" />
    </>
  ),
  pumpCentr: (
    <>
      <circle cx={11} cy={13} r={5.5} /> <path d="M11 13 l4 -4" /> <rect x={15} y={10.5} width={5} height={5} rx={0.8} /> <path d="M11 7.5 v-4" /> <path d="M8.5 3.5 h5" />
    </>
  ),
  pumpDrain: (
    <>
      <rect x={8} y={3} width={8} height={7.5} rx={1} /> <path d="M12 10.5 v3.5" /> <path d="M7 14 h10 l-2 6 h-6 z" />
    </>
  ),
  pumpSub: (
    <>
      <rect x={8.5} y={3.5} width={7} height={9} rx={1} /> <path d="M12 12.5 v3" /> <path d="M3.5 18 q2.8 -2 5.5 0 t5.5 0 t5.5 0" /> <path d="M3.5 21 q2.8 -2 5.5 0 t5.5 0 t5.5 0" />
    </>
  ),
  pumpVert: (
    <>
      <rect x={9} y={3} width={6} height={13} rx={1} /> <path d="M12 16 v3" /> <path d="M5.5 19.5 h13" /> <path d="M9 7.5 h6" /> <path d="M9 11.5 h6" />
    </>
  ),
  ro: (
    <>
      <rect x={3} y={7} width={18} height={10} rx={2} /> <path d="M8.5 7 v10" /> <path d="M15.5 7 v10" /> <path d="M0.5 12 h2.5" /> <path d="M21 12 h2.5" />
    </>
  ),
  screen: (
    <>
      <path d="M3.5 20 h17" /> <path d="M5 20 L9 4" /> <path d="M10 20 L14 4" /> <path d="M15 20 L19 4" /> <path d="M3.5 4 h17" />
    </>
  ),
  screw: (
    <>
      <path d="M4 5.5 v13" /> <path d="M20 5.5 v13" /> <path d="M4 8 q8 4.5 16 0" /> <path d="M4 12 q8 4.5 16 0" /> <path d="M4 16 q8 4.5 16 0" />
    </>
  ),
  sensor: (
    <>
      <circle cx={12} cy={17} r={2} /> <path d="M12 15 v-8" /> <path d="M8.5 8.5 a5 5 0 0 1 7 0" /> <path d="M6 5.5 a9 9 0 0 1 12 0" />
    </>
  ),
  settler: (
    <>
      <rect x={3} y={5} width={18} height={9} rx={1} /> <path d="M3 14 l4.5 5 h9 l4.5 -5" /> <path d="M3 9 h18" />
    </>
  ),
  sludge: (
    <>
      <rect x={4} y={4} width={16} height={16} rx={1} /> <path d="M4 14.5 h16 v4 a1 1 0 0 1 -1 1 h-14 a1 1 0 0 1 -1 -1 z" /> <path d="M7 11 v-4" /> <path d="M12 11 v-5" /> <path d="M17 11 v-4" />
    </>
  ),
  station: (
    <>
      <path d="M3.5 20 v-8.5 l8.5 -5 l8.5 5 V20 z" /> <circle cx={12} cy={15} r={2.6} /> <path d="M3.5 20 h17" />
    </>
  ),
  tank: (
    <>
      <rect x={4} y={4} width={16} height={16} rx={2} /> <path d="M4 10 q2 -2 4 0 t4 0 t4 0 t4 0" />
    </>
  ),
  truck: (
    <>
      <rect x={2} y={7} width={11} height={8} rx={1} /> <path d="M13 10 h4 l3 3 v2 h-7 z" /> <circle cx={7} cy={18} r={2} /> <circle cx={17} cy={18} r={2} />
    </>
  ),
  turnkey: (
    <>
      <rect x={3} y={3} width={7} height={7} rx={1} /> <rect x={14} y={3} width={7} height={7} rx={1} /> <rect x={3} y={14} width={7} height={7} rx={1} /> <rect x={14} y={14} width={7} height={7} rx={1} />
    </>
  ),
  uv: (
    <>
      <rect x={3} y={8.5} width={18} height={7} rx={3.5} /> <path d="M7.5 12 h9" /> <path d="M12 5.5 v-2.5" /> <path d="M6.5 6.5 l-1.8 -1.8" /> <path d="M17.5 6.5 l1.8 -1.8" />
    </>
  ),
  valve: (
    <>
      <path d="M8 8 L8 16 L16 8 L16 16 Z" /> <path d="M3.5 12 h4.5" /> <path d="M16 12 h4.5" /> <path d="M12 8 v-4" /> <path d="M9 4 h6" />
    </>
  ),
  water: (
    <>
      <path d="M12 2.5 c0 0 -6.5 7.5 -6.5 11.5 a6.5 6.5 0 0 0 13 0 c0 -4 -6.5 -11.5 -6.5 -11.5 z" />
    </>
  ),
  wrench: (
    <>
      <path d="M15.5 3.5 a5 5 0 0 0 -4.6 8.4 L4 18.8 l1.2 1.2 l6.9 -6.9 a5 5 0 0 0 8.4 -4.6 l-3.2 3.2 l-2.9 -0.7 l-0.7 -2.9 z" />
    </>
  ),
  zones: (
    <>
      <rect x={3} y={6} width={18} height={12} rx={1} /> <path d="M9 6 v12" /> <path d="M15 6 v12" /> <path d="M5.2 12 h1.8" /> <path d="M11.2 12 h1.8" /> <path d="M17.2 12 h1.8" />
    </>
  ),
};

export default function EquipIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const shape = SHAPES[name as IconName] ?? SHAPES.water;

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {shape}
    </svg>
  );
}
