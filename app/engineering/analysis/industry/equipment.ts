/* ==================================================================
 * БИБЛИОТЕКА ОБОРУДОВАНИЯ ОЧИСТНЫХ СООРУЖЕНИЙ
 *
 * Состав определяется технологией и расходом, а не тем, что делает
 * SUVSANOAT. Для каждой ступени выдаётся полный перечень позиций:
 * сооружение, механическое оборудование, КИП — с расчётным
 * параметром, количеством и резервированием.
 *
 * Типоразмерный ряд по расходу:
 *   compact  (до 200 м³/сут)   — блочные установки полной заводской
 *                                готовности, стеклопластик;
 *   modular  (200–1500 м³/сут) — блочно-модульные линии или ж/б,
 *                                выбор по площадке и грунтам;
 *   concrete (свыше 1500)      — железобетонные сооружения,
 *                                оборудование поставное.
 * Границы приняты по практике проектирования, не по нормативу, и
 * подлежат уточнению компоновкой на площадке.
 *
 * Расчётные величины: КМК 2.04.03-97, DWA-A 131, EN 858, EN 1825,
 * Metcalf & Eddy «Wastewater Engineering». Резервирование насосов и
 * воздуходувок — по КМК 2.04.03-97 (рабочий + резервный).
 * ================================================================== */

import type { StageKey } from "./industries";
import { DEFAULT_ASSUMPTIONS, type Assumptions } from "../../../../lib/assumptions";
import { L, t as tr, type L10n } from "./i18n";
import type { Language } from "../../../translations";

export type Supply = "own" | "supply" | "either";
export type ItemKind = "structure" | "machine" | "instrument";

export type Item = {
  kind: ItemKind;
  /** наименование позиции так, как она пойдёт в ведомость */
  name: string;
  /** расчётный параметр, определяющий типоразмер */
  spec: string;
  /** количество и резервирование */
  qty: string;
  supply: Supply;
  note?: string;
};

export type Scale = "compact" | "modular" | "concrete";

export const SCALE_LABEL: Record<Scale, L10n> = {
  compact: L(
    "блочная установка заводской готовности (стеклопластик)",
    "to‘liq zavod tayyorligidagi blokli qurilma (shishaplastik)",
    "packaged factory-built unit (GRP)",
    "工厂预制一体化设备（玻璃钢）"
  ),
  modular: L(
    "блочно-модульное или железобетонное исполнение",
    "blok-modulli yoki temir-beton bajarilish",
    "modular or reinforced-concrete construction",
    "模块化或钢筋混凝土结构"
  ),
  concrete: L(
    "железобетонные сооружения, оборудование поставное",
    "temir-beton inshootlar, uskunalar yetkazib beriladi",
    "reinforced-concrete structures with supplied equipment",
    "钢筋混凝土构筑物，设备采购供货"
  ),
};

export function scaleOf(Q: number, a: Assumptions = DEFAULT_ASSUMPTIONS): Scale {
  if (Q <= a.scaleCompact) return "compact";
  if (Q <= a.scaleModular) return "modular";
  return "concrete";
}

export type Ctx = {
  Q: number;
  Qh: number;
  Qls: number;
  hours: number;
  scale: Scale;
  industryId: string;
  dischargeId: string;
  bod: number;
  cod: number;
  ss: number;
  fats: number;
  petro: number;
  tn: number;
  /** нагрузка по БПК, кг/сут */
  bodLoad: number;
  /** объём усреднителя, м³ (из расчёта страницы) */
  vAvg?: number;
  /** объём биоблока, м³ */
  vBio?: number;
  /** расход воздуха, м³/ч */
  air?: number;
  /** масса осадка, кг СВ/сут */
  dryKg?: number;
  /** утверждённые коэффициенты расчёта */
  a: Assumptions;
  /** язык вывода */
  lang: Language;
};

const f = (v: number, d = 0) => v.toLocaleString("ru-RU", { maximumFractionDigits: d });

/* насосная группа: рабочие + резерв по КМК */
function pumpQty(n = 1): string {
  return `${n + 1} (${n} раб. + 1 рез.)`;
}

/* ------------------------------------------------------------------
 * ОБЩЕСТАНЦИОННЫЕ ПОЗИЦИИ — не привязаны к ступени
 * ------------------------------------------------------------------ */

export function commonEquipment(ctx: Ctx): Item[] {
  const items: Item[] = [];

  items.push({
    kind: "structure",
    name: "Приёмная камера с аварийным переливом",
    spec: `на расход ${f(ctx.Qh, 1)} м³/ч; гашение скорости, отбор проб`,
    qty: "1",
    supply: "either",
  });

  items.push({
    kind: "instrument",
    name: "Узел учёта сточных вод",
    spec:
      ctx.scale === "concrete"
        ? "лоток Паршаля с ультразвуковым уровнемером"
        : `электромагнитный расходомер DN по подводящему трубопроводу, ${f(ctx.Qh, 1)} м³/ч`,
    qty: "1",
    supply: "supply",
    note: "Учёт обязателен по договору водопользования; сигнал в систему управления",
  });

  items.push({
    kind: "structure",
    name: "Аварийно-регулирующая ёмкость",
    spec: `объём не менее ${f(Math.max(ctx.Q / 24, ctx.Qh) * ctx.a.reserveEmergency)} м³ (${ctx.a.reserveEmergency} ч притока)`,
    qty: "1",
    supply: "own",
    note: "Приём стока при отключении питания и на время ремонта; опорожнение обратно в голову сооружений",
  });

  items.push({
    kind: "machine",
    name: "Дренажная насосная станция",
    spec: "сбор дренажных и промывных вод с площадки, возврат в усреднитель",
    qty: pumpQty(1),
    supply: "either",
  });

  items.push({
    kind: "instrument",
    name: "Шкаф управления и система автоматизации (АСУ ТП)",
    spec:
      ctx.scale === "compact"
        ? "локальная автоматика с диспетчеризацией по GSM"
        : "щиты управления, частотные преобразователи, SCADA с архивом параметров",
    qty: "комплект",
    supply: "supply",
  });

  if (["meat", "poultry", "fish", "settlement", "hospital", "leather"].includes(ctx.industryId)) {
    items.push({
      kind: "machine",
      name: "Система дезодорации",
      spec:
        ctx.scale === "compact"
          ? "укрытия сооружений и угольный фильтр вытяжки"
          : "герметичные укрытия, вытяжные вентиляторы, биофильтр или химический скруббер",
      qty: "комплект",
      supply: "supply",
      note: "Сток даёт сероводород и меркаптаны; при размещении вблизи жилья дезодорация обязательна",
    });
  }

  return items;
}

/* ------------------------------------------------------------------
 * ПОСТУПЕНЧАТЫЙ СОСТАВ
 * ------------------------------------------------------------------ */

export function equipmentFor(stage: StageKey, ctx: Ctx): Item[] {
  const items: Item[] = [];
  const fine = ["meat", "poultry", "fish", "leather", "textile-dye", "knitwear", "wool"].includes(ctx.industryId);

  switch (stage) {
    /* ---------------- механическая очистка ---------------- */
    case "screen": {
      if (ctx.Q <= 50) {
        items.push({
          kind: "machine",
          name: "Решётка-корзина в приёмной камере",
          spec: "прозор 5–8 мм, ручная выгрузка в контейнер",
          qty: "1",
          supply: "own",
        });
      } else if (ctx.scale !== "concrete") {
        items.push({
          kind: "machine",
          name: "Решётка механизированная шнековая (компактор)",
          spec: `прозор ${fine ? "2–3" : "3–6"} мм, пропускная способность от ${f(ctx.Qh * ctx.a.screenPeak, 1)} м³/ч`,
          qty: "1 + байпас с ручной решёткой",
          supply: "supply",
          note: "Отбросы прессуются и обезвоживаются в самой решётке",
        });
      } else {
        items.push({
          kind: "machine",
          name: "Решётка механическая грабельная или ступенчатая",
          spec: `прозор ${fine ? "2–3" : "3–6"} мм, каждая на полный расход ${f(ctx.Qh * ctx.a.screenPeak, 1)} м³/ч`,
          qty: "2 (1 раб. + 1 рез.) + байпасный канал с ручной решёткой",
          supply: "supply",
        });
        items.push({
          kind: "machine",
          name: "Транспортёр-пресс отбросов",
          spec: "шнековый, обезвоживание отбросов до 35–40 % СВ",
          qty: "1",
          supply: "supply",
        });
      }

      if (fine) {
        items.push({
          kind: "machine",
          name: "Барабанное сито (процеживатель)",
          spec: `сетка 0,5–1,0 мм, ${f(ctx.Qh, 1)} м³/ч — снятие пера, шерсти, мездры, ворса`,
          qty: ctx.scale === "concrete" ? pumpQty(1) : "1",
          supply: "supply",
          note: "Снимает до 30 % взвешенных и заметную часть БПК до биологии",
        });
      }

      items.push({
        kind: "structure",
        name: "Контейнер для отбросов",
        spec: "объём по недельному накоплению, закрытого типа",
        qty: "1",
        supply: "supply",
      });
      break;
    }

    /* ---------------- песколовка ---------------- */
    case "sand": {
      if (ctx.scale === "compact") {
        items.push({
          kind: "structure",
          name: "Песколовка тангенциальная (вертикальная)",
          spec: `${f(ctx.Qls, 1)} л/с, задержание частиц от ${ctx.a.sandSize} мм`,
          qty: "1",
          supply: "own",
        });
      } else if (ctx.scale === "modular") {
        items.push({
          kind: "structure",
          name: "Песколовка горизонтальная двухсекционная",
          spec: `${f(ctx.Qls, 1)} л/с, скорость потока 0,15–0,3 м/с, 2 отделения с возможностью отключения`,
          qty: "1 (2 секции)",
          supply: "either",
        });
      } else {
        items.push({
          kind: "structure",
          name: "Песколовка аэрируемая",
          spec: `${f(ctx.Qls, 1)} л/с, время пребывания 2–3 мин, расход воздуха 3–5 м³/(м²·ч)`,
          qty: "2 секции",
          supply: "supply",
          note: "Аэрация отмывает песок от органики — осадок не загнивает",
        });
      }

      items.push({
        kind: "machine",
        name: ctx.scale === "compact" ? "Эрлифт удаления песка" : "Насос песковый (гидроэлеватор)",
        spec: "откачка пульпы на обезвоживание",
        qty: ctx.scale === "concrete" ? pumpQty(1) : "1",
        supply: "supply",
      });

      if (ctx.scale !== "compact") {
        items.push({
          kind: "machine",
          name: "Классификатор (пескопромыватель) с бункером",
          spec: "отмывка песка до содержания органики менее 10 %, обезвоживание",
          qty: "1",
          supply: "supply",
        });
      }
      break;
    }

    /* ---------------- усреднитель ---------------- */
    case "avg": {
      const V = ctx.vAvg ?? 0;
      items.push({
        kind: "structure",
        name: "Усреднитель-накопитель",
        spec: `рабочий объём ${f(V)} м³; ${tr(SCALE_LABEL[ctx.scale], ctx.lang)}`,
        qty: ctx.scale === "compact" ? "1" : "1 (2 секции для чистки без остановки)",
        supply: ctx.scale === "concrete" ? "supply" : "own",
      });
      items.push({
        kind: "machine",
        name: ctx.scale === "compact" ? "Барботажная система перемешивания" : "Мешалка погружная (или барботаж)",
        spec:
          ctx.scale === "compact"
            ? `расход воздуха ${ctx.a.mixAirRate} м³/(м³·ч) — около ${f(V * ctx.a.mixAirRate)} м³/ч`
            : `удельная мощность ${ctx.a.mixPower} Вт/м³ — около ${f((V * ctx.a.mixPower) / 1000, 1)} кВт`,
        qty: ctx.scale === "concrete" ? "2" : "1",
        supply: "supply",
        note: "Без перемешивания взвешенные осаждаются, а органика в осадке загнивает",
      });
      items.push({
        kind: "machine",
        name: "Насосная группа подачи на очистку",
        spec: `равномерная подача ${f(ctx.Qh, 1)} м³/ч, регулирование частотным преобразователем`,
        qty: pumpQty(1),
        supply: "supply",
        note: "Смысл усреднителя — постоянный расход на последующие ступени",
      });
      items.push({
        kind: "instrument",
        name: "Датчики уровня и pH",
        spec: "гидростатический уровнемер, сигнализация верхнего и нижнего уровня, pH-метр",
        qty: "комплект",
        supply: "supply",
      });
      break;
    }

    /* ---------------- жироуловитель ---------------- */
    case "grease": {
      items.push({
        kind: "structure",
        name: "Жироуловитель гравитационный",
        spec: `${f(ctx.Qh, 1)} м³/ч, расчёт по EN 1825; жиры ${f(ctx.fats)} → не более ${ctx.a.greaseTarget} мг/л перед биологией`,
        qty: "1",
        supply: ctx.scale === "concrete" ? "either" : "own",
      });
      if (ctx.scale !== "compact") {
        items.push({
          kind: "machine",
          name: "Скребковый механизм сбора жира",
          spec: "поверхностный скребок с приводом, отвод в жиросборник",
          qty: "1",
          supply: "supply",
          note: "На расходах свыше ~15 м³/ч ручной сбор жира нереалистичен",
        });
        items.push({
          kind: "structure",
          name: "Жиросборник",
          spec: "объём по недельному накоплению, с подогревом для откачки",
          qty: "1",
          supply: "either",
        });
      }
      break;
    }

    /* ---------------- нефтеуловитель ---------------- */
    case "oil": {
      items.push({
        kind: "structure",
        name: "Нефтеуловитель с тонкослойными модулями",
        spec: `NS ${f(ctx.Qls, 1)} л/с по EN 858, всплытие капли ${ctx.a.oilDroplet} мкм; нефтепродукты ${f(ctx.petro)} → 0,3 мг/л`,
        qty: "1",
        supply: "own",
      });
      items.push({
        kind: "machine",
        name: "Коалесцентный модуль",
        spec: "сменный блок, укрупнение эмульгированных капель",
        qty: "1",
        supply: "supply",
      });
      items.push({
        kind: "machine",
        name: "Сорбционный фильтр доочистки",
        spec: "загрузка сорбентом, доведение нефтепродуктов до 0,05–0,3 мг/л",
        qty: "1",
        supply: "either",
        note: "Требуется при сбросе в водоём; расход сорбента — по фактической нагрузке",
      });
      items.push({
        kind: "instrument",
        name: "Сигнализатор уровня нефтепродукта",
        spec: "датчик толщины слоя, вывод сигнала на диспетчеризацию",
        qty: "1",
        supply: "supply",
      });
      break;
    }

    /* ---------------- нейтрализация ---------------- */
    case "neutral": {
      items.push({
        kind: "structure",
        name: "Камера нейтрализации с мешалкой",
        spec: `время пребывания 10–20 мин, объём ${f(Math.max(1, ctx.Qh * 0.25), 1)} м³`,
        qty: "1",
        supply: "own",
      });
      items.push({
        kind: "machine",
        name: "Станция дозирования кислоты и щёлочи",
        spec: "два контура: серная кислота и NaOH (или известковое молоко), баки с обваловкой",
        qty: `${pumpQty(1)} на каждый реагент`,
        supply: "supply",
      });
      items.push({
        kind: "instrument",
        name: "pH-метры промышленные",
        spec: "на входе и выходе камеры, регулирование дозы по обратной связи",
        qty: "2",
        supply: "supply",
      });
      items.push({
        kind: "structure",
        name: "Склад реагентов с поддонами и аварийным душем",
        spec: "запас не менее 15 суток, вентиляция, поддон на полный объём наибольшей ёмкости",
        qty: "1",
        supply: "either",
        note: "Требование промышленной безопасности при работе с кислотами и щелочами",
      });
      break;
    }

    /* ---------------- реагентная обработка ---------------- */
    case "physchem": {
      items.push({
        kind: "structure",
        name: "Камера быстрого смешения",
        spec: `время 1–2 мин, градиент скорости G ≈ 500–700 с⁻¹, объём ${f(Math.max(0.5, ctx.Qh / 40), 1)} м³`,
        qty: "1",
        supply: "own",
      });
      items.push({
        kind: "structure",
        name: "Камера хлопьеобразования",
        spec: `время 15–25 мин, G ≈ 30–70 с⁻¹, объём ${f(Math.max(1, ctx.Qh * 0.35), 1)} м³, тихоходная мешалка`,
        qty: "1",
        supply: "own",
      });
      items.push({
        kind: "machine",
        name: "Станция приготовления и дозирования коагулянта",
        spec: `доза ${ctx.a.coagDose} г/м³ (уточняется пробным коагулированием) — ${f((ctx.Q * ctx.a.coagDose) / 1000, 1)} кг/сут`,
        qty: pumpQty(1),
        supply: "supply",
      });
      items.push({
        kind: "machine",
        name: "Автоматическая станция приготовления флокулянта",
        spec: `трёхкамерная, доза ${ctx.a.flocDose} г/м³ — ${f((ctx.Q * ctx.a.flocDose) / 1000, 2)} кг/сут по сухому продукту`,
        qty: "1",
        supply: "supply",
        note: "Полимер требует созревания 40–60 мин, ручное приготовление нестабильно",
      });
      items.push({
        kind: "structure",
        name: "Отстойник-осветлитель с тонкослойными модулями",
        spec: `гидравлическая нагрузка 1,5–2,5 м³/(м²·ч) → площадь ${f(ctx.Qh / 2, 1)} м²`,
        qty: "1",
        supply: ctx.scale === "concrete" ? "supply" : "own",
      });
      break;
    }

    /* ---------------- флотация ---------------- */
    case "daf": {
      const area = ctx.Qh / ctx.a.dafLoad;
      items.push({
        kind: "structure",
        name: "Флотатор напорный (DAF)",
        spec: `нагрузка ${ctx.a.dafLoad} м³/(м²·ч) → площадь ${f(area, 1)} м²; рециркуляция ${ctx.a.dafRecycle} %`,
        qty: "1",
        supply: "either",
      });
      items.push({
        kind: "machine",
        name: "Сатуратор с рециркуляционным насосом",
        spec: `давление насыщения 4–6 бар, рециркуляция ${f((ctx.Qh * ctx.a.dafRecycle) / 100, 1)} м³/ч`,
        qty: pumpQty(1),
        supply: "supply",
      });
      items.push({
        kind: "machine",
        name: "Компрессор воздуха для сатуратора",
        spec: "безмасляный, подача по расходу рециркуляции",
        qty: "2 (1 раб. + 1 рез.)",
        supply: "supply",
      });
      items.push({
        kind: "machine",
        name: "Скребковый механизм флотошлама",
        spec: "поверхностный и донный скребки, отвод шлама в сборник",
        qty: "1",
        supply: "supply",
      });
      items.push({
        kind: "structure",
        name: "Сборник флотошлама",
        spec: "объём на 2–3 суток, подача на обезвоживание",
        qty: "1",
        supply: "own",
      });
      break;
    }

    /* ---------------- биологическая очистка ---------------- */
    case "bio": {
      const V = ctx.vBio ?? 0;
      const air = ctx.air ?? 0;
      const deNitro = ctx.tn > ctx.a.denitroTn;

      if (ctx.scale === "compact") {
        items.push({
          kind: "structure",
          name: "Блочная установка биологической очистки (MBBR/SBR)",
          spec: `расчётный объём ${f(V)} м³, нагрузка ${ctx.a.bodVolLoad} кг БПК₅/(м³·сут); полная заводская готовность`,
          qty: "1",
          supply: "own",
        });
      } else {
        items.push({
          kind: "structure",
          name: `Аэротенк${deNitro ? " с зоной денитрификации" : ""}`,
          spec:
            `рабочий объём ${f(V)} м³` +
            (deNitro ? `, из них аноксидная зона ${f((V * ctx.a.denitroShare) / 100)} м³ (${ctx.a.denitroShare} %)` : "") +
            `; ${tr(SCALE_LABEL[ctx.scale], ctx.lang)}`,
          qty: ctx.scale === "concrete" ? "2 коридора (для вывода в ремонт)" : "1",
          supply: ctx.scale === "concrete" ? "supply" : "own",
        });
        items.push({
          kind: "machine",
          name: "Загрузка MBBR или мембранный модуль MBR",
          spec:
            "MBBR: степень заполнения 30–50 % объёма аэробной зоны; " +
            "MBR: удельный поток 8–12 л/(м²·ч) — выбор по требуемому качеству и площади",
          qty: "комплект",
          supply: "supply",
          note: "MBBR устойчив к перегрузкам, MBR даёт воду под доочистку и оборот без отстойника",
        });
      }

      items.push({
        kind: "machine",
        name: "Аэрационная система мелкопузырчатая",
        spec: `мембранные диспергаторы (дисковые или трубчатые), потребность воздуха ${f(air)} м³/ч`,
        qty: "комплект по площади дна",
        supply: "supply",
      });
      items.push({
        kind: "machine",
        name: ctx.scale === "concrete" ? "Воздуходувки (турбокомпрессоры)" : "Воздуходувки роторные или винтовые",
        spec: `подача ${f(air)} м³/ч, напор 45–60 кПа; регулирование частотой по датчику кислорода`,
        qty: pumpQty(ctx.scale === "concrete" ? 2 : 1),
        supply: "supply",
        note: "Резерв обязателен: остановка аэрации на 2–3 часа губит активный ил",
      });
      if (deNitro) {
        items.push({
          kind: "machine",
          name: "Мешалки аноксидной зоны и насосы рециркуляции нитратной смеси",
          spec: "рециркуляция 200–400 % от расчётного расхода; мешалки погружные тихоходные",
          qty: pumpQty(1),
          supply: "supply",
        });
      }
      items.push({
        kind: "machine",
        name: "Насосы возвратного активного ила",
        spec: `рециркуляция ила ${ctx.a.sludgeReturn} % — ${f((ctx.Qh * ctx.a.sludgeReturn) / 100, 1)} м³/ч`,
        qty: pumpQty(1),
        supply: "supply",
      });
      items.push({
        kind: "instrument",
        name: "Контроль процесса",
        spec: "датчики растворённого кислорода, дозы ила (MLSS), температуры" + (deNitro ? ", нитратов и ОВП" : ""),
        qty: "комплект",
        supply: "supply",
      });
      if (ctx.bod > 0 && ctx.tn > 0 && ctx.bod / Math.max(ctx.tn, 1) < ctx.a.bodTnRatio) {
        items.push({
          kind: "machine",
          name: "Станция дозирования органического субстрата",
          spec: `соотношение БПК : N = ${(ctx.bod / Math.max(ctx.tn, 1)).toFixed(1)} : 1 — для денитрификации нужно не менее ${ctx.a.bodTnRatio} : 1`,
          qty: pumpQty(1),
          supply: "supply",
          note: "Без внешнего источника углерода (ацетат, меласса) азот до норматива не снять",
        });
      }
      break;
    }

    /* ---------------- вторичное отстаивание ---------------- */
    case "clarify": {
      if (ctx.scale === "compact") {
        items.push({
          kind: "structure",
          name: "Вторичный отстойник с тонкослойными модулями",
          spec: `нагрузка ${ctx.a.clarifyLoad} м³/(м²·ч) → площадь зеркала ${f(ctx.Qh / ctx.a.clarifyLoad, 1)} м²; в составе блока`,
          qty: "1",
          supply: "own",
        });
      } else {
        items.push({
          kind: "structure",
          name: ctx.scale === "concrete" ? "Вторичный отстойник радиальный" : "Вторичный отстойник вертикальный",
          spec: `нагрузка ${ctx.a.clarifyLoad} м³/(м²·ч) → площадь ${f(ctx.Qh / ctx.a.clarifyLoad, 1)} м²; иловый приямок`,
          qty: "2 (для вывода в ремонт)",
          supply: ctx.scale === "concrete" ? "supply" : "own",
        });
        items.push({
          kind: "machine",
          name: ctx.scale === "concrete" ? "Илосос с приводом" : "Скребковый механизм",
          spec: "сбор ила с днища, удаление плавающих веществ с поверхности",
          qty: "по числу отстойников",
          supply: "supply",
        });
      }
      items.push({
        kind: "machine",
        name: "Насосы избыточного ила",
        spec: `отвод прироста ила на уплотнение, ${f(Math.max(0.5, (ctx.dryKg ?? ctx.bodLoad) / (10 * ctx.a.sludgeDs)), 1)} м³/сут`,
        qty: pumpQty(1),
        supply: "supply",
      });
      break;
    }

    /* ---------------- доочистка ---------------- */
    case "post": {
      const reuse = ctx.dischargeId === "reuse";
      items.push({
        kind: "machine",
        name: ctx.scale === "compact" ? "Фильтр доочистки напорный" : "Фильтры скорые двухслойные",
        spec: `скорость фильтрования ${ctx.a.filterRate} м/ч → площадь ${f(ctx.Qh / ctx.a.filterRate, 1)} м²; загрузка кварц + антрацит`,
        qty: ctx.scale === "compact" ? "1" : "2 (поочерёдная промывка)",
        supply: "either",
      });
      items.push({
        kind: "machine",
        name: "Система промывки фильтров",
        spec: "насос промывной воды, воздуходувка водовоздушной промывки, бак промывной воды",
        qty: "комплект",
        supply: "supply",
        note: `Промывные воды возвращаются в усреднитель — это ${ctx.a.backwashShare} % расхода, учтите в балансе`,
      });
      if (ctx.cod > 500 || ["textile-dye", "leather", "chemical", "printing"].includes(ctx.industryId)) {
        items.push({
          kind: "machine",
          name: "Сорбционный фильтр с активированным углём",
          spec: "снятие остаточной цветности и трудноокисляемой органики (ХПК)",
          qty: "1",
          supply: "supply",
          note: "Расход угля определяется опытной фильтрацией; предусмотреть регенерацию или замену",
        });
      }
      if (reuse) {
        items.push({
          kind: "machine",
          name: "Ультрафильтрация и обратный осмос",
          spec: "глубокое обессоливание для возврата в техпроцесс; концентрат 15–25 % расхода",
          qty: "комплект",
          supply: "supply",
          note: "Концентрат RO — отдельная задача: накопитель и вывоз либо выпаривание",
        });
      }
      break;
    }

    /* ---------------- обеззараживание ---------------- */
    case "disinfect": {
      const uv = ctx.dischargeId === "water" || ctx.dischargeId === "reuse" || ctx.scale === "concrete";
      if (uv) {
        items.push({
          kind: "machine",
          name: "Ультрафиолетовая установка обеззараживания",
          spec: `доза не менее ${ctx.a.uvDose} мДж/см² при пропускной способности ${f(ctx.Qh, 1)} м³/ч; лоточное или напорное исполнение`,
          qty: "1 (с резервным блоком ламп)",
          supply: "supply",
          note: "Без реагентов и без хлорорганики; требует прозрачности воды и регулярной чистки кварцевых чехлов",
        });
      }
      items.push({
        kind: "machine",
        name: "Установка получения гипохлорита натрия (электролизная)",
        spec: `доза активного хлора ${ctx.industryId === "hospital" ? ctx.a.chlorDoseHospital : ctx.a.chlorDose} г/м³ → ${f((ctx.Q * (ctx.industryId === "hospital" ? ctx.a.chlorDoseHospital : ctx.a.chlorDose)) / ctx.hours, 1)} г/ч`,
        qty: "1",
        supply: "own",
        note: uv ? "Резервный способ обеззараживания к УФ и для промывок" : "Основное обеззараживание",
      });
      items.push({
        kind: "structure",
        name: "Контактный резервуар",
        spec: `время контакта не менее ${ctx.a.contactTime} мин → объём ${f((ctx.Qh * ctx.a.contactTime) / 60, 1)} м³`,
        qty: "1",
        supply: "own",
        note: "Обязателен при хлорировании; при УФ не требуется",
      });
      break;
    }

    /* ---------------- обработка осадка ---------------- */
    case "sludge": {
      const dry = ctx.dryKg ?? 0;
      const vol = dry / (10 * ctx.a.sludgeDs);
      items.push({
        kind: "structure",
        name: "Илоуплотнитель гравитационный",
        spec: `время уплотнения 8–12 ч, поступление ${f(vol, 1)} м³/сут при ${ctx.a.sludgeDs} % СВ, на выходе 4–5 % СВ`,
        qty: "1",
        supply: ctx.scale === "concrete" ? "supply" : "own",
      });
      if (ctx.scale === "concrete" && ctx.Q > ctx.a.digesterFrom) {
        items.push({
          kind: "structure",
          name: "Метантенк или аэробный стабилизатор",
          spec: `стабилизация ${f(dry, 1)} кг СВ/сут; при метановом сбраживании — утилизация биогаза`,
          qty: "1",
          supply: "supply",
        });
      } else {
        items.push({
          kind: "structure",
          name: "Аэробный стабилизатор осадка",
          spec: `время стабилизации 7–10 сут, аэрация от общей воздуходувной станции`,
          qty: "1",
          supply: "own",
          note: "Без стабилизации осадок загнивает и не принимается на полигон",
        });
      }
      items.push({
        kind: "machine",
        name:
          dry < 100
            ? "Шнековый дегидратор (мультидисковый)"
            : dry < 500
            ? "Декантерная центрифуга"
            : "Камерный или ленточный фильтр-пресс",
        spec: `производительность по сухому веществу ${f(dry, 1)} кг/сут, кек ${ctx.a.cakeDs} % СВ`,
        qty: "1",
        supply: "supply",
        note: "Обезвоживание сокращает объём вывоза в 8–10 раз и окупается на транспорте",
      });
      items.push({
        kind: "machine",
        name: "Станция приготовления флокулянта для обезвоживания",
        spec: `доза ${ctx.a.sludgeFlocDose} кг на тонну сухого вещества — ${f((dry * ctx.a.sludgeFlocDose) / 1000, 2)} кг/сут`,
        qty: "1",
        supply: "supply",
      });
      items.push({
        kind: "machine",
        name: "Насос подачи осадка",
        spec: "винтовой (эксцентриково-шнековый), работа на густой среде",
        qty: pumpQty(1),
        supply: "supply",
      });
      items.push({
        kind: "structure",
        name: "Площадка (контейнер) обезвоженного осадка",
        spec: `накопление ${f((dry * 30) / (10 * ctx.a.cakeDs), 1)} м³/мес кека, навес, отвод фильтрата в голову сооружений`,
        qty: "1",
        supply: "either",
      });
      break;
    }
  }

  return items;
}
