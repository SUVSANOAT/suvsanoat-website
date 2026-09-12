/* ==================================================================
 * ВОДОПРОВОДНАЯ СЕТЬ: ТУПИКОВАЯ И ЗАКОЛЬЦОВАННАЯ
 *
 * Водовод (water-main.ts) — одна нитка от источника к резервуару.
 * Сеть — это когда от источника вода расходится по участкам к многим
 * точкам отбора. Сети бывают двух типов, и считаются они по-разному.
 *
 * ТУПИКОВАЯ. Ветки не соединяются, к каждому узлу вода приходит одним
 * путём. Расход по участку известен сразу: это сумма отборов всех
 * узлов ниже по ветке. Считается прямым ходом от концов к источнику,
 * итераций не нужно.
 *
 * ЗАКОЛЬЦОВАННАЯ. Участки замкнуты в кольца, к узлу вода может прийти
 * двумя и более путями. Расход по участкам заранее неизвестен — он
 * распределяется по сопротивлениям сам, и находится увязкой колец:
 * сумма потерь напора по кольцу должна быть равна нулю. Здесь это
 * метод Лобачёва–Кросса — классический, устойчивый, для сети в
 * десятки колец сходится за секунды.
 *
 * Тип сети программа определяет сама, по графу: если участков не
 * меньше, чем узлов, кольца есть. Спрашивать об этом человека
 * незачем — ошибиться тут легко, а отвечает за ошибку расчёт.
 *
 * ЗАЧЕМ КОЛЬЦА
 *
 * Не ради гидравлики: кольцевая сеть по потерям почти не лучше
 * тупиковой той же длины. Кольца делают ради надёжности: при аварии
 * на участке вода идёт в обход. Поэтому у закольцованной сети здесь
 * считается аварийный режим — по очереди выключается каждый участок,
 * и смотрится, где просядут напоры. У тупиковой сети аварийный режим
 * считать нечего: любой участок — единственный путь, и его отказ
 * оставляет без воды всё, что за ним. Это и выводится.
 *
 * ЧТО ОТ НОРМЫ, А ЧТО ОТ ПРАКТИКИ
 *
 * Наружное водоснабжение — ШНК 2.04.02-97*. Величины свободного напора
 * (10 м на первый этаж и по 4 м на каждый следующий), предельного
 * напора в сети (60 м) и скоростей здесь приняты как практика по
 * этому нормативу и его первоисточнику СНиП 2.04.02-84; пункты не
 * проставлены — сверить по действующей редакции.
 * ================================================================== */

import { headlossGradient, type Lining, type WaterPipeKind } from "./water-main";

/* ------------------------------------------------------------------
 * ВЕЛИЧИНЫ ПРАКТИКИ
 * ------------------------------------------------------------------ */
export const WATER_NETWORK = {
  freeHeadFirstFloor: {
    value: 10,
    note: "свободный напор у одноэтажной застройки 10 м — ШНК 2.04.02-97* (СНиП 2.04.02-84 п. 2.26); пункт ШНК сверить",
  },
  freeHeadPerFloor: {
    value: 4,
    note: "по 4 м на каждый этаж сверх первого — там же",
  },
  maxHead: {
    value: 60,
    note: "свободный напор в сети не выше 60 м — там же; выше нужны зонирование или регуляторы давления",
  },
  velocity: {
    min: 0.5,
    max: 2.0,
    target: 1.0,
    note: "скорость в сети 0,5–2,0 м/с, ориентир 1,0 м/с — практика; ниже растёт застой и зарастание, выше — потери и удар",
  },
  minDn: {
    value: 100,
    note: "наименьший диаметр сети с пожарными гидрантами 100 мм — практика по ШНК; для сети без гидрантов допускается меньше",
  },
  emergencyShare: {
    value: 0.7,
    note: "при аварии на одном участке кольцевая сеть должна подавать не менее 70 % расчётного расхода — практика по ШНК; здесь проверяется напор, а не расход, и это более жёсткая проверка",
  },
} as const;

/** ряд диаметров для подбора, мм — как внутренний */
export const NETWORK_DN = [100, 125, 150, 200, 250, 300, 350, 400, 500, 600, 700, 800] as const;

/* ------------------------------------------------------------------
 * ИСХОДНЫЕ ДАННЫЕ
 * ------------------------------------------------------------------ */
export type NetNode = {
  id: string;
  /** отметка земли, м */
  groundM: number;
  /** узловой отбор, л/с */
  demandLps?: number;
  /** этажность у этого узла — для требуемого свободного напора */
  floors?: number;
  x?: number;
  y?: number;
};

export type NetLink = {
  id?: string;
  from: string;
  to: string;
  lengthM: number;
  /** внутренний диаметр, мм; не задан — подбирается */
  dnMm?: number;
  material?: WaterPipeKind;
};

export type WaterNetworkInput = {
  nodes: NetNode[];
  links: NetLink[];
  /** узел-источник */
  sourceId: string;
  /** пьезометрическая отметка в источнике (уровень в башне или отметка + напор насоса), м */
  sourceHeadM: number;
  material?: WaterPipeKind;
  lining?: Lining;
  /** этажность по умолчанию */
  floors?: number;
  /** считать аварийный режим (по очереди выключать участки) */
  emergency?: boolean;
};

/* ------------------------------------------------------------------
 * РЕЗУЛЬТАТ
 * ------------------------------------------------------------------ */
export type LinkResult = {
  id: string;
  from: string;
  to: string;
  lengthM: number;
  dnMm: number;
  /** расход, л/с; знак — по направлению from → to */
  qLps: number;
  velocity: number;
  /** уклон, м/км */
  gradientMPerKm: number;
  /** потери напора, м */
  headlossM: number;
  /** диаметр подобран программой */
  dnAuto: boolean;
  /** участок — мост: его отказ отрезает часть сети */
  bridge: boolean;
};

export type NodeResult = {
  id: string;
  groundM: number;
  demandLps: number;
  /** пьезометрическая отметка, м */
  hglM: number;
  /** свободный напор, м */
  freeHeadM: number;
  requiredM: number;
  ok: boolean;
};

export type EmergencyCase = {
  /** выключенный участок */
  linkId: string;
  /** сеть осталась связной */
  connected: boolean;
  /** наихудший свободный напор и где */
  worstFreeHeadM: number;
  worstNode: string;
  /** узлы, оставшиеся без воды */
  cutOff: string[];
};

export type WaterNetworkResult = {
  kind: "dead-end" | "looped";
  kindLabel: string;
  loops: number;
  totalDemandLps: number;
  iterations: number;
  converged: boolean;
  links: LinkResult[];
  nodes: NodeResult[];
  emergency: EmergencyCase[];
  assumptions: string[];
  warnings: string[];
};

const r1 = (x: number) => Number(x.toFixed(1));
const r2 = (x: number) => Number(x.toFixed(2));

/* ------------------------------------------------------------------
 * ГРАФ
 * ------------------------------------------------------------------ */
type L = { id: string; from: string; to: string; lengthM: number; dnMm: number; q: number; auto: boolean };

function adjacency(links: L[]): Map<string, { link: L; other: string; sign: number }[]> {
  const adj = new Map<string, { link: L; other: string; sign: number }[]>();
  links.forEach((l) => {
    if (!adj.has(l.from)) adj.set(l.from, []);
    if (!adj.has(l.to)) adj.set(l.to, []);
    adj.get(l.from)!.push({ link: l, other: l.to, sign: 1 });
    adj.get(l.to)!.push({ link: l, other: l.from, sign: -1 });
  });
  return adj;
}

/** Остовное дерево от источника: parent, порядок обхода, хорды. */
function spanningTree(links: L[], source: string, nodeIds: string[]) {
  const adj = adjacency(links);
  const parent = new Map<string, { link: L; sign: number } | null>();
  const order: string[] = [];
  const inTree = new Set<L>();
  const queue = [source];
  parent.set(source, null);
  while (queue.length) {
    const u = queue.shift()!;
    order.push(u);
    (adj.get(u) ?? []).forEach(({ link, other, sign }) => {
      if (!parent.has(other)) {
        parent.set(other, { link, sign });
        inTree.add(link);
        queue.push(other);
      }
    });
  }
  const chords = links.filter((l) => !inTree.has(l));
  const unreachable = nodeIds.filter((n) => !parent.has(n));
  return { adj, parent, order, chords, unreachable };
}

/** Путь по дереву от a к b как список {link, sign} (sign = +1, если идём from→to). */
function treePath(parent: Map<string, { link: L; sign: number } | null>, a: string, b: string) {
  const up = (n: string) => {
    const path: string[] = [n];
    let cur = n;
    while (parent.get(cur)) {
      const p = parent.get(cur)!;
      cur = p.sign === 1 ? p.link.from : p.link.to;
      path.push(cur);
    }
    return path;
  };
  const pa = up(a);
  const pb = up(b);
  const setB = new Set(pb);
  const lca = pa.find((n) => setB.has(n))!;
  const steps: { link: L; sign: number }[] = [];
  /* от a вверх до lca: движение против parent-стрелки */
  for (let cur = a; cur !== lca; ) {
    const p = parent.get(cur)!;
    steps.push({ link: p.link, sign: -p.sign });
    cur = p.sign === 1 ? p.link.from : p.link.to;
  }
  /* от lca вниз до b: по parent-стрелке, в обратном порядке */
  const down: { link: L; sign: number }[] = [];
  for (let cur = b; cur !== lca; ) {
    const p = parent.get(cur)!;
    down.push({ link: p.link, sign: p.sign });
    cur = p.sign === 1 ? p.link.from : p.link.to;
  }
  return steps.concat(down.reverse());
}

/* ------------------------------------------------------------------
 * ГИДРАВЛИКА ОДНОГО УЧАСТКА
 * ------------------------------------------------------------------ */
function linkLoss(l: L, kind: WaterPipeKind, lining: Lining): { h: number; v: number; i: number } {
  const q = Math.abs(l.q);
  if (q < 1e-9) return { h: 0, v: 0, i: 0 };
  const d = l.dnMm / 1000;
  const hl = headlossGradient(q, d, kind, lining);
  return { h: Math.sign(l.q) * hl.i * l.lengthM, v: hl.velocity, i: hl.i };
}

/* ------------------------------------------------------------------
 * ОСНОВНОЙ РАСЧЁТ
 * ------------------------------------------------------------------ */
export function calculateWaterNetwork(input: WaterNetworkInput): WaterNetworkResult {
  const warnings: string[] = [];
  const assumptions: string[] = [];
  const kind: WaterPipeKind = input.material ?? "castIron";
  const lining: Lining = input.lining ?? "cement";
  const floorsDefault = Math.max(1, Math.round(input.floors ?? 1));

  const nodeMap = new Map(input.nodes.map((n) => [n.id, n]));
  if (!nodeMap.has(input.sourceId)) {
    throw new Error(`Узел-источник «${input.sourceId}» не найден среди узлов.`);
  }
  const badLinks = input.links.filter((l) => !nodeMap.has(l.from) || !nodeMap.has(l.to));
  if (badLinks.length) {
    throw new Error(`Участки ссылаются на несуществующие узлы: ${badLinks.map((l) => `${l.from}–${l.to}`).join(", ")}.`);
  }

  const links: L[] = input.links.map((l, i) => ({
    id: l.id ?? `${l.from}-${l.to}`,
    from: l.from,
    to: l.to,
    lengthM: Math.max(1, l.lengthM),
    dnMm: l.dnMm && l.dnMm > 0 ? l.dnMm : 0,
    q: 0,
    auto: !(l.dnMm && l.dnMm > 0),
  }));
  const nodeIds = input.nodes.map((n) => n.id);
  const demand = (id: string) => ((nodeMap.get(id)?.demandLps ?? 0) / 1000);
  const totalDemand = nodeIds.reduce((s, id) => s + demand(id), 0);

  const { parent, order, chords, unreachable } = spanningTree(links, input.sourceId, nodeIds);
  if (unreachable.length) {
    warnings.push(`Узлы не связаны с источником и в расчёт не вошли: ${unreachable.join(", ")}.`);
  }
  const loops = chords.length;
  const isLooped = loops > 0;

  /* ------------------------------------------------------------------
     НАЧАЛЬНОЕ ПОТОКОРАСПРЕДЕЛЕНИЕ

     По дереву — прямым ходом от концов: расход участка равен отбору
     узла плюс всему, что уходит дальше. Хорды получают ноль. Для
     тупиковой сети это и есть ответ; для кольцевой — только начало.
     ------------------------------------------------------------------ */
  const treeFlow = () => {
    const outflow = new Map<string, number>();
    nodeIds.forEach((id) => outflow.set(id, demand(id)));
    links.forEach((l) => (l.q = 0));
    chords.forEach((c) => (c.q = 0));
    for (let i = order.length - 1; i > 0; i -= 1) {
      const n = order[i];
      const p = parent.get(n)!;
      const q = outflow.get(n) ?? 0;
      p.link.q = p.sign === 1 ? q : -q;
      const up = p.sign === 1 ? p.link.from : p.link.to;
      outflow.set(up, (outflow.get(up) ?? 0) + q);
    }
  };
  treeFlow();

  /* ------------------------------------------------------------------
     ПОДБОР ДИАМЕТРОВ

     Там, где диаметр не задан, он берётся по экономичной скорости для
     расхода начального распределения. У кольцевой сети после увязки
     расходы изменятся, и подбор делается ещё раз — уже по увязанным.
     ------------------------------------------------------------------ */
  const sizeLinks = () => {
    links.forEach((l) => {
      if (!l.auto) return;
      const q = Math.max(Math.abs(l.q), 1e-6);
      const dTarget = Math.sqrt((4 * q) / (Math.PI * WATER_NETWORK.velocity.target)) * 1000;
      l.dnMm = NETWORK_DN.find((d) => d >= dTarget && d >= WATER_NETWORK.minDn.value) ?? NETWORK_DN[NETWORK_DN.length - 1];
    });
  };
  sizeLinks();

  /* ------------------------------------------------------------------
     УВЯЗКА КОЛЕЦ — ЛОБАЧЁВ–КРОСС

     Каждая хорда замыкает одно кольцо: путь по дереву от её начала до
     её конца плюс сама хорда. По кольцу считается невязка — сумма
     потерь с учётом направления, — и вносится поправка
     ΔQ = −Σh / (2·Σ|h/Q|), одинаковая для всех участков кольца.
     Повторяется, пока невязки не станут меньше сантиметра.
     ------------------------------------------------------------------ */
  let iterations = 0;
  let converged = !isLooped;
  if (isLooped) {
    const cycles = chords.map((c) => {
      const path = treePath(parent, c.to, c.from); // от конца хорды к её началу по дереву
      return [{ link: c, sign: 1 }, ...path];
    });
    for (let pass = 0; pass < 2; pass += 1) {
      converged = false;
      for (iterations = 1; iterations <= 300; iterations += 1) {
        let maxDq = 0;
        cycles.forEach((cyc) => {
          let sumH = 0;
          let sumHQ = 0;
          cyc.forEach(({ link, sign }) => {
            const { h } = linkLoss(link, kind, lining);
            const qs = sign * link.q;
            const hs = sign * h;
            sumH += hs;
            const qa = Math.max(Math.abs(qs), 1e-6);
            sumHQ += Math.abs(hs) / qa;
          });
          if (sumHQ < 1e-12) return;
          const dq = -sumH / (2 * sumHQ);
          cyc.forEach(({ link, sign }) => (link.q += sign * dq));
          maxDq = Math.max(maxDq, Math.abs(dq));
        });
        if (maxDq < 1e-6) {
          converged = true;
          break;
        }
      }
      /* после первой увязки — пересобрать автоматические диаметры и увязать снова */
      if (pass === 0 && links.some((l) => l.auto)) sizeLinks();
      else break;
    }
    if (!converged) warnings.push("Увязка колец не сошлась за 300 итераций: проверьте участки с нулевой длиной, несвязные кольца и очень разные диаметры в одном кольце.");
  }

  /* ------------------------------------------------------------------
     НАПОРЫ В УЗЛАХ
     ------------------------------------------------------------------ */
  const hgl = new Map<string, number>();
  hgl.set(input.sourceId, input.sourceHeadM);
  order.forEach((n) => {
    const p = parent.get(n);
    if (!p) return;
    const up = p.sign === 1 ? p.link.from : p.link.to;
    const { h } = linkLoss(p.link, kind, lining);
    hgl.set(n, (hgl.get(up) ?? 0) - p.sign * h);
  });

  /* ------------------------------------------------------------------
     МОСТЫ: участки, отказ которых отрезает часть сети
     ------------------------------------------------------------------ */
  const isBridge = (l: L) => {
    const rest = links.filter((x) => x !== l);
    const t = spanningTree(rest, input.sourceId, nodeIds);
    return t.unreachable.length > unreachable.length;
  };
  const bridges = new Set(links.filter(isBridge));

  const linkResults: LinkResult[] = links.map((l) => {
    const { h, v, i } = linkLoss(l, kind, lining);
    return {
      id: l.id,
      from: l.from,
      to: l.to,
      lengthM: Math.round(l.lengthM),
      dnMm: l.dnMm,
      qLps: r2(l.q * 1000),
      velocity: r2(v),
      gradientMPerKm: r2(i * 1000),
      headlossM: r2(Math.abs(h)),
      dnAuto: l.auto,
      bridge: bridges.has(l),
    };
  });

  const nodeResults: NodeResult[] = input.nodes
    .filter((n) => hgl.has(n.id))
    .map((n) => {
      const floors = Math.max(1, Math.round(n.floors ?? floorsDefault));
      const required = WATER_NETWORK.freeHeadFirstFloor.value + WATER_NETWORK.freeHeadPerFloor.value * (floors - 1);
      const free = (hgl.get(n.id) ?? 0) - n.groundM;
      return {
        id: n.id,
        groundM: r2(n.groundM),
        demandLps: r2(n.demandLps ?? 0),
        hglM: r2(hgl.get(n.id) ?? 0),
        freeHeadM: r1(free),
        requiredM: required,
        ok: n.id === input.sourceId || free >= required - 0.01,
      };
    });

  /* ------------------------------------------------------------------
     АВАРИЙНЫЙ РЕЖИМ — только для кольцевой сети

     По очереди выключается каждый участок, сеть пересчитывается с теми
     же диаметрами, и смотрится наихудший свободный напор. Для
     тупиковой сети это не имеет смысла: любой участок — единственный
     путь, и всё, что за ним, остаётся без воды.
     ------------------------------------------------------------------ */
  const emergency: EmergencyCase[] = [];
  if (isLooped && (input.emergency ?? true)) {
    links.forEach((off) => {
      const sub: WaterNetworkInput = {
        ...input,
        links: links.filter((x) => x !== off).map((l) => ({ id: l.id, from: l.from, to: l.to, lengthM: l.lengthM, dnMm: l.dnMm })),
        emergency: false,
      };
      try {
        const r = calculateWaterNetwork(sub);
        const worst = r.nodes.filter((n) => n.id !== input.sourceId).reduce<NodeResult | null>((w, n) => (!w || n.freeHeadM < w.freeHeadM ? n : w), null);
        const cutOff = nodeIds.filter((id) => !r.nodes.some((n) => n.id === id));
        emergency.push({
          linkId: off.id,
          connected: cutOff.length === unreachable.length,
          worstFreeHeadM: worst ? worst.freeHeadM : 0,
          worstNode: worst?.id ?? "—",
          cutOff: cutOff.filter((id) => !unreachable.includes(id)),
        });
      } catch {
        emergency.push({ linkId: off.id, connected: false, worstFreeHeadM: 0, worstNode: "—", cutOff: [] });
      }
    });
  }

  /* ------------------------------------------------------------------
     ПРОВЕРКИ
     ------------------------------------------------------------------ */
  const slow = linkResults.filter((l) => l.velocity > 0 && l.velocity < WATER_NETWORK.velocity.min);
  const fast = linkResults.filter((l) => l.velocity > WATER_NETWORK.velocity.max);
  if (fast.length) warnings.push(`Скорость выше ${WATER_NETWORK.velocity.max} м/с на участках: ${fast.map((l) => `${l.id} (${l.velocity} м/с)`).join(", ")}. Увеличить диаметр.`);
  if (slow.length) warnings.push(`Скорость ниже ${WATER_NETWORK.velocity.min} м/с на участках: ${slow.map((l) => `${l.id} (${l.velocity} м/с)`).join(", ")}. Застой и зарастание; если диаметр продиктован пожарным расходом — предусмотреть промывку.`);
  const low = nodeResults.filter((n) => !n.ok);
  if (low.length) warnings.push(`Свободный напор ниже требуемого в узлах: ${low.map((n) => `${n.id} (${n.freeHeadM} м при норме ${n.requiredM})`).join(", ")}. Поднять напор источника, увеличить диаметры на пути к этим узлам или добавить подкачку.`);
  const high = nodeResults.filter((n) => n.freeHeadM > WATER_NETWORK.maxHead.value);
  if (high.length) warnings.push(`Свободный напор выше ${WATER_NETWORK.maxHead.value} м в узлах: ${high.map((n) => `${n.id} (${n.freeHeadM} м)`).join(", ")}. ${WATER_NETWORK.maxHead.note}.`);
  if (!isLooped) {
    warnings.push(
      `Сеть тупиковая: каждый участок — единственный путь к тому, что за ним. Отказ любого участка оставляет без воды все узлы ниже по ветке. Если объект требует бесперебойной подачи (категория надёжности по ШНК 2.04.02-97*), сеть надо закольцевать — соединить концы веток перемычками.`,
    );
  } else {
    const failing = emergency.filter((e) => !e.connected || e.worstFreeHeadM < WATER_NETWORK.freeHeadFirstFloor.value);
    if (failing.length) {
      warnings.push(
        `Аварийный режим: при отказе участков ${failing.map((e) => e.linkId).join(", ")} ${failing.some((e) => !e.connected) ? "часть узлов отрезается, " : ""}свободный напор падает ниже ${WATER_NETWORK.freeHeadFirstFloor.value} м. Кольцо есть, но оно не обеспечивает подачу в обход — усилить перемычки.`,
      );
    }
    const br = linkResults.filter((l) => l.bridge);
    if (br.length) warnings.push(`Участки-мосты (их отказ отрезает часть сети, кольцо их не дублирует): ${br.map((l) => l.id).join(", ")}.`);
  }

  assumptions.push(
    `Тип сети определён по графу: ${links.length} участков на ${nodeIds.length} узлов — ${isLooped ? `${loops} ${loops === 1 ? "кольцо" : "колец"}, сеть закольцованная` : "колец нет, сеть тупиковая"}.`,
    isLooped
      ? `Потокораспределение — увязка колец по Лобачёву–Кроссу, ${iterations} итераций${converged ? ", сошлось" : ", НЕ сошлось"}; невязка по каждому кольцу меньше 1 см.`
      : "Потокораспределение — прямым ходом от концов веток к источнику; расход участка равен сумме отборов всех узлов за ним.",
    `Потери по длине — ${headlossGradient(0.01, 0.1, kind, lining).method}. Диаметр принят как внутренний.`,
    `Пьезометрическая отметка в источнике ${input.sourceHeadM} м задана проектировщиком (уровень в башне или отметка + напор насоса).`,
    `Требуемый свободный напор: ${WATER_NETWORK.freeHeadFirstFloor.note}; ${WATER_NETWORK.freeHeadPerFloor.note}. Этажность по умолчанию ${floorsDefault}.`,
    `Диаметры без значения подобраны по скорости ${WATER_NETWORK.velocity.target} м/с, не меньше ${WATER_NETWORK.minDn.value} мм (${WATER_NETWORK.minDn.note}).`,
    "Отборы приняты узловыми. Путевые отборы (равномерно вдоль участка) сведены к узловым — половина на каждый конец; это обычная практика для сетей.",
    isLooped
      ? `Аварийный режим: по очереди выключен каждый участок при тех же диаметрах и том же напоре источника. ${WATER_NETWORK.emergencyShare.note}.`
      : "Аварийный режим для тупиковой сети не считается: любой отказ отрезает всё, что за участком.",
    "Гидравлический удар в сети не считается: волна в узлах делится и отражается, и простой формулой это не описывается. Для насосной подачи в кольцевую сеть нужен расчёт переходного процесса по сети целиком.",
  );

  return {
    kind: isLooped ? "looped" : "dead-end",
    kindLabel: isLooped ? "закольцованная" : "тупиковая",
    loops,
    totalDemandLps: r2(totalDemand * 1000),
    iterations,
    converged,
    links: linkResults,
    nodes: nodeResults,
    emergency,
    assumptions,
    warnings,
  };
}

/* ------------------------------------------------------------------
 * ЧТЕНИЕ ТАБЛИЦ
 *
 * Две таблицы, вставленные из Excel:
 *   узлы:    Узел; Отметка; Отбор, л/с; Этажность
 *   участки: От; До; Длина, м; Диаметр, мм
 * Разделитель определяется сам. Если не читается — говорится, что
 * именно.
 * ------------------------------------------------------------------ */
function delim(text: string): string {
  const line = text.split(/\r?\n/).find((l) => l.trim()) ?? "";
  if (line.includes("\t")) return "\t";
  if (line.includes(";")) return ";";
  if (line.includes(",") && !/\d,\d/.test(line)) return ",";
  return /\s{2,}/.test(line) ? " WS" : ";";
}
const split = (line: string, d: string) => (d === " WS" ? line.trim().split(/\s{2,}/) : line.split(d));
const cellNum = (v: string | undefined) => {
  if (v === undefined) return undefined;
  const s = v.replace(/\s/g, "").replace(",", ".");
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

export function parseNetworkTables(nodesText: string, linksText: string): { nodes: NetNode[]; links: NetLink[]; problems: string[] } {
  const problems: string[] = [];
  const nodes: NetNode[] = [];
  const links: NetLink[] = [];

  const nl = nodesText.split(/\r?\n/).filter((l) => l.trim());
  const nd = delim(nodesText);
  nl.forEach((line, i) => {
    const c = split(line, nd).map((x) => x.trim());
    const id = c[0];
    const ground = cellNum(c[1]);
    if (!id || ground === undefined) {
      if (i > 0 || nl.length === 1) problems.push(`Узлы, строка ${i + 1}: не прочитаны имя или отметка — пропущена.`);
      return;
    }
    nodes.push({ id, groundM: ground, demandLps: cellNum(c[2]) ?? 0, floors: cellNum(c[3]) });
  });

  const ll = linksText.split(/\r?\n/).filter((l) => l.trim());
  const ld = delim(linksText);
  ll.forEach((line, i) => {
    const c = split(line, ld).map((x) => x.trim());
    const from = c[0];
    const to = c[1];
    const len = cellNum(c[2]);
    if (!from || !to || len === undefined) {
      if (i > 0 || ll.length === 1) problems.push(`Участки, строка ${i + 1}: не прочитаны узлы или длина — пропущена.`);
      return;
    }
    links.push({ from, to, lengthM: len, dnMm: cellNum(c[3]) });
  });

  if (nodes.length < 2) problems.push("Нужно не меньше двух узлов.");
  if (links.length < 1) problems.push("Нужен хотя бы один участок.");
  const ids = new Set(nodes.map((n) => n.id));
  const orphan = links.filter((l) => !ids.has(l.from) || !ids.has(l.to));
  if (orphan.length) problems.push(`Участки ссылаются на узлы, которых нет в таблице узлов: ${orphan.map((l) => `${l.from}–${l.to}`).join(", ")}.`);

  return { nodes, links, problems };
}
