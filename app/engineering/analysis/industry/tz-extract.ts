/* ==================================================================
 * РАЗБОР ТЕХНИЧЕСКОГО ЗАДАНИЯ И ТЕХНИЧЕСКИХ УСЛОВИЙ
 *
 * Проектировщик прикладывает ТЗ заказчика или ТУ водоканала (PDF,
 * скан, фотография), модель вытаскивает из документа исходные данные,
 * а страница подставляет их в анкету и спрашивает только то, чего в
 * документе не оказалось.
 *
 * Главное правило разбора: модель не считает и не додумывает. Она
 * вправе вернуть только то, что буквально написано в документе, и
 * обязана к каждому числу приложить цитату. Всё остальное — null.
 * Поэтому у каждого поля есть источник и цитата: проектировщик видит,
 * откуда взялась цифра, и может её оспорить, не открывая документ.
 *
 * Что документ НЕ задаёт — остаётся пустым и запрашивается анкетой,
 * а если проектировщик его тоже не знает, в дело идут справочные
 * значения отрасли, и это помечается отдельно (см. FieldSource).
 * ================================================================== */

/** откуда взялось значение поля анкеты */
export type FieldSource =
  /** буквально написано в приложенном документе */
  | "document"
  /** ввёл проектировщик */
  | "user"
  /** принято по справочнику отрасли / нормативу */
  | "reference";

export type Extracted<T> = {
  value: T | null;
  /** дословная цитата из документа — основание значения */
  quote?: string;
  /** номер страницы документа, если модель его определила */
  page?: number;
};

/** Концентрации, мг/л (pH — безразмерный). Ключи те же, что в анкете. */
export type ConcentrationSet = Partial<
  Record<"cod" | "bod" | "ss" | "fats" | "petro" | "tn" | "tp" | "surf" | "ph", Extracted<number>>
>;

export type TzExtract = {
  /** тип приложенного документа, как его определила модель */
  docKind: "tz" | "tu" | "lab" | "mixed" | "unknown";
  object: Extracted<string>;
  customer: Extracted<string>;
  /** что за производство — своими словами из документа */
  industryText: Extracted<string>;
  /** id отрасли справочника, если документ прямо на неё указывает */
  industryId: Extracted<string>;
  flowM3Day: Extracted<number>;
  flowMaxHourM3: Extracted<number>;
  hoursPerDay: Extracted<number>;
  people: Extracted<number>;
  /** состав стока на входе */
  inlet: ConcentrationSet;
  /** требования к качеству очищенной воды — то, ради чего и выдаются ТУ */
  targets: ConcentrationSet;
  /** куда сбрасывать: горколлектор, водоём, рельеф, полив, повторное использование */
  dischargePoint: Extracted<string>;
  /** требуемая технология, если документ её навязывает */
  technology: Extracted<string>;
  /** площадь выделенного участка, м² */
  siteAreaM2: Extracted<number>;
  siteWidthM: Extracted<number>;
  siteLengthM: Extracted<number>;
  /** отметка планировки площадки, м абс. */
  groundElevM: Extracted<number>;
  /** санитарно-защитная зона по документу, м */
  szzM: Extracted<number>;
  /** расстояние до жилой застройки, м */
  housingDistM: Extracted<number>;
  /** требования документа по пунктам — для таблицы «ответ на ТЗ» */
  requirements: { no: string; text: string }[];
  /** чего в документе не нашлось, хотя для расчёта нужно */
  missing: string[];
  /** предупреждения разбора: противоречия, нечитаемые места, странные единицы */
  warnings: string[];
};

export const EMPTY_EXTRACT: TzExtract = {
  docKind: "unknown",
  object: { value: null },
  customer: { value: null },
  industryText: { value: null },
  industryId: { value: null },
  flowM3Day: { value: null },
  flowMaxHourM3: { value: null },
  hoursPerDay: { value: null },
  people: { value: null },
  inlet: {},
  targets: {},
  dischargePoint: { value: null },
  technology: { value: null },
  siteAreaM2: { value: null },
  siteWidthM: { value: null },
  siteLengthM: { value: null },
  groundElevM: { value: null },
  szzM: { value: null },
  housingDistM: { value: null },
  requirements: [],
  missing: [],
  warnings: [],
};

/* ------------------------------------------------------------------
 * ПРОМПТ
 * ------------------------------------------------------------------ */

export const TZ_SYSTEM_PROMPT = `Ты — инженер-проектировщик очистных сооружений сточных вод. Тебе дают техническое задание заказчика, технические условия водоканала или протокол лабораторного анализа. Твоя единственная задача — извлечь из документа исходные данные и вернуть их строгим JSON.

ЖЕЛЕЗНЫЕ ПРАВИЛА

1. Возвращай ТОЛЬКО то, что буквально написано в документе. Ты не инженер-расчётчик в этой задаче, ты переписчик.
2. Ничего не вычисляй. Если написан расход в м³/час, а нужно в м³/сут — НЕ умножай, верни null и напиши об этом в warnings. Единственное допустимое преобразование — единицы одной и той же величины (г/м³ = мг/л; л/с и м³/ч в м³/сут НЕ пересчитывай).
3. Ничего не додумывай по аналогии. Если документ про молокозавод, но концентраций в нём нет — концентрации остаются null. Справочные значения подставит программа, не ты.
4. К каждому не-null числовому и текстовому значению обязана прилагаться quote — дословная выдержка из документа (до 200 символов), в которой это значение стоит. Значение без цитаты недопустимо: если процитировать нечего, значит, значения в документе нет, ставь null.
5. Если число в документе нечитаемо, зачёркнуто, исправлено от руки или ты не уверен в разряде (2000 или 20 000) — ставь null и опиши сомнение в warnings. Лучше спросить у проектировщика, чем ошибиться на порядок.
6. Если одна и та же величина в документе встречается дважды с разными значениями — ставь null и опиши противоречие в warnings, назвав оба значения и где они стоят.
7. Различай состав НА ВХОДЕ (что поступает на очистку) и ТРЕБОВАНИЯ НА ВЫХОДЕ (предельно допустимые концентрации сброса, ПДК, нормативы водоканала). Первое — в inlet, второе — в targets. Если из документа непонятно, что именно перед тобой, ставь значение в targets только когда рядом стоят слова вроде «не более», «предельно допустимая», «на сбросе», «после очистки», «ПДК»; иначе — null и запись в warnings.
8. Взвешенные вещества, БПК, ХПК могут быть подписаны по-разному: БПК5, БПКполн, БПК20, ХПК, COD, BOD, взвешенные вещества, ВВ, TSS. БПКполн и БПК20 — это НЕ БПК5: не подставляй их в bod, верни null и укажи в warnings, что в документе БПКполн.
9. Документ может быть на русском или узбекском языке (латиница или кириллица). Отвечай по-русски, но quote приводи на языке оригинала.
10. Если документ вообще не про сточные воды — верни docKind "unknown", всё остальное null, и объясни в warnings.

ЧТО ЗАПОЛНЯТЬ

docKind: "tz" — техническое задание на проектирование; "tu" — технические условия на подключение или сброс; "lab" — протокол лабораторного анализа; "mixed" — в документе есть и то и другое; "unknown" — не определяется.

requirements: пронумерованный перечень требований документа своими словами, кратко, по одному пункту на требование — потом по нему будет составляться ответ заказчику. Номер бери из документа, если он есть; если нумерации нет, нумеруй подряд. Включай только требования, влияющие на проект (качество очистки, технология, площадь, сроки, состав документации, режим работы), не переписывай юридическую часть.

missing: перечисли по-русски, каких данных для расчёта очистных в документе НЕ нашлось. Ориентируйся на этот минимум: расход сточных вод, часы работы, состав стока на входе, требования на сбросе, точка сброса, выделенная площадь. Пиши коротко: «расход сточных вод», «состав стока на входе».

warnings: всё, что вызвало сомнение, — противоречия, нечитаемые числа, странные единицы, БПКполн вместо БПК5, отсутствие подписи «до» или «после очистки».

ФОРМАТ ОТВЕТА

Только JSON, без markdown-обрамления, без пояснений до и после. Структура:

{
  "docKind": "tz",
  "object": {"value": "...", "quote": "...", "page": 1},
  "customer": {"value": null},
  "industryText": {"value": "...", "quote": "..."},
  "industryId": {"value": null},
  "flowM3Day": {"value": 250, "quote": "...", "page": 1},
  "flowMaxHourM3": {"value": null},
  "hoursPerDay": {"value": null},
  "people": {"value": null},
  "inlet": {"bod": {"value": 1200, "quote": "..."}, "ss": {"value": 800, "quote": "..."}},
  "targets": {"bod": {"value": 15, "quote": "..."}},
  "dischargePoint": {"value": "городской коллектор", "quote": "..."},
  "technology": {"value": null},
  "siteAreaM2": {"value": null},
  "siteWidthM": {"value": null},
  "siteLengthM": {"value": null},
  "groundElevM": {"value": null},
  "szzM": {"value": null},
  "housingDistM": {"value": null},
  "requirements": [{"no": "3.1", "text": "..."}],
  "missing": ["часы работы", "состав стока на входе"],
  "warnings": []
}

Поля с null пиши как {"value": null} без quote. Ключи inlet и targets указывай только для тех показателей, которые в документе есть; допустимые ключи: cod, bod, ss, fats, petro, tn, tp, surf, ph.

ПЕРЕЧЕНЬ ОТРАСЛЕЙ СПРАВОЧНИКА для поля industryId — ставь id только если документ прямо называет такое производство; при малейшем сомнении null.`;

/** список отраслей дописывается к промпту сервером — чтобы модель не выдумывала id */
export function industryListForPrompt(items: { id: string; name: string }[]): string {
  return items.map((i) => `${i.id} — ${i.name}`).join("\n");
}

/* ------------------------------------------------------------------
 * ПРОВЕРКА ОТВЕТА МОДЕЛИ
 *
 * Модель может вернуть что угодно, поэтому её ответ не принимается на
 * веру: чужие ключи выбрасываются, числа проверяются на конечность и
 * знак, значение без цитаты считается отсутствующим (правило 4).
 * ------------------------------------------------------------------ */

const CONC_KEYS = ["cod", "bod", "ss", "fats", "petro", "tn", "tp", "surf", "ph"] as const;
const DOC_KINDS = ["tz", "tu", "lab", "mixed", "unknown"] as const;

/** разумные пределы: значения вне их — почти наверняка ошибка распознавания */
const LIMITS: Record<string, [number, number]> = {
  ph: [0, 14],
  flowM3Day: [0.1, 1_000_000],
  flowMaxHourM3: [0.01, 100_000],
  hoursPerDay: [1, 24],
  people: [1, 10_000_000],
  siteAreaM2: [1, 10_000_000],
  siteWidthM: [1, 10_000],
  siteLengthM: [1, 10_000],
  groundElevM: [-500, 8000],
  szzM: [1, 5000],
  housingDistM: [1, 100_000],
  conc: [0, 1_000_000],
};

function str(v: unknown, max = 300): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim().slice(0, max);
  return s ? s : null;
}

function pickNum(raw: unknown, limits: [number, number], warnings: string[], label: string): Extracted<number> {
  if (!raw || typeof raw !== "object") return { value: null };
  const o = raw as Record<string, unknown>;
  const quote = str(o.quote, 200);
  const n = typeof o.value === "number" ? o.value : parseFloat(String(o.value ?? ""));
  if (!Number.isFinite(n)) return { value: null };
  /* правило 4: значение без цитаты не принимается */
  if (!quote) {
    warnings.push(`«${label}»: значение ${n} отброшено — модель не привела цитату из документа.`);
    return { value: null };
  }
  if (n < limits[0] || n > limits[1]) {
    warnings.push(`«${label}»: значение ${n} вне разумных пределов ${limits[0]}…${limits[1]} — отброшено, проверьте документ.`);
    return { value: null };
  }
  const page = typeof o.page === "number" && Number.isFinite(o.page) ? Math.round(o.page) : undefined;
  return { value: n, quote, page };
}

function pickStr(raw: unknown, warnings: string[], label: string): Extracted<string> {
  if (!raw || typeof raw !== "object") return { value: null };
  const o = raw as Record<string, unknown>;
  const value = str(o.value);
  if (!value) return { value: null };
  const quote = str(o.quote, 200);
  if (!quote) {
    warnings.push(`«${label}»: значение отброшено — модель не привела цитату из документа.`);
    return { value: null };
  }
  const page = typeof o.page === "number" && Number.isFinite(o.page) ? Math.round(o.page) : undefined;
  return { value, quote, page };
}

function pickConc(raw: unknown, warnings: string[], where: string): ConcentrationSet {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const out: ConcentrationSet = {};
  for (const key of CONC_KEYS) {
    if (!(key in o)) continue;
    const limits = key === "ph" ? LIMITS.ph : LIMITS.conc;
    const v = pickNum(o[key], limits, warnings, `${where} · ${key}`);
    if (v.value !== null) out[key] = v;
  }
  return out;
}

function pickList(raw: unknown, max: number): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => str(x, 300)).filter((x): x is string => !!x).slice(0, max);
}

/** Приведение ответа модели к TzExtract. Никогда не бросает исключение. */
export function parseExtract(raw: unknown, knownIndustryIds: string[]): TzExtract {
  const warnings: string[] = [];
  if (!raw || typeof raw !== "object") {
    return { ...EMPTY_EXTRACT, warnings: ["Модель вернула ответ, который не удалось разобрать. Заполните анкету вручную."] };
  }
  const o = raw as Record<string, unknown>;

  const docKindRaw = str(o.docKind, 20);
  const docKind = (DOC_KINDS as readonly string[]).includes(docKindRaw ?? "")
    ? (docKindRaw as TzExtract["docKind"])
    : "unknown";

  const industryId = pickStr(o.industryId, warnings, "отрасль");
  if (industryId.value && !knownIndustryIds.includes(industryId.value)) {
    warnings.push(`Отрасль «${industryId.value}» в справочнике не найдена — выберите её вручную.`);
    industryId.value = null;
  }

  const requirements = Array.isArray(o.requirements)
    ? o.requirements
        .map((r) => {
          if (!r || typeof r !== "object") return null;
          const rr = r as Record<string, unknown>;
          const text = str(rr.text, 600);
          if (!text) return null;
          return { no: str(rr.no, 12) ?? "", text };
        })
        .filter((r): r is { no: string; text: string } => !!r)
        .slice(0, 100)
    : [];

  const result: TzExtract = {
    docKind,
    object: pickStr(o.object, warnings, "объект"),
    customer: pickStr(o.customer, warnings, "заказчик"),
    industryText: pickStr(o.industryText, warnings, "производство"),
    industryId,
    flowM3Day: pickNum(o.flowM3Day, LIMITS.flowM3Day, warnings, "расход, м³/сут"),
    flowMaxHourM3: pickNum(o.flowMaxHourM3, LIMITS.flowMaxHourM3, warnings, "максимальный часовой расход"),
    hoursPerDay: pickNum(o.hoursPerDay, LIMITS.hoursPerDay, warnings, "часы работы"),
    people: pickNum(o.people, LIMITS.people, warnings, "число жителей"),
    inlet: pickConc(o.inlet, warnings, "вход"),
    targets: pickConc(o.targets, warnings, "требования на сбросе"),
    dischargePoint: pickStr(o.dischargePoint, warnings, "точка сброса"),
    technology: pickStr(o.technology, warnings, "технология"),
    siteAreaM2: pickNum(o.siteAreaM2, LIMITS.siteAreaM2, warnings, "площадь участка"),
    siteWidthM: pickNum(o.siteWidthM, LIMITS.siteWidthM, warnings, "ширина участка"),
    siteLengthM: pickNum(o.siteLengthM, LIMITS.siteLengthM, warnings, "длина участка"),
    groundElevM: pickNum(o.groundElevM, LIMITS.groundElevM, warnings, "отметка площадки"),
    szzM: pickNum(o.szzM, LIMITS.szzM, warnings, "санитарно-защитная зона"),
    housingDistM: pickNum(o.housingDistM, LIMITS.housingDistM, warnings, "расстояние до жилья"),
    requirements,
    missing: pickList(o.missing, 30),
    warnings: [...pickList(o.warnings, 30), ...warnings],
  };

  /* инженерные сверки: их модель не делает, они здесь */
  crossCheck(result);
  return result;
}

/**
 * Проверки, которые нельзя доверить модели: она читает документ, а
 * оценивать правдоподобие чисел должна программа.
 */
function crossCheck(e: TzExtract) {
  const bod = e.inlet.bod?.value;
  const cod = e.inlet.cod?.value;
  if (bod && cod && bod > cod) {
    e.warnings.push(`В документе БПК (${bod} мг/л) больше ХПК (${cod} мг/л) — так не бывает. Проверьте, не перепутаны ли строки.`);
  }
  const tBod = e.targets.bod?.value;
  if (bod && tBod && tBod >= bod) {
    e.warnings.push(`Требование на сбросе по БПК (${tBod} мг/л) не ниже входного значения (${bod} мг/л) — очистка не требуется? Проверьте, где «до», а где «после».`);
  }
  const q = e.flowM3Day.value;
  const qh = e.flowMaxHourM3.value;
  if (q && qh && qh * 24 < q) {
    e.warnings.push(`Максимальный часовой расход ${qh} м³/ч при суточном ${q} м³/сут даёт меньше суточного за 24 часа — величины не согласуются.`);
  }
  const area = e.siteAreaM2.value;
  const w = e.siteWidthM.value;
  const l = e.siteLengthM.value;
  if (area && w && l && Math.abs(w * l - area) / area > 0.15) {
    e.warnings.push(`Площадь участка ${area} м² не сходится с размерами ${w}×${l} м — уточните, что верно.`);
  }
}

/** Есть ли в разборе хоть что-то полезное — иначе показывать нечего. */
export function hasAnything(e: TzExtract): boolean {
  return (
    e.object.value !== null ||
    e.flowM3Day.value !== null ||
    e.people.value !== null ||
    Object.keys(e.inlet).length > 0 ||
    Object.keys(e.targets).length > 0 ||
    e.requirements.length > 0
  );
}

/** Сколько полей анкеты документ закрыл — для строки «заполнено N полей». */
export function filledCount(e: TzExtract): number {
  const singles = [
    e.object, e.industryText, e.industryId, e.flowM3Day, e.flowMaxHourM3,
    e.hoursPerDay, e.people, e.dischargePoint, e.technology,
    e.siteAreaM2, e.siteWidthM, e.siteLengthM, e.groundElevM, e.szzM, e.housingDistM,
  ];
  return singles.filter((x) => x.value !== null).length + Object.keys(e.inlet).length + Object.keys(e.targets).length;
}
