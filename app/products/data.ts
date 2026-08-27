/* --------------------------------------------------------------
 * АССОРТИМЕНТ SUVSANOAT — единый источник данных
 *
 * Добавили модель сюда — автоматически появилась страница,
 * запись в sitemap.xml и разметка для поисковых систем.
 * Числовые параметры рассчитаны, не взяты произвольно:
 * время пребывания, нагрузка на зеркало и объём накопления жира
 * проверены по EN 1825-2 и по скорости всплытия (Стокс).
 * -------------------------------------------------------------- */

import type { Language } from "../translations";

export type LineKey =
  | "grease-traps"
  | "oil-separators"
  | "sand-traps"
  | "tanks"
  | "pump-stations"
  | "bio-plants"
  | "chlorinators"
  | "dosing";

export type Model = {
  slug: string;
  code: string;
  line: LineKey;
  /** расчётный расход, м³/ч */
  q?: number;
  /** номинальный расход NS, л/с — для сепараторов по EN 858-2 */
  ns?: number;
  /** расход, м³/сут — для локальных очистных */
  qd?: number;
  /** номинальный объём, м³ — для резервуаров */
  vol?: number;
  /** эквивалентное число жителей */
  pe?: number;
  /** диаметр корпуса, мм — для цилиндрических изделий */
  diameter?: number;
  /** стандартная глубина, мм — для КНС */
  depth?: number;
  /** полезный объём между уровнями пуска и остановки, м³ */
  useful?: number;
  /** объём аэротенка, м³ */
  vaer?: number;
  /** расход воздуха, м³/ч */
  air?: number;
  /** мощность воздуходувки, кВт */
  motor?: number;
  /** количество колец жёсткости */
  rings?: number;
  /** критическое давление смятия оболочки, кПа */
  pcr?: number;
  /** количество насосов (рабочий + резервный) */
  pumps?: number;
  /** производительность по активному хлору, г/ч */
  cl?: number;
  /** расход соли, кг/сут */
  saltd?: number;
  /** выделение водорода, м³/ч */
  h2?: number;
  /** минимальный расход вентиляции, м³/ч */
  ventMin?: number;
  /** бак раствора, л */
  tankSol?: number;
  /** бак-сатуратор соли, л */
  tankSalt?: number;
  /** габариты корпуса, мм */
  length: number;
  width?: number;
  height?: number;
  /** объёмы, м³ */
  volumeGross: number;
  volumeWork?: number;
  /** время пребывания, мин */
  retention?: number;
  /** площадь зеркала, м² */
  area?: number;
  /** гидравлическая нагрузка, м/ч и мм/с */
  load?: number;
  loadMm?: number;
  /** объём накопления уловленного продукта (жир, нефтепродукт), м³ */
  fat?: number;
  /** объём приёмно-шламовой зоны, м³ */
  sludge?: number;
  /** толщина ламината, мм */
  laminate: number;
  /** масса сухая, кг */
  mass: number;
  /** присоединение, DN */
  dn: number;
  /** количество люков */
  hatches: number;
};

export const MODELS: Model[] = [
  {
    slug: "zhir-1",
    code: "ЖИР-1",
    line: "grease-traps",
    q: 1,
    length: 1500, width: 900, height: 1200,
    volumeGross: 1.62, volumeWork: 1.35, retention: 81,
    area: 1.35, load: 0.74, loadMm: 0.21,
    fat: 0.27, sludge: 0.41,
    laminate: 6, mass: 110, dn: 110, hatches: 2,
  },
  {
    slug: "zhir-2",
    code: "ЖИР-2",
    line: "grease-traps",
    q: 2,
    length: 2000, width: 1100, height: 1400,
    volumeGross: 3.08, volumeWork: 2.64, retention: 79,
    area: 2.2, load: 0.91, loadMm: 0.25,
    fat: 0.44, sludge: 0.79,
    laminate: 7, mass: 195, dn: 110, hatches: 2,
  },
  {
    slug: "zhir-3",
    code: "ЖИР-3",
    line: "grease-traps",
    q: 3,
    length: 2500, width: 1400, height: 1400,
    volumeGross: 4.9, volumeWork: 4.2, retention: 84,
    area: 3.5, load: 0.86, loadMm: 0.24,
    fat: 0.7, sludge: 1.26,
    laminate: 7, mass: 262, dn: 110, hatches: 3,
  },
  {
    slug: "zhir-5",
    code: "ЖИР-5",
    line: "grease-traps",
    q: 5,
    length: 3000, width: 1800, height: 1500,
    volumeGross: 8.1, volumeWork: 7.02, retention: 84,
    area: 5.4, load: 0.93, loadMm: 0.26,
    fat: 1.08, sludge: 2.11,
    laminate: 7, mass: 367, dn: 160, hatches: 3,
  },
  {
    slug: "zhir-8",
    code: "ЖИР-8",
    line: "grease-traps",
    q: 8,
    length: 4000, width: 2100, height: 1600,
    volumeGross: 13.44, volumeWork: 11.76, retention: 88,
    area: 8.4, load: 0.95, loadMm: 0.26,
    fat: 1.68, sludge: 3.53,
    laminate: 8, mass: 586, dn: 160, hatches: 4,
  },
  {
    slug: "zhir-12",
    code: "ЖИР-12",
    line: "grease-traps",
    q: 12,
    length: 5000, width: 2600, height: 1700,
    volumeGross: 22.1, volumeWork: 19.5, retention: 98,
    area: 13.0, load: 0.92, loadMm: 0.26,
    fat: 2.6, sludge: 5.85,
    laminate: 8, mass: 823, dn: 200, hatches: 4,
  },
  /* ---------------- НЕФТЕУЛОВИТЕЛИ ----------------
     Расчёт: скорость всплытия капли по Стоксу.
     d = 100 мкм, ро_н = 850 кг/м3, T = 15 C -> v = 2,58 м/ч.
     Эффективная площадь набирается коалесцентно-ламельным пакетом
     (шаг 20 мм, угол 60 гр -> 25 м2 на 1 м3 пакета), запас 1,5.
     Удельная нагрузка по всему ряду 1,72 м/ч.
     Приёмно-шламовая камера 200 л на 1 л/с, сбор нефтепродуктов 15 л на 1 л/с. */
  {
    slug: "nef-1-5",
    code: "НЕФ-1,5",
    line: "oil-separators",
    q: 5.4, ns: 1.5,
    length: 1250, width: 800, height: 1300,
    volumeGross: 1.3, volumeWork: 1.0, retention: 11,
    area: 3.1, load: 1.72, loadMm: 0.48,
    fat: 0.02, sludge: 0.3,
    laminate: 6, mass: 100, dn: 110, hatches: 1,
  },
  {
    slug: "nef-3",
    code: "НЕФ-3",
    line: "oil-separators",
    q: 10.8, ns: 3,
    length: 1350, width: 900, height: 1400,
    volumeGross: 1.7, volumeWork: 1.34, retention: 7,
    area: 6.3, load: 1.72, loadMm: 0.48,
    fat: 0.04, sludge: 0.6,
    laminate: 6, mass: 120, dn: 160, hatches: 1,
  },
  {
    slug: "nef-6",
    code: "НЕФ-6",
    line: "oil-separators",
    q: 21.6, ns: 6,
    length: 1650, width: 1100, height: 1550,
    volumeGross: 2.81, volumeWork: 2.27, retention: 6,
    area: 12.6, load: 1.72, loadMm: 0.48,
    fat: 0.09, sludge: 1.2,
    laminate: 7, mass: 195, dn: 200, hatches: 2,
  },
  {
    slug: "nef-10",
    code: "НЕФ-10",
    line: "oil-separators",
    q: 36, ns: 10,
    length: 2100, width: 1300, height: 1650,
    volumeGross: 4.5, volumeWork: 3.69, retention: 6,
    area: 20.9, load: 1.72, loadMm: 0.48,
    fat: 0.15, sludge: 2,
    laminate: 7, mass: 265, dn: 250, hatches: 2,
  },
  {
    slug: "nef-15",
    code: "НЕФ-15",
    line: "oil-separators",
    q: 54, ns: 15,
    length: 2550, width: 1500, height: 1750,
    volumeGross: 6.69, volumeWork: 5.55, retention: 6,
    area: 31.4, load: 1.72, loadMm: 0.48,
    fat: 0.22, sludge: 3,
    laminate: 8, mass: 390, dn: 315, hatches: 2,
  },
  {
    slug: "nef-20",
    code: "НЕФ-20",
    line: "oil-separators",
    q: 72, ns: 20,
    length: 2900, width: 1700, height: 1800,
    volumeGross: 8.87, volumeWork: 7.39, retention: 6,
    area: 41.8, load: 1.72, loadMm: 0.48,
    fat: 0.3, sludge: 4,
    laminate: 8, mass: 470, dn: 355, hatches: 3,
  },
  /* ---------------- ПЕСКОЛОВКИ ----------------
     Нагрузка на зеркало 25 м/ч — задерживается песок от 0,10 мм
     (скорость осаждения кварцевой частицы 0,10 мм: 6,9 мм/с).
     Шламовая зона 300 л на 1 л/с, глубина шламовой зоны не более 900 мм. */
  {
    slug: "pes-1-5",
    code: "ПЕС-1,5",
    line: "sand-traps",
    q: 5.4, ns: 1.5,
    length: 1050, width: 800, height: 1450,
    volumeGross: 1.22, volumeWork: 0.97, retention: 5.6,
    area: 0.84, load: 6.4, loadMm: 1.79,
    sludge: 0.45,
    laminate: 6, mass: 80, dn: 110, hatches: 1,
  },
  {
    slug: "pes-3",
    code: "ПЕС-3",
    line: "sand-traps",
    q: 10.8, ns: 3,
    length: 1300, width: 1000, height: 1600,
    volumeGross: 2.08, volumeWork: 1.69, retention: 4.3,
    area: 1.3, load: 8.3, loadMm: 2.31,
    sludge: 0.9,
    laminate: 6, mass: 115, dn: 160, hatches: 1,
  },
  {
    slug: "pes-6",
    code: "ПЕС-6",
    line: "sand-traps",
    q: 21.6, ns: 6,
    length: 1700, width: 1200, height: 1800,
    volumeGross: 3.67, volumeWork: 3.06, retention: 3.4,
    area: 2.04, load: 10.6, loadMm: 2.94,
    sludge: 1.8,
    laminate: 6, mass: 170, dn: 200, hatches: 2,
  },
  {
    slug: "pes-10",
    code: "ПЕС-10",
    line: "sand-traps",
    q: 36.0, ns: 10,
    length: 2400, width: 1400, height: 1800,
    volumeGross: 6.05, volumeWork: 5.04, retention: 3.4,
    area: 3.36, load: 10.7, loadMm: 2.98,
    sludge: 3.0,
    laminate: 7, mass: 270, dn: 250, hatches: 2,
  },
  {
    slug: "pes-15",
    code: "ПЕС-15",
    line: "sand-traps",
    q: 54.0, ns: 15,
    length: 3150, width: 1600, height: 1800,
    volumeGross: 9.07, volumeWork: 7.56, retention: 3.4,
    area: 5.04, load: 10.7, loadMm: 2.98,
    sludge: 4.5,
    laminate: 7, mass: 355, dn: 315, hatches: 2,
  },
  {
    slug: "pes-20",
    code: "ПЕС-20",
    line: "sand-traps",
    q: 72.0, ns: 20,
    length: 3750, width: 1800, height: 1800,
    volumeGross: 12.15, volumeWork: 10.12, retention: 3.4,
    area: 6.75, load: 10.7, loadMm: 2.96,
    sludge: 6.0,
    laminate: 8, mass: 500, dn: 355, hatches: 3,
  },
  /* ---------------- РЕЗЕРВУАРЫ И УСРЕДНИТЕЛИ ----------------
     Кольца жёсткости с шагом 800 мм. Критическое давление смятия
     оболочки 70-73 кПа против 10 кПа от столба грунтовой воды 1 м:
     запас 7. Без колец та же оболочка теряет устойчивость при 1,2-2,7 кПа. */
  {
    slug: "rez-1",
    code: "РЕЗ-1",
    line: "tanks",
    vol: 1,
    diameter: 1200, length: 1200,
    volumeGross: 1.36,
    rings: 2, pcr: 72,
    laminate: 6, mass: 85, dn: 110, hatches: 1,
  },
  {
    slug: "rez-2",
    code: "РЕЗ-2",
    line: "tanks",
    vol: 2,
    diameter: 1200, length: 1800,
    volumeGross: 2.04,
    rings: 2, pcr: 72,
    laminate: 6, mass: 105, dn: 110, hatches: 1,
  },
  {
    slug: "rez-3",
    code: "РЕЗ-3",
    line: "tanks",
    vol: 3,
    diameter: 1200, length: 2700,
    volumeGross: 3.05,
    rings: 3, pcr: 72,
    laminate: 6, mass: 150, dn: 110, hatches: 1,
  },
  {
    slug: "rez-5",
    code: "РЕЗ-5",
    line: "tanks",
    vol: 5,
    diameter: 1600, length: 2500,
    volumeGross: 5.03,
    rings: 3, pcr: 70,
    laminate: 7, mass: 230, dn: 160, hatches: 1,
  },
  {
    slug: "rez-8",
    code: "РЕЗ-8",
    line: "tanks",
    vol: 8,
    diameter: 1600, length: 4000,
    volumeGross: 8.04,
    rings: 4, pcr: 70,
    laminate: 7, mass: 335, dn: 160, hatches: 2,
  },
  {
    slug: "rez-10",
    code: "РЕЗ-10",
    line: "tanks",
    vol: 10,
    diameter: 2000, length: 3200,
    volumeGross: 10.05,
    rings: 3, pcr: 71,
    laminate: 8, mass: 415, dn: 160, hatches: 2,
  },
  {
    slug: "rez-15",
    code: "РЕЗ-15",
    line: "tanks",
    vol: 15,
    diameter: 2000, length: 4800,
    volumeGross: 15.08,
    rings: 5, pcr: 71,
    laminate: 8, mass: 580, dn: 200, hatches: 2,
  },
  {
    slug: "rez-20",
    code: "РЕЗ-20",
    line: "tanks",
    vol: 20,
    diameter: 2000, length: 6400,
    volumeGross: 20.11,
    rings: 7, pcr: 71,
    laminate: 8, mass: 745, dn: 200, hatches: 2,
  },
  {
    slug: "rez-30",
    code: "РЕЗ-30",
    line: "tanks",
    vol: 30,
    diameter: 2400, length: 6650,
    volumeGross: 30.08,
    rings: 8, pcr: 73,
    laminate: 9, mass: 1075, dn: 250, hatches: 3,
  },
  {
    slug: "rez-50",
    code: "РЕЗ-50",
    line: "tanks",
    vol: 50,
    diameter: 2400, length: 11100,
    volumeGross: 50.22,
    rings: 13, pcr: 73,
    laminate: 9, mass: 1695, dn: 250, hatches: 3,
  },
  /* ---------------- КНС ----------------
     Полезный объём между уровнями пуска и остановки V = Q*t/4,
     где t — минимальный цикл насоса: 10 мин до 7,5 кВт, 15 мин выше.
     Глубина 3000 мм — каталожная, на объекте определяется отметкой
     лотка подводящего коллектора. Насосы покупные. */
  {
    slug: "kns-5",
    code: "КНС-5",
    line: "pump-stations",
    q: 5,
    diameter: 1000, length: 3000, depth: 3000,
    volumeGross: 2.36, useful: 0.21,
    pumps: 2, rings: 3, pcr: 70,
    laminate: 6, mass: 130, dn: 110, hatches: 1,
  },
  {
    slug: "kns-10",
    code: "КНС-10",
    line: "pump-stations",
    q: 10,
    diameter: 1200, length: 3000, depth: 3000,
    volumeGross: 3.39, useful: 0.42,
    pumps: 2, rings: 3, pcr: 70,
    laminate: 6, mass: 155, dn: 160, hatches: 1,
  },
  {
    slug: "kns-25",
    code: "КНС-25",
    line: "pump-stations",
    q: 25,
    diameter: 1500, length: 3000, depth: 3000,
    volumeGross: 5.3, useful: 1.04,
    pumps: 2, rings: 3, pcr: 70,
    laminate: 7, mass: 230, dn: 200, hatches: 1,
  },
  {
    slug: "kns-50",
    code: "КНС-50",
    line: "pump-stations",
    q: 50,
    diameter: 1800, length: 3000, depth: 3000,
    volumeGross: 7.63, useful: 3.12,
    pumps: 2, rings: 3, pcr: 70,
    laminate: 8, mass: 325, dn: 250, hatches: 1,
  },
  {
    slug: "kns-75",
    code: "КНС-75",
    line: "pump-stations",
    q: 75,
    diameter: 2000, length: 3000, depth: 3000,
    volumeGross: 9.42, useful: 4.69,
    pumps: 2, rings: 3, pcr: 70,
    laminate: 8, mass: 365, dn: 315, hatches: 1,
  },
  {
    slug: "kns-100",
    code: "КНС-100",
    line: "pump-stations",
    q: 100,
    diameter: 2400, length: 3000, depth: 3000,
    volumeGross: 13.57, useful: 6.25,
    pumps: 2, rings: 3, pcr: 73,
    laminate: 9, mass: 505, dn: 355, hatches: 1,
  },
  /* ---------------- ЛОС BIO ----------------
     Исходные данные: БПК5 300 мг/л, N общий 50 мг/л (хозяйственно-бытовой
     сток, 200 л на жителя по КМК 2.04.03-19). SRT 15 сут, MLVSS 2,8 г/л,
     HRT аэротенка 13,5 ч. Кислород по DWA-A 131, пересчёт в стандартные
     условия alpha=0,6; SOTE 24% (мелкий пузырь). Запас по осадку 96 сут. */
  {
    slug: "bio-1",
    code: "БИО-1",
    line: "bio-plants",
    qd: 1, pe: 5,
    length: 1200, width: 1000, height: 1850,
    volumeGross: 2.22, volumeWork: 1.25, vaer: 0.56,
    retention: 810,
    sludge: 0.34, air: 1, motor: 0.25,
    laminate: 6, mass: 180, dn: 110, hatches: 2,
  },
  {
    slug: "bio-3",
    code: "БИО-3",
    line: "bio-plants",
    qd: 3, pe: 15,
    length: 2550, width: 1000, height: 1850,
    volumeGross: 4.72, volumeWork: 3.76, vaer: 1.69,
    retention: 810,
    sludge: 1.01, air: 3, motor: 0.25,
    laminate: 6, mass: 260, dn: 110, hatches: 2,
  },
  {
    slug: "bio-5",
    code: "БИО-5",
    line: "bio-plants",
    qd: 5, pe: 25,
    length: 2500, width: 1400, height: 2150,
    volumeGross: 7.52, volumeWork: 6.27, vaer: 2.81,
    retention: 810,
    sludge: 1.69, air: 4, motor: 0.25,
    laminate: 6, mass: 365, dn: 110, hatches: 2,
  },
  {
    slug: "bio-10",
    code: "БИО-10",
    line: "bio-plants",
    qd: 10, pe: 50,
    length: 5000, width: 1400, height: 2150,
    volumeGross: 15.05, volumeWork: 12.54, vaer: 5.62,
    retention: 810,
    sludge: 3.38, air: 8, motor: 0.25,
    laminate: 7, mass: 650, dn: 110, hatches: 2,
  },
  {
    slug: "bio-15",
    code: "БИО-15",
    line: "bio-plants",
    qd: 15, pe: 75,
    length: 5000, width: 1800, height: 2450,
    volumeGross: 22.05, volumeWork: 18.81, vaer: 8.44,
    retention: 810,
    sludge: 5.06, air: 13, motor: 0.37,
    laminate: 7, mass: 835, dn: 160, hatches: 3,
  },
  {
    slug: "bio-25",
    code: "БИО-25",
    line: "bio-plants",
    qd: 25, pe: 125,
    length: 8300, width: 1800, height: 2450,
    volumeGross: 36.6, volumeWork: 31.35, vaer: 14.06,
    retention: 810,
    sludge: 8.44, air: 21, motor: 0.55,
    laminate: 8, mass: 1360, dn: 160, hatches: 3,
  },
  /* ---------------- ХЛОРАТОРЫ (ЭЛЕКТРОЛИЗ NaOCl) ----------------
     Станция собственной сборки: рама, шкаф, баки раствора и соли,
     обвязка. Электролизная ячейка и выпрямитель — покупные узлы.
     Расчёт: соль 3,2 кг на 1 кг активного хлора, электроэнергия
     4,5 кВт·ч/кг, водород 0,315 м³ на 1 кг Cl. Вентиляция — по
     разбавлению H2 до 1 % об., но не менее 10-кратного обмена
     помещения. Бак раствора — на 8 часов работы при 7 г/л. */
  {
    slug: "elh-10",
    code: "ЭЛХ-10",
    line: "chlorinators",
    cl: 10, saltd: 0.8, motor: 0.05, h2: 0.003, ventMin: 1,
    tankSol: 60, tankSalt: 60,
    length: 900, width: 600, height: 1600,
    volumeGross: 0.86,
    laminate: 4, mass: 75, dn: 25, hatches: 0,
  },
  {
    slug: "elh-25",
    code: "ЭЛХ-25",
    line: "chlorinators",
    cl: 25, saltd: 1.9, motor: 0.11, h2: 0.008, ventMin: 1,
    tankSol: 60, tankSalt: 60,
    length: 900, width: 600, height: 1600,
    volumeGross: 0.86,
    laminate: 4, mass: 80, dn: 25, hatches: 0,
  },
  {
    slug: "elh-50",
    code: "ЭЛХ-50",
    line: "chlorinators",
    cl: 50, saltd: 3.8, motor: 0.23, h2: 0.016, ventMin: 2,
    tankSol: 100, tankSalt: 100,
    length: 1100, width: 650, height: 1700,
    volumeGross: 1.22,
    laminate: 4, mass: 95, dn: 25, hatches: 0,
  },
  {
    slug: "elh-100",
    code: "ЭЛХ-100",
    line: "chlorinators",
    cl: 100, saltd: 7.7, motor: 0.45, h2: 0.032, ventMin: 4,
    tankSol: 200, tankSalt: 100,
    length: 1200, width: 700, height: 1750,
    volumeGross: 1.47,
    laminate: 5, mass: 120, dn: 25, hatches: 0,
  },
  {
    slug: "elh-250",
    code: "ЭЛХ-250",
    line: "chlorinators",
    cl: 250, saltd: 19.2, motor: 1.15, h2: 0.079, ventMin: 8,
    tankSol: 400, tankSalt: 200,
    length: 1500, width: 800, height: 1850,
    volumeGross: 2.22,
    laminate: 5, mass: 180, dn: 25, hatches: 0,
  },
  {
    slug: "elh-500",
    code: "ЭЛХ-500",
    line: "chlorinators",
    cl: 500, saltd: 38.4, motor: 2.25, h2: 0.158, ventMin: 16,
    tankSol: 600, tankSalt: 300,
    length: 1700, width: 850, height: 1900,
    volumeGross: 2.75,
    laminate: 5, mass: 250, dn: 25, hatches: 0,
  },
  {
    slug: "elh-1000",
    code: "ЭЛХ-1000",
    line: "chlorinators",
    cl: 1000, saltd: 76.8, motor: 4.5, h2: 0.315, ventMin: 32,
    tankSol: 1200, tankSalt: 500,
    length: 2100, width: 950, height: 1950,
    volumeGross: 3.89,
    laminate: 6, mass: 380, dn: 25, hatches: 0,
  },
  /* ---------------- СТАНЦИИ ДОЗИРОВАНИЯ ----------------
     Рама, бак с мешалкой, обвязка и шкаф — собственной сборки;
     насосы-дозаторы — покупные, подбираются по расходу и давлению
     точки ввода. Типоразмер задаётся объёмом расходного бака. */
  {
    slug: "doz-100",
    code: "ДОЗ-100",
    line: "dosing",
    tankSol: 100, pumps: 2, motor: 0.18,
    length: 700, width: 600, height: 1400,
    volumeGross: 0.59,
    laminate: 4, mass: 60, dn: 25, hatches: 0,
  },
  {
    slug: "doz-200",
    code: "ДОЗ-200",
    line: "dosing",
    tankSol: 200, pumps: 2, motor: 0.18,
    length: 800, width: 700, height: 1500,
    volumeGross: 0.84,
    laminate: 4, mass: 75, dn: 25, hatches: 0,
  },
  {
    slug: "doz-500",
    code: "ДОЗ-500",
    line: "dosing",
    tankSol: 500, pumps: 2, motor: 0.37,
    length: 1100, width: 900, height: 1700,
    volumeGross: 1.68,
    laminate: 5, mass: 110, dn: 25, hatches: 0,
  },
  {
    slug: "doz-1000",
    code: "ДОЗ-1000",
    line: "dosing",
    tankSol: 1000, pumps: 2, motor: 0.55,
    length: 1400, width: 1100, height: 1900,
    volumeGross: 2.93,
    laminate: 5, mass: 160, dn: 25, hatches: 0,
  },
];

/**
 * Данные для серверных метаданных и разметки поисковых систем.
 * Живут отдельно от TEXT, потому что metadata собирается на сервере
 * и языкового контекста там нет — страница выдаётся на русском.
 */
export type LineSeo = {
  noun: string;
  category: string;
  unit: string;
  material: string;
  short: string;
};

export const LINE_SEO: Record<LineKey, LineSeo> = {
  "grease-traps": {
    noun: "Жироуловитель",
    category: "Жироуловители",
    unit: "м³/ч",
    material: "Стеклопластик",
    short: "жироуловитель",
  },
  "oil-separators": {
    noun: "Нефтеуловитель",
    category: "Нефтеуловители",
    unit: "л/с",
    material: "Стеклопластик",
    short: "нефтеуловитель",
  },
  "sand-traps": {
    noun: "Песколовка",
    category: "Песколовки",
    unit: "л/с",
    material: "Стеклопластик",
    short: "песколовка",
  },
  tanks: {
    noun: "Резервуар из стеклопластика",
    category: "Резервуары и усреднители",
    unit: "м³",
    material: "Стеклопластик",
    short: "резервуар",
  },
  "pump-stations": {
    noun: "Канализационная насосная станция",
    category: "КНС",
    unit: "м³/ч",
    material: "Стеклопластик",
    short: "КНС",
  },
  "bio-plants": {
    noun: "Локальные очистные сооружения",
    category: "Локальные очистные сооружения",
    unit: "м³/сут",
    material: "Стеклопластик",
    short: "ЛОС",
  },
  chlorinators: {
    noun: "Электролизная установка гипохлорита натрия",
    category: "Хлораторы",
    unit: "г/ч",
    material: "Рама и баки — полиэтилен, стеклопластик",
    short: "хлоратор",
  },
  dosing: {
    noun: "Станция дозирования реагентов",
    category: "Станции дозирования",
    unit: "л",
    material: "Рама и бак — полиэтилен, стеклопластик",
    short: "станция дозирования",
  },
};


/**
 * Какие строки показывать по каждой линейке и в каком порядке.
 * Список от языка не зависит, поэтому лежит здесь, а не в четырёх
 * переводах: подписи берутся из specLabels, значения — из модели.
 *
 * spec  — полный список на странице модели
 * table — колонки сводной таблицы в разделе ассортимента
 */
export const LINE_SPECS: Record<LineKey, { spec: SpecKey[]; table: SpecKey[] }> = {
  "grease-traps": {
    spec: ["q", "size", "volumeGross", "volumeWork", "retention", "area", "load",
      "fat", "sludge", "material", "laminate", "mass", "dn", "hatches",
      "vent", "power", "install"],
    table: ["q", "size", "volumeWork", "retention", "area", "dn", "mass"],
  },
  "oil-separators": {
    spec: ["ns", "q", "size", "volumeGross", "volumeWork", "retention", "area", "load",
      "fat", "sludge", "material", "laminate", "mass", "dn", "hatches",
      "vent", "power", "install"],
    table: ["ns", "q", "size", "volumeWork", "area", "sludge", "dn", "mass"],
  },
  "sand-traps": {
    spec: ["ns", "q", "size", "volumeGross", "volumeWork", "retention", "area", "load",
      "sludge", "material", "laminate", "mass", "dn", "hatches", "vent", "power", "install"],
    table: ["ns", "q", "size", "volumeWork", "area", "sludge", "dn", "mass"],
  },
  tanks: {
    spec: ["vol", "size", "volumeGross", "rings", "pcr", "material", "laminate",
      "mass", "dn", "hatches", "vent", "power", "install"],
    table: ["vol", "size", "rings", "pcr", "dn", "hatches", "mass"],
  },
  "pump-stations": {
    spec: ["q", "diameter", "depth", "volumeGross", "useful", "pumps",
      "rings", "pcr", "material", "laminate", "mass", "dn", "hatches", "vent", "install"],
    table: ["q", "diameter", "depth", "useful", "pumps", "dn", "mass"],
  },
  "bio-plants": {
    spec: ["qd", "pe", "size", "volumeGross", "volumeWork", "vaer", "retention",
      "sludge", "air", "motor", "material", "laminate", "mass", "dn", "hatches",
      "vent", "install"],
    table: ["qd", "pe", "size", "volumeWork", "vaer", "air", "motor", "mass"],
  },
  chlorinators: {
    spec: ["cl", "saltd", "motor", "h2", "ventMin", "tankSol", "tankSalt",
      "size", "mass", "dn", "material", "vent", "power", "install"],
    table: ["cl", "saltd", "motor", "h2", "tankSol", "size", "mass"],
  },
  dosing: {
    spec: ["tankSol", "pumps", "motor", "size", "mass", "dn",
      "material", "vent", "power", "install"],
    table: ["tankSol", "pumps", "motor", "size", "mass"],
  },
};

/**
 * Значение характеристики. Возвращает null для строк, текст которых
 * задаётся линейкой (материал, вентиляция, питание, монтаж) — их
 * подставляет компонент страницы.
 */
export function specValue(
  model: Model,
  key: SpecKey,
  dec: (value: number) => string,
  language: Language
): string | null {
  const flow = language === "zh" ? "m³/h" : "м³/ч";
  const perSec = language === "zh" ? "l/s" : "л/с";
  const perDay = language === "zh" ? "m³/d" : "м³/сут";
  const minutes = language === "zh" ? "min" : "мин";

  switch (key) {
    case "q":
      return model.q === undefined ? null : `${dec(model.q)} ${flow}`;
    case "ns":
      return model.ns === undefined ? null : `${dec(model.ns)} ${perSec}`;
    case "qd":
      return model.qd === undefined ? null : `${dec(model.qd)} ${perDay}`;
    case "vol":
      return model.vol === undefined ? null : `${dec(model.vol)} м³`;
    case "pe":
      return model.pe === undefined ? null : `${model.pe}`;
    case "size":
      return model.diameter !== undefined
        ? `⌀${model.diameter} × ${model.length} мм`
        : `${model.length} × ${model.width} × ${model.height} мм`;
    case "diameter":
      return model.diameter === undefined ? null : `${model.diameter} мм`;
    case "depth":
      return model.depth === undefined ? null : `${model.depth} мм`;
    case "volumeGross":
      return `${dec(model.volumeGross)} м³`;
    case "volumeWork":
      return model.volumeWork === undefined ? null : `${dec(model.volumeWork)} м³`;
    case "useful":
      return model.useful === undefined ? null : `${dec(model.useful)} м³`;
    case "vaer":
      return model.vaer === undefined ? null : `${dec(model.vaer)} м³`;
    case "retention":
      return model.retention === undefined ? null : `${model.retention} ${minutes}`;
    case "area":
      return model.area === undefined ? null : `${dec(model.area)} м²`;
    case "load":
      return model.load === undefined
        ? null
        : `${dec(model.load)} м/ч (${dec(model.loadMm ?? 0)} мм/с)`;
    case "fat":
      return model.fat === undefined ? null : `${dec(model.fat)} м³`;
    case "sludge":
      return model.sludge === undefined ? null : `${dec(model.sludge)} м³`;
    case "air":
      return model.air === undefined ? null : `${model.air} ${flow}`;
    case "motor":
      return model.motor === undefined ? null : `${dec(model.motor)} кВт`;
    case "rings":
      return model.rings === undefined ? null : `${model.rings}`;
    case "pcr":
      return model.pcr === undefined ? null : `${model.pcr} кПа`;
    case "pumps":
      return model.pumps === undefined ? null : `${model.pumps}`;
    case "cl":
      return model.cl === undefined
        ? null
        : `${model.cl} ${language === "zh" ? "g/h" : "г/ч"}`;
    case "saltd":
      return model.saltd === undefined
        ? null
        : `${dec(model.saltd)} ${language === "zh" ? "kg/d" : "кг/сут"}`;
    case "h2":
      return model.h2 === undefined ? null : `${dec(model.h2)} м³/ч`;
    case "ventMin":
      return model.ventMin === undefined ? null : `${model.ventMin} м³/ч`;
    case "tankSol":
      return model.tankSol === undefined
        ? null
        : `${model.tankSol} ${language === "zh" ? "L" : "л"}`;
    case "tankSalt":
      return model.tankSalt === undefined
        ? null
        : `${model.tankSalt} ${language === "zh" ? "L" : "л"}`;
    case "laminate":
      return `${model.laminate} мм`;
    case "mass":
      return `${model.mass} кг`;
    case "dn":
      return `DN${model.dn}`;
    case "hatches":
      return `${model.hatches}`;
    default:
      return null;
  }
}

/** Иконка линейки (имя из app/components/EquipIcon.tsx) */
export const LINE_ICON: Record<LineKey, string> = {
  "grease-traps": "grit",
  "oil-separators": "lamella",
  "sand-traps": "grid",
  tanks: "tank",
  "pump-stations": "kns",
  "bio-plants": "bio",
  chlorinators: "chem",
  dosing: "dosing",
};

/** Главный размерный признак модели для заголовков (рус.) */
export const modelSize = (model: Model) => {
  const dec = (value: number) => String(value).replace(".", ",");

  if (model.cl !== undefined) return `${model.cl} г/ч`;
  if (model.line === "dosing" && model.tankSol !== undefined)
    return `${model.tankSol} л`;
  if (model.ns !== undefined) return `${dec(model.ns)} л/с`;
  if (model.qd !== undefined) return `${dec(model.qd)} м³/сут`;
  if (model.vol !== undefined) return `${dec(model.vol)} м³`;
  if (model.q !== undefined) return `${dec(model.q)} м³/ч`;

  return `${dec(model.volumeGross)} м³`;
};

export const findModel = (slug: string) =>
  MODELS.find((model) => model.slug === slug);

export const lineModels = (line: LineKey) =>
  MODELS.filter((model) => model.line === line);

/* --------------------------------------------------------------
 * ТЕКСТЫ
 * Числа лежат выше и от языка не зависят — переводить нужно
 * только подписи и описания, поэтому объём перевода небольшой.
 * -------------------------------------------------------------- */

export type SpecLabels = {
  q: string;
  ns: string;
  qd: string;
  vol: string;
  pe: string;
  diameter: string;
  depth: string;
  useful: string;
  vaer: string;
  air: string;
  motor: string;
  rings: string;
  pcr: string;
  pumps: string;
  cl: string;
  saltd: string;
  h2: string;
  ventMin: string;
  tankSol: string;
  tankSalt: string;
  size: string;
  volumeGross: string;
  volumeWork: string;
  retention: string;
  area: string;
  load: string;
  fat: string;
  sludge: string;
  material: string;
  laminate: string;
  mass: string;
  dn: string;
  hatches: string;
  vent: string;
  power: string;
  install: string;
};

export type SpecKey = keyof SpecLabels;

export type LineText = {
  name: string;
  /** подписи, которые отличаются от общих для этой линейки */
  labels?: Partial<SpecLabels>;
  tagline: string;
  intro: string[];
  forWhom: { title: string; text: string }[];
  includes: string[];
  notIncluded: string[];
  limits: { title: string; text: string }[];
  useTitle: string;
  limitsTitle: string;
  includesTitle: string;
  notIncludedTitle: string;
  howToChoose: string;
  materialValue: string;
  ventValue: string;
  powerValue: string;
  installValue: string;
  modelWord: string;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  priceLabel: string;
  priceText: string;
  tableTitle: string;
  specsTitle: string;
  allModels: string;
  backToLine: string;
};

export type ProductsText = {
  label: string;
  navLabel: string;
  teaserTitle: string;
  teaserText: string;
  teaserButton: string;
  title: string;
  intro: string;
  specLabels: SpecLabels;
  lines: Record<LineKey, LineText>;
};

export const TEXT: Record<Language, ProductsText> = {
  ru: {
    label: "АССОРТИМЕНТ",
    navLabel: "Ассортимент",
    teaserTitle: "Модели\nи параметры.",
    teaserText: "Типоразмерные ряды с полными техническими характеристиками: габариты, рабочий объём, время пребывания, присоединительные размеры и масса. По каждой модели — отдельная страница.",
    teaserButton: "СМОТРЕТЬ АССОРТИМЕНТ",
    title: "Оборудование\nсобственного производства.",
    intro:
      "Типоразмерные ряды рассчитаны по нормам и проверены по гидравлике. Каждая модель — не «примерно такой размер», а результат расчёта: время пребывания, нагрузка на зеркало и объём накопления проверены для всего ряда.",
    specLabels: {
      q: "Расчётный расход",
      ns: "Номинальный расход NS",
      qd: "Расчётный расход",
      vol: "Номинальный объём",
      pe: "Эквивалентное число жителей",
      diameter: "Диаметр корпуса",
      depth: "Глубина корпуса",
      useful: "Полезный объём между уровнями",
      vaer: "Объём аэротенка",
      air: "Расход воздуха",
      motor: "Мощность воздуходувки",
      rings: "Кольца жёсткости",
      pcr: "Критическое давление смятия",
      pumps: "Количество насосов",
      cl: "Активный хлор",
      saltd: "Расход соли",
      h2: "Выделение водорода",
      ventMin: "Вентиляция, не менее",
      tankSol: "Бак раствора",
      tankSalt: "Бак-сатуратор соли",
      size: "Габариты (Д × Ш × В)",
      volumeGross: "Геометрический объём",
      volumeWork: "Рабочий объём",
      retention: "Время пребывания",
      area: "Площадь зеркала",
      load: "Гидравлическая нагрузка",
      fat: "Объём накопления жира",
      sludge: "Приёмно-шламовая зона",
      material: "Материал корпуса",
      laminate: "Толщина ламината",
      mass: "Масса сухая",
      dn: "Присоединение вход / выход",
      hatches: "Количество люков",
      vent: "Вентиляция",
      power: "Потребление электроэнергии",
      install: "Способ установки",
    },
    lines: {
      "grease-traps": {
        name: "Жироуловители",
        tagline:
          "Отделение жиров и пищевых отходов из стоков кухни до сброса в коммунальную канализацию",
        intro: [
          "Сточные воды кухни содержат жиры животного и растительного происхождения, пищевые отходы и моющие средства. При остывании жир застывает на стенках трубопроводов и в городской сети, что приводит к засорам, авариям и претензиям со стороны водоканала.",
          "Жироуловитель ставится на выпуске кухни до присоединения к коммунальной канализации. Работает самотёком: ни насосов, ни электропитания, ни автоматики.",
          "Главная сложность на кухне ресторана — не грязь, а температура. Стоки фритюрниц, пароконвектоматов и посудомоечных машин имеют 45–60 °C, при которой жир остаётся жидким и не всплывает. Он поднимается только после остывания примерно до 30 °C. Поэтому весь ряд рассчитан на время пребывания не менее 79 минут — этого хватает и на остывание, и на разделение.",
        ],
        forWhom: [
          { title: "Рестораны и кафе", text: "Кухня полного цикла с фритюром и посудомоечной машиной." },
          { title: "Фудкорты и столовые", text: "Несколько кухонь на один выпуск, повышенный залповый сброс." },
          { title: "Пекарни и кондитерские", text: "Стоки с высоким содержанием растительных жиров." },
          { title: "Мясные и рыбные цеха", text: "Животные жиры, высокая доля взвешенных веществ." },
          { title: "Гостиницы", text: "Ресторан при гостинице, банкетные залы." },
          { title: "Пищевые производства", text: "Технологические стоки цехов переработки." },
        ],
        includes: [
          "Корпус из стеклопластика с рёбрами жёсткости",
          "Внутренние полупогружные перегородки",
          "Успокоитель входного потока и выходной сифон",
          "Съёмная корзина для пищевых отходов, нерж. AISI 304",
          "Горловины и крышки по количеству люков",
          "Присоединительные патрубки с уплотнительными манжетами",
          "Вентиляционный стояк с дефлектором",
          "Паспорт изделия и руководство по эксплуатации",
        ],
        notIncluded: [
          "Земляные работы и разработка котлована",
          "Бетонная подготовка и обетонирование корпуса",
          "Железобетонная разгрузочная плита при установке под проездом",
          "Наружные сети канализации до и после изделия",
          "Ёмкость для отработанного фритюрного масла",
          "Периодическая откачка жировой массы и шлама",
        ],
        limits: [
          {
            title: "Эмульгированный жир гравитацией не разделяется",
            text: "Моющие средства и гели для посуды переводят жир в эмульсию, которая проходит установку насквозь. Это свойство физики процесса, а не конструкции изделия.",
          },
          {
            title: "Норматив 1,0 мг/л недостижим гравитационным способом",
            text: "Постановление КМ РУз № 11 от 03.02.2010 нормирует жиры на уровне 1,0 мг/л. Ни один гравитационный жироуловитель — ни отечественный, ни импортный — этого значения не даёт. Для единиц мг/л нужна напорная флотация.",
          },
          {
            title: "Отработанное масло сливать нельзя",
            text: "Фритюрное масло выводит установку из строя за одну–две недели. Для него нужна отдельная ёмкость и договор на вывоз.",
          },
          {
            title: "Биопрепараты запрещены",
            text: "Ферменты и эмульгаторы «для растворения жира» не удаляют жир, а гонят его дальше в городскую сеть, где он застывает.",
          },
        ],
        useTitle: "Где применяется",
        limitsTitle: "Что нужно знать до заказа",
        includesTitle: "Входит в поставку",
        notIncludedTitle: "Не входит в поставку",
        howToChoose:
          "Модель подбирается по пиковому расходу стока кухни, а не по числу посадочных мест. Пиковый расход определяется составом технологического оборудования: моек, посудомоечных машин, пароконвектоматов. Пришлите перечень оборудования — подберём типоразмер и дадим исполнительную схему для строителей.",
        materialValue: "стеклопластик, изофталевая полиэфирная смола",
        ventValue: "стояк DN110 с дефлектором",
        powerValue: "отсутствует, работа самотёком",
        installValue: "подземная, в бетонной обойме",
        modelWord: "Жироуловитель",
        ctaTitle: "Подберём типоразмер\nпод ваш объект.",
        ctaText:
          "Пришлите перечень кухонного оборудования и отметку канализации в точке врезки. Вернём подбор модели, стоимость и исполнительную схему для строительной части.",
        ctaButton: "ЗАПРОСИТЬ ПОДБОР",
        priceLabel: "СТОИМОСТЬ",
        priceText:
          "Стоимость зависит от комплектации, класса нагрузки на люки и объёма монтажных работ. Отправьте заявку — ответим в течение рабочего дня.",
        tableTitle: "Типоразмерный ряд",
        specsTitle: "Технические характеристики",
        allModels: "Все модели линейки",
        backToLine: "К линейке",
      },
      "oil-separators": {
        name: "Нефтеуловители",
        labels: {
          area: "Эффективная площадь сепарации",
          load: "Удельная нагрузка",
          fat: "Объём накопления нефтепродуктов",
          sludge: "Приёмно-шламовая камера",
        },
        tagline:
          "Отделение нефтепродуктов и взвеси от стоков автомоек, АЗС, паркингов и производственных площадок",
        intro: [
          "Стоки с автомоек, АЗС, паркингов и открытых площадок несут нефтепродукты, песок и мелкую взвесь. Попадая в канализацию, нефтепродукты образуют плёнку и подавляют биологическую очистку на городских сооружениях; попадая в грунт — загрязняют почву и грунтовые воды.",
          "Нефтеуловитель ставится на выпуске площадки и работает самотёком. Три ступени в одном корпусе: приёмно-шламовая камера, зона гравитационного отделения крупных капель и коалесцентно-ламельный модуль, который собирает мелкие капли в крупные и выводит их на поверхность.",
          "Ряд рассчитан по скорости всплытия капли (формула Стокса). Для капли 100 мкм при плотности нефтепродукта 850 кг/м³ и температуре воды 15 °C скорость всплытия составляет 2,58 м/ч. Удельная нагрузка на эффективную площадь по всему ряду принята 1,72 м/ч — с полуторным запасом к расчётной скорости.",
          "Типоразмер обозначается номинальным расходом в литрах в секунду, как принято в EN 858-2: НЕФ-10 — это 10 л/с, то есть 36 м³/ч.",
        ],
        forWhom: [
          { title: "Автомойки", text: "Стоки постов: нефтепродукты, песок, абразив. Ставится в паре с песколовкой." },
          { title: "АЗС и АГНКС", text: "Площадка заправки и сливная площадка автоцистерн." },
          { title: "Паркинги и стоянки", text: "Мойка полов, талая вода, капёж с автомобилей." },
          { title: "СТО и автосервисы", text: "Посты мойки агрегатов, зона замены масла." },
          { title: "Промышленные площадки", text: "Открытые склады, площадки стоянки техники." },
          { title: "Ливневая канализация", text: "Выпуски с проездов, дорог и разворотных площадок." },
        ],
        includes: [
          "Корпус из стеклопластика с рёбрами жёсткости",
          "Приёмно-шламовая камера с успокоителем входного потока",
          "Коалесцентно-ламельный модуль, шаг пластин 20 мм",
          "Полупогружные перегородки и выходной сифон",
          "Горловины и крышки по количеству люков",
          "Присоединительные патрубки с уплотнительными манжетами",
          "Вентиляционный стояк с дефлектором",
          "Паспорт изделия и руководство по эксплуатации",
        ],
        notIncluded: [
          "Земляные работы и разработка котлована",
          "Бетонная подготовка и обетонирование корпуса",
          "Железобетонная разгрузочная плита при установке под проездом",
          "Наружные сети канализации до и после изделия",
          "Автоматический запорный поплавок — опция",
          "Сорбционный блок доочистки — опция",
          "Периодическая откачка нефтепродуктов и шлама",
        ],
        limits: [
          {
            title: "Норматив 1,0 мг/л гравитацией не достигается",
            text: "Постановление КМ РУз № 11 от 03.02.2010 нормирует нефтепродукты на уровне 1,0 мг/л. Коалесцентный сепаратор устойчиво даёт 5 мг/л — это класс I по EN 858-1, лучший результат для безреагентной схемы. Для единиц мг/л нужен сорбционный блок после сепаратора, и его ресурс считается отдельно.",
          },
          {
            title: "Эмульсия не разделяется",
            text: "Автошампуни, обезжириватели и активная пена переводят нефтепродукт в стойкую эмульсию, которая проходит сепаратор насквозь. Это свойство физики процесса, а не конструкции изделия. При активной химии нужна коагуляция или напорная флотация.",
          },
          {
            title: "Песок обязательно задерживать до пакета",
            text: "Абразив забивает ламельный модуль и снижает эффективность. Приёмно-шламовая камера в составе изделия рассчитана на 200 литров на 1 л/с. При высоком выносе песка — автомойка, стройплощадка, грунтовые проезды — нужна отдельная песколовка перед нефтеуловителем.",
          },
          {
            title: "Расчётный расход — не диаметр трубы",
            text: "Для ливневых стоков расход считается по интенсивности дождя и площади водосбора согласно КМК 2.04.03-19, для автомойки — по числу одновременно работающих постов. Подбор «по диаметру существующей трубы» даёт ошибку в разы в обе стороны.",
          },
        ],
        useTitle: "Где применяется",
        limitsTitle: "Что нужно знать до заказа",
        includesTitle: "Входит в поставку",
        notIncludedTitle: "Не входит в поставку",
        howToChoose:
          "Для автомойки типоразмер определяется числом одновременно работающих постов: один аппарат высокого давления даёт 1,2–1,8 м³/ч. Для АЗС, паркинга и ливневых выпусков — площадью водосбора и расчётной интенсивностью дождя по КМК 2.04.03-19. Пришлите план площадки с отметками и назначением покрытий — вернём расчёт расхода и подбор типоразмера.",
        materialValue: "стеклопластик, изофталевая полиэфирная смола",
        ventValue: "стояк DN110 с дефлектором",
        powerValue: "отсутствует, работа самотёком",
        installValue: "подземная, в бетонной обойме",
        modelWord: "Нефтеуловитель",
        ctaTitle: "Посчитаем расход\nпо вашей площадке.",
        ctaText:
          "Пришлите план площадки, площадь и тип покрытий, отметку канализации в точке врезки. Вернём расчёт расчётного расхода, подбор типоразмера и исполнительную схему для строительной части.",
        ctaButton: "ЗАПРОСИТЬ ПОДБОР",
        priceLabel: "СТОИМОСТЬ",
        priceText:
          "Стоимость зависит от комплектации, класса нагрузки на люки, наличия сорбционного блока и объёма монтажных работ. Отправьте заявку — ответим в течение рабочего дня.",
        tableTitle: "Типоразмерный ряд",
        specsTitle: "Технические характеристики",
        allModels: "Все модели линейки",
        backToLine: "К линейке",
      },
      "sand-traps": {
        name: "Песколовки",
        labels: { sludge: "Объём шламовой зоны" },
        tagline:
          "Задержание песка, абразива и тяжёлой взвеси до поступления на основную ступень очистки",
        intro: [
          "Песок и абразив приходят с автомоек, стройплощадок, грунтовых проездов и открытых площадок. Дальше по цепочке они забивают ламельные пакеты нефтеуловителей, изнашивают рабочие колёса насосов и садятся в аэротенках, вытесняя рабочий объём.",
          "Песколовка ставится первой, до всех остальных сооружений. Работает самотёком: приёмная камера гасит скорость, песок падает в шламовую зону, осветлённая вода уходит через полупогружную перегородку.",
          "Ряд рассчитан на нагрузку по зеркалу не более 25 м/ч. При такой нагрузке задерживается кварцевая частица от 0,10 мм — её скорость осаждения 6,9 мм/с. Норматив КМК требует задержания частиц 0,20–0,25 мм, у которых скорость осаждения втрое выше, так что запас двукратный.",
        ],
        forWhom: [
          { title: "Автомойки", text: "Основной источник абразива: песок с кузова и с колёс." },
          { title: "Стройплощадки", text: "Мойка колёс техники на выезде, стоки с грунтовых проездов." },
          { title: "АЗС и паркинги", text: "Первая ступень перед нефтеуловителем." },
          { title: "Ливневая канализация", text: "Выпуски с проездов и разворотных площадок." },
        ],
        includes: [
          "Корпус из стеклопластика с рёбрами жёсткости",
          "Приёмная камера с гасителем скорости",
          "Полупогружная перегородка на выходе",
          "Шламовая зона с приямком под откачку",
          "Горловины, крышки и присоединительные патрубки",
          "Паспорт изделия и руководство по эксплуатации",
        ],
        notIncluded: [
          "Земляные работы и разработка котлована",
          "Бетонная подготовка и обетонирование корпуса",
          "Железобетонная разгрузочная плита при установке под проездом",
          "Наружные сети канализации до и после изделия",
          "Периодическая откачка шлама",
        ],
        limits: [
          {
            title: "Песколовка не заменяет нефтеуловитель",
            text: "Она снимает песок и тяжёлую взвесь, но нефтепродукты проходят её насквозь. Это первая ступень, а не самостоятельное очистное сооружение.",
          },
          {
            title: "Откачка обязательна по графику",
            text: "Заполненная шламовая зона перестаёт работать: песок начинает выноситься дальше. Объём зоны рассчитан на 300 литров на каждый л/с расчётного расхода, периодичность откачки определяется фактическим выносом на объекте.",
          },
          {
            title: "Мелкая взвесь не задерживается",
            text: "Частицы мельче 0,10 мм и глинистые взвеси гравитацией за разумное время не осаждаются. Для них нужна коагуляция или фильтрация.",
          },
        ],
        useTitle: "Где применяется",
        limitsTitle: "Что нужно знать до заказа",
        includesTitle: "Входит в поставку",
        notIncludedTitle: "Не входит в поставку",
        howToChoose:
          "Типоразмер берётся тот же, что у нефтеуловителя на этом же выпуске: они рассчитываются на один и тот же расход и продаются комплектом. Если песколовка ставится отдельно, расход считается по числу одновременно работающих постов мойки либо по площади водосбора и интенсивности дождя согласно КМК 2.04.03-19.",
        materialValue: "стеклопластик, изофталевая полиэфирная смола",
        ventValue: "стояк DN110 с дефлектором",
        powerValue: "отсутствует, работа самотёком",
        installValue: "подземная, в бетонной обойме",
        modelWord: "Песколовка",
        ctaTitle: "Подберём песколовку\nв комплекте с сепаратором.",
        ctaText:
          "Пришлите план площадки и назначение покрытий. Вернём расчёт расхода, подбор песколовки и нефтеуловителя одним комплектом и исполнительную схему.",
        ctaButton: "ЗАПРОСИТЬ ПОДБОР",
        priceLabel: "СТОИМОСТЬ",
        priceText:
          "Стоимость зависит от комплектации, класса нагрузки на люки и объёма монтажных работ. Отправьте заявку — ответим в течение рабочего дня.",
        tableTitle: "Типоразмерный ряд",
        specsTitle: "Технические характеристики",
        allModels: "Все модели линейки",
        backToLine: "К линейке",
      },
      tanks: {
        name: "Резервуары и усреднители",
        labels: {
          size: "Габариты (⌀ × длина)",
          volumeGross: "Геометрический объём",
        },
        tagline:
          "Ёмкости из стеклопластика 1–50 м³ для усреднения, накопления, пожарного и технологического запаса воды",
        intro: [
          "Резервуар нужен там, где сток идёт неравномерно, а очистка требует ровной подачи. Усреднитель перед очистными сооружениями снимает залповые сбросы; накопительная ёмкость держит запас технической или пожарной воды; промежуточный резервуар разделяет ступени технологической схемы.",
          "Корпус горизонтальный цилиндрический, из стеклопластика на изофталевой полиэфирной смоле. Цилиндр выбран не из эстетики: при равной толщине стенки он держит внешнее давление на порядок лучше прямоугольного короба.",
          "Ключевой параметр подземной ёмкости — устойчивость оболочки к смятию грунтовой водой. Гладкая оболочка без колец жёсткости теряет устойчивость уже при 1,2–2,7 кПа, то есть при 12–27 сантиметрах воды над верхом резервуара. С кольцами жёсткости через 800 мм критическое давление поднимается до 70–73 кПа — семикратный запас к столбу воды в один метр. Поэтому кольца в нашей конструкции обязательны на всём ряду.",
        ],
        forWhom: [
          { title: "Усреднение стоков", text: "Выравнивание расхода и состава перед очистными сооружениями." },
          { title: "Накопление воды", text: "Технический и противопожарный запас, буфер для полива." },
          { title: "Промежуточные ёмкости", text: "Разделение ступеней технологической схемы, приём промывных вод." },
          { title: "Реагентное хозяйство", text: "Ёмкости приготовления и хранения растворов." },
        ],
        includes: [
          "Цилиндрический корпус из стеклопластика",
          "Кольца жёсткости с шагом 800 мм",
          "Горловины и крышки по количеству люков",
          "Присоединительные патрубки с уплотнительными манжетами",
          "Вентиляционный стояк с дефлектором",
          "Паспорт изделия и руководство по эксплуатации",
        ],
        notIncluded: [
          "Земляные работы и разработка котлована",
          "Бетонная плита основания и анкеровка от всплытия",
          "Обетонирование корпуса при высоком уровне грунтовых вод",
          "Насосы, мешалки, уровнемеры и автоматика",
          "Наружные сети до и после изделия",
        ],
        limits: [
          {
            title: "Пустой резервуар всплывает",
            text: "При высоком уровне грунтовых вод порожняя ёмкость выталкивается наверх. Нужна анкеровка к бетонной плите основания расчётной массой — этот расчёт мы выдаём вместе с изделием, но плиту и анкеровку выполняет строительная организация.",
          },
          {
            title: "Обратная засыпка — часть конструкции",
            text: "Засыпка ведётся послойно, песком без камней, с уплотнением по всему периметру и при заполненной водой ёмкости. Нарушение порядка засыпки — самая частая причина деформации корпуса, и на неё гарантия не распространяется.",
          },
          {
            title: "Не рассчитан на избыточное внутреннее давление",
            text: "Изделие работает под атмосферным давлением. Вентиляционный стояк должен быть свободен: закрытая вентиляция при откачке создаёт разрежение и сминает корпус изнутри.",
          },
        ],
        useTitle: "Где применяется",
        limitsTitle: "Что нужно знать до заказа",
        includesTitle: "Входит в поставку",
        notIncludedTitle: "Не входит в поставку",
        howToChoose:
          "Для усреднителя объём считается по графику притока: обычно 4–8 часов среднего расхода, при залповых сбросах — по фактическому объёму залпа. Для накопительной ёмкости — по требуемому запасу. Пришлите суточный график водоотведения или назначение ёмкости и уровень грунтовых вод — подберём объём и выдадим расчёт анкеровки.",
        materialValue: "стеклопластик, изофталевая полиэфирная смола",
        ventValue: "стояк DN110 с дефлектором, обязателен",
        powerValue: "отсутствует",
        installValue: "подземная или наземная, по проекту",
        modelWord: "Резервуар",
        ctaTitle: "Подберём объём\nи посчитаем анкеровку.",
        ctaText:
          "Пришлите назначение ёмкости, требуемый объём и уровень грунтовых вод на площадке. Вернём подбор, расчёт устойчивости и схему установки для строителей.",
        ctaButton: "ЗАПРОСИТЬ ПОДБОР",
        priceLabel: "СТОИМОСТЬ",
        priceText:
          "Стоимость зависит от объёма, толщины ламината, количества и класса люков, наличия внутренних перегородок. Отправьте заявку — ответим в течение рабочего дня.",
        tableTitle: "Типоразмерный ряд",
        specsTitle: "Технические характеристики",
        allModels: "Все модели линейки",
        backToLine: "К линейке",
      },
      "pump-stations": {
        name: "КНС — канализационные насосные станции",
        labels: { size: "Габариты (⌀ × глубина)", volumeGross: "Геометрический объём" },
        tagline:
          "Корпуса насосных станций из стеклопластика для перекачки хозяйственно-бытовых и производственных стоков",
        intro: [
          "Насосная станция нужна там, где самотёк невозможен: отметка выпуска ниже коллектора, посёлок за подъёмом, подвальный этаж. Корпус принимает сток, накапливает его между уровнями пуска и остановки и отдаёт напорным трубопроводом.",
          "Мы производим корпус, направляющие, опорные колена, площадку обслуживания и обвязку. Насосы, поплавковые датчики и шкаф управления — покупные: подбираются под расход и напор конкретного объекта.",
          "Полезный объём между уровнями считается не «на глазок», а по допустимому числу пусков насоса: V = Q · t / 4, где t — минимальный цикл, десять минут для насосов до 7,5 кВт и пятнадцать для более мощных. Меньший объём означает частые пуски и сгоревший двигатель на второй год.",
        ],
        forWhom: [
          { title: "Посёлки и жилые дома", text: "Перекачка бытовых стоков в городской коллектор." },
          { title: "Коммерческие объекты", text: "Кафе, гостиницы, автомойки с выпуском ниже отметки сети." },
          { title: "Промышленные площадки", text: "Производственные стоки, промливневые выпуски." },
          { title: "Ливневая канализация", text: "Перекачка дождевых стоков с заглублённых площадок." },
        ],
        includes: [
          "Цилиндрический корпус из стеклопластика с кольцами жёсткости",
          "Направляющие и опорные колена под насосы",
          "Внутренняя напорная обвязка с обратными клапанами и задвижками",
          "Площадка обслуживания и лестница",
          "Горловина с люком и присоединительные патрубки",
          "Паспорт изделия и руководство по эксплуатации",
        ],
        notIncluded: [
          "Насосы, поплавковые датчики уровня, шкаф управления",
          "Земляные работы, бетонная плита основания и анкеровка",
          "Обетонирование корпуса при высоком уровне грунтовых вод",
          "Наружные самотёчные и напорные сети",
          "Электроснабжение и кабельные линии",
        ],
        limits: [
          {
            title: "Глубина 3000 мм — каталожная, не проектная",
            text: "Реальная глубина определяется отметкой лотка подводящего коллектора и глубиной промерзания. В таблице приведён типовой размер; корпус изготавливается на нужную глубину по заданию.",
          },
          {
            title: "Два насоса, а не один",
            text: "Один рабочий, один резервный, с автоматическим переключением. Станция с единственным насосом на время ремонта останавливает весь объект, а канализация ждать не умеет.",
          },
          {
            title: "Вентиляция обязательна",
            text: "В приёмном резервуаре образуется сероводород: он опасен для персонала и разрушает бетон и металл. Приточно-вытяжной стояк и запрет на вход без газоанализатора — не формальность.",
          },
        ],
        useTitle: "Где применяется",
        limitsTitle: "Что нужно знать до заказа",
        includesTitle: "Входит в поставку",
        notIncludedTitle: "Не входит в поставку",
        howToChoose:
          "Нужны четыре величины: расчётный расход стока, геодезическая высота подъёма, длина и диаметр напорного трубопровода, отметка лотка подводящего коллектора. По ним считается рабочая точка насоса и глубина корпуса. Пришлите эти данные или профиль трассы — вернём подбор станции целиком, вместе с рекомендацией по насосам.",
        materialValue: "стеклопластик, изофталевая полиэфирная смола",
        ventValue: "приточно-вытяжная, стояк DN110",
        powerValue: "по подобранным насосам, 380 В",
        installValue: "подземная, на бетонной плите с анкеровкой",
        modelWord: "КНС",
        ctaTitle: "Посчитаем станцию\nвместе с насосами.",
        ctaText:
          "Пришлите расход, высоту подъёма, длину напорной линии и отметку подводящего коллектора. Вернём подбор корпуса, рабочую точку насосов и схему установки.",
        ctaButton: "ЗАПРОСИТЬ ПОДБОР",
        priceLabel: "СТОИМОСТЬ",
        priceText:
          "Стоимость зависит от глубины корпуса, марки насосов, состава обвязки и автоматики. Отправьте заявку — ответим в течение рабочего дня.",
        tableTitle: "Типоразмерный ряд",
        specsTitle: "Технические характеристики",
        allModels: "Все модели линейки",
        backToLine: "К линейке",
      },
      "bio-plants": {
        name: "ЛОС — локальные очистные сооружения",
        labels: { sludge: "Объём стабилизатора ила", retention: "Время пребывания в аэротенке" },
        tagline:
          "Биологическая очистка хозяйственно-бытовых стоков 1–25 м³/сут в корпусе из стеклопластика",
        intro: [
          "Там, где нет городской канализации, стоки дома, кафе или гостиницы приходится очищать на месте. Локальные очистные сооружения делают это биологически: микроорганизмы в аэротенке окисляют органику, затем ил отделяется в отстойнике и возвращается обратно.",
          "Ряд рассчитан на хозяйственно-бытовой сток: БПК₅ 300 мг/л, азот общий 50 мг/л, водоотведение 200 литров на жителя в сутки — по КМК 2.04.03-19. Возраст ила принят 15 суток, доза ила 2,8 г/л, время пребывания в аэротенке 13,5 часа: этого достаточно и для окисления органики, и для нитрификации.",
          "Потребность в кислороде считается по DWA-A 131 и пересчитывается в стандартные условия с коэффициентом переноса 0,6 и эффективностью мелкопузырчатой аэрации 24 процента. Отсюда берётся расход воздуха, а по нему подбирается воздуходувка. Запас по осадку — 96 суток на всём ряду, то есть откачка примерно раз в три месяца.",
        ],
        forWhom: [
          { title: "Частные дома и коттеджи", text: "От одного до пяти домохозяйств на одну установку." },
          { title: "Кафе и гостевые дома", text: "Стоки кухни идут через жироуловитель, затем в ЛОС." },
          { title: "Гостиницы и базы отдыха", text: "Сезонная нагрузка, залповые сбросы утром и вечером." },
          { title: "Придорожные объекты", text: "АЗС с кафе, мотели, площадки отдыха." },
        ],
        includes: [
          "Корпус из стеклопластика с внутренним зонированием",
          "Приёмно-усреднительная камера",
          "Аэротенк с мелкопузырчатой аэрационной системой",
          "Вторичный отстойник с возвратом ила",
          "Стабилизатор избыточного ила",
          "Эрлифты возврата ила и перекачки, горловины и люки",
          "Паспорт изделия и руководство по эксплуатации",
        ],
        notIncluded: [
          "Воздуходувка и шкаф управления — подбираются по расходу воздуха",
          "Земляные работы, бетонная плита основания и анкеровка",
          "Наружные сети канализации до и после установки",
          "Электроснабжение и кабельные линии",
          "Жироуловитель на выпуске кухни, если объект с общепитом",
          "Периодическая откачка стабилизированного ила",
        ],
        limits: [
          {
            title: "Биология не выдерживает перерывов",
            text: "При отключении электричества дольше суток ил гибнет, и установка выходит на режим заново две–три недели. Для объектов с перебоями в сети нужен резервный источник питания.",
          },
          {
            title: "Хлор, растворители и залповый жир убивают ил",
            text: "Сброс хлорсодержащих средств, красок, растворителей или большого объёма жира останавливает биологию. Кухонные стоки обязательно идут через жироуловитель.",
          },
          {
            title: "Сезонная нагрузка требует отдельного расчёта",
            text: "База отдыха, работающая три месяца в году, не эквивалентна дому с постоянным проживанием: ил не успевает нарасти к сезону. Такие объекты считаются отдельно, с режимом запуска перед сезоном.",
          },
        ],
        useTitle: "Где применяется",
        limitsTitle: "Что нужно знать до заказа",
        includesTitle: "Входит в поставку",
        notIncludedTitle: "Не входит в поставку",
        howToChoose:
          "Подбор идёт по расходу, а не по числу комнат. Расход считается по количеству постоянно проживающих и норме водоотведения по КМК 2.04.03-19, для кафе и гостиниц — по составу санитарных приборов и посадочных мест. Если известен анализ стока, присылайте: при БПК выше 300 мг/л типоразмер сдвигается на ступень вверх.",
        materialValue: "стеклопластик, изофталевая полиэфирная смола",
        ventValue: "приточно-вытяжная, стояк DN110",
        powerValue: "по воздуходувке, 220 В до 15 м³/сут",
        installValue: "подземная, на бетонной плите с анкеровкой",
        modelWord: "ЛОС",
        ctaTitle: "Посчитаем расход\nи подберём установку.",
        ctaText:
          "Пришлите количество проживающих или состав санитарных приборов, наличие кухни и уровень грунтовых вод. Вернём расчёт расхода, подбор типоразмера и схему установки.",
        ctaButton: "ЗАПРОСИТЬ ПОДБОР",
        priceLabel: "СТОИМОСТЬ",
        priceText:
          "Стоимость зависит от типоразмера, комплектации воздуходувкой и автоматикой, класса нагрузки на люки. Отправьте заявку — ответим в течение рабочего дня.",
        tableTitle: "Типоразмерный ряд",
        specsTitle: "Технические характеристики",
        allModels: "Все модели линейки",
        backToLine: "К линейке",
      },
      chlorinators: {
        name: "Хлораторы — электролизные установки NaOCl",
        labels: { motor: "Потребляемая мощность", size: "Габариты рамы" },
        tagline:
          "Производство гипохлорита натрия на объекте из поваренной соли — обеззараживание воды без привозного реагента",
        intro: [
          "Гипохлорит натрия — основной реагент обеззараживания питьевой и технической воды. Его можно возить в канистрах, а можно производить прямо на объекте: соль плюс подготовленная вода проходят через электролизную ячейку, и получается раствор с концентрацией 6–8 г/л активного хлора. Раствор нарабатывается в накопительный бак и оттуда дозируется в воду.",
          "Электролизный раствор такой концентрации относится к малоопасным: в отличие от привозного товарного гипохлорита 19 %, он не требует склада химреагентов первого класса и спецтранспорта. Расходный материал — обычная поваренная соль.",
          "Станцию собираем мы: рама, шкаф управления, бак-сатуратор соли, накопительный бак раствора, обвязка и арматура. Электролизная ячейка и выпрямитель — покупные узлы проверенных производителей; их паспортные данные передаются с изделием.",
          "Расход соли — 3,2 кг на килограмм активного хлора, электроэнергии — 4,5 кВт·ч на килограмм. Бак раствора рассчитан на восемь часов непрерывной работы.",
        ],
        forWhom: [
          { title: "Водоканалы и посёлки", text: "Обеззараживание питьевой воды скважин и водозаборов." },
          { title: "Бассейны", text: "Наработка гипохлорита на месте вместо закупки реагента." },
          { title: "Пищевые производства", text: "Санитарная обработка и обеззараживание технической воды." },
          { title: "Очистные сооружения", text: "Обеззараживание очищенного стока перед сбросом." },
        ],
        includes: [
          "Рама и шкаф управления собственной сборки",
          "Бак-сатуратор соли с фильтром рассола",
          "Накопительный бак раствора гипохлорита",
          "Обвязка, арматура и пробоотборники",
          "Электролизная ячейка и выпрямитель — комплектующие с паспортами",
          "Шеф-монтаж и пусконаладка",
          "Паспорт изделия и руководство по эксплуатации",
        ],
        notIncluded: [
          "Умягчитель перед станцией — подбирается по анализу воды, обязателен",
          "Насос-дозатор раствора в точку ввода — подбирается по расходу",
          "Приточно-вытяжная вентиляция помещения",
          "Электроснабжение и кабельные линии",
          "Поваренная соль",
        ],
        limits: [
          {
            title: "Умягчение воды перед ячейкой обязательно",
            text: "При жёсткости выше 1 мг-экв/л на электродах осаждается карбонат кальция, и ячейка теряет производительность за недели. Вода в Узбекистане жёсткая почти везде, поэтому умягчитель — не опция, а условие работоспособности. Подбирается по анализу воды и входит в схему станции.",
          },
          {
            title: "Электролиз выделяет водород",
            text: "На килограмм активного хлора выделяется 0,315 м³ водорода. Помещение станции должно иметь принудительную вентиляцию: расчётный минимум указан в характеристиках каждой модели, но не менее чем 10-кратный обмен объёма помещения в час. Это требование безопасности, и оно проверяется при пусконаладке.",
          },
          {
            title: "Раствор — не товарный гипохлорит",
            text: "Станция вырабатывает раствор 6–8 г/л, а не концентрат 190 г/л. Дозирующая линия и объём бака считаются именно под эту концентрацию. Заменить станцию канистрами «один к одному» не получится — и наоборот.",
          },
        ],
        useTitle: "Где применяется",
        limitsTitle: "Что нужно знать до заказа",
        includesTitle: "Входит в поставку",
        notIncludedTitle: "Не входит в поставку",
        howToChoose:
          "Типоразмер определяется дозой активного хлора и расходом обрабатываемой воды: грамм-в-час станции = доза (мг/л) × расход (м³/ч). Для питьевой воды типовая доза 1–3 мг/л, для очищенного стока 3–10 мг/л. Пришлите расход и назначение воды — посчитаем дозу, подберём модель и умягчитель к ней.",
        materialValue: "рама — сталь с покрытием, баки — полиэтилен",
        ventValue: "принудительная, по разбавлению водорода",
        powerValue: "220/380 В, по типоразмеру",
        installValue: "в отапливаемом помещении",
        modelWord: "Хлоратор",
        ctaTitle: "Посчитаем дозу\nи подберём станцию.",
        ctaText:
          "Пришлите расход воды, её назначение и анализ по жёсткости. Вернём подбор станции, умягчителя и требования к помещению.",
        ctaButton: "ЗАПРОСИТЬ ПОДБОР",
        priceLabel: "СТОИМОСТЬ",
        priceText:
          "Стоимость зависит от типоразмера, марки ячейки и комплектации умягчителем и дозирующей линией. Характеристики расчётные и уточняются по паспорту ячейки при заказе. Отправьте заявку — ответим в течение рабочего дня.",
        tableTitle: "Типоразмерный ряд",
        specsTitle: "Технические характеристики",
        allModels: "Все модели линейки",
        backToLine: "К линейке",
      },
      dosing: {
        name: "Станции дозирования реагентов",
        labels: { motor: "Мощность мешалки", size: "Габариты рамы", tankSol: "Расходный бак" },
        tagline:
          "Готовые узлы приготовления и подачи реагентов: коагулянт, флокулянт, гипохлорит, коррекция pH",
        intro: [
          "Станция дозирования — это расходный бак с мешалкой, два насоса-дозатора и обвязка на общей раме. Реагент готовится в баке до рабочей концентрации и подаётся в точку ввода пропорционально расходу воды или по сигналу датчика.",
          "Раму, бак, мешалку, обвязку и шкаф собираем мы. Насосы-дозаторы — покупные: марка и типоразмер подбираются по расходу реагента и давлению в точке ввода, паспорта передаются с изделием.",
          "Насосов всегда два — рабочий и резервный. Дозирование останавливаться не должно: остановка коагулянта на очистных сооружениях означает проскок взвеси уже через несколько минут.",
          "Типоразмер задаётся объёмом расходного бака — от ста литров до кубометра. Объём выбирается так, чтобы одной заправки хватало минимум на сутки работы.",
        ],
        forWhom: [
          { title: "Очистные сооружения", text: "Коагулянт и флокулянт перед отстаиванием и флотацией." },
          { title: "Водоподготовка", text: "Гипохлорит, коррекция pH, ингибиторы для мембран." },
          { title: "Бассейны", text: "Дозирование гипохлорита и корректора pH по датчикам." },
          { title: "Промышленность", text: "Подача технологических реагентов по расходомеру." },
        ],
        includes: [
          "Рама и поддон-сборник проливов собственной сборки",
          "Расходный бак из полиэтилена с крышкой и уровнемером",
          "Мешалка с электроприводом",
          "Два насоса-дозатора — рабочий и резервный, с паспортами",
          "Всасывающая и напорная обвязка, клапан впрыска",
          "Шкаф управления",
          "Паспорт изделия и руководство по эксплуатации",
        ],
        notIncluded: [
          "Реагенты",
          "Датчики расхода и качества воды для пропорционального дозирования",
          "Трубопровод от станции до точки ввода",
          "Электроснабжение и кабельные линии",
        ],
        limits: [
          {
            title: "Материалы подбираются под реагент",
            text: "Гипохлорит, кислоты и щёлочи требуют разных материалов мембран, клапанов и уплотнений. Универсальной станции «под любой реагент» не существует: при заказе обязательно указывается, что и в какой концентрации будет дозироваться.",
          },
          {
            title: "Полимер готовится иначе",
            text: "Флокулянт требует медленного созревания раствора и мешалки с малой скоростью — обычная станция для него не подходит. Для полимера собираем двухкамерный вариант, это отдельная комплектация.",
          },
          {
            title: "Точность держится калибровкой",
            text: "Насос-дозатор точен, пока проверяется по мерному цилиндру. Калибровочная колонка входит в обвязку, порядок проверки описан в руководстве — раз в месяц, пять минут.",
          },
        ],
        useTitle: "Где применяется",
        limitsTitle: "Что нужно знать до заказа",
        includesTitle: "Входит в поставку",
        notIncludedTitle: "Не входит в поставку",
        howToChoose:
          "Нужны три величины: реагент и его рабочая концентрация, требуемая доза в мг/л и расход обрабатываемой воды. Из них считается часовой расход раствора, по нему подбираются насосы и объём бака. Пришлите эти данные — вернём подбор станции с материалами под ваш реагент.",
        materialValue: "рама — сталь с покрытием, бак — полиэтилен",
        ventValue: "по дозируемому реагенту",
        powerValue: "220 В",
        installValue: "в помещении, на ровном полу",
        modelWord: "Станция",
        ctaTitle: "Подберём станцию\nпод ваш реагент.",
        ctaText:
          "Пришлите реагент, дозу и расход воды. Вернём подбор насосов, объём бака и материалы уплотнений под вашу химию.",
        ctaButton: "ЗАПРОСИТЬ ПОДБОР",
        priceLabel: "СТОИМОСТЬ",
        priceText:
          "Стоимость зависит от объёма бака, марки насосов и материалов под реагент. Отправьте заявку — ответим в течение рабочего дня.",
        tableTitle: "Типоразмерный ряд",
        specsTitle: "Технические характеристики",
        allModels: "Все модели линейки",
        backToLine: "К линейке",
      },
    },
  },
  uz: {
    label: "ASSORTIMENT",
    navLabel: "Assortiment",
    teaserTitle: "Modellar\nva parametrlar.",
    teaserText: "To‘liq texnik tavsiflarga ega o‘lcham qatorlari: gabaritlar, ishchi hajm, turib qolish vaqti, ulanish o‘lchamlari va massa. Har bir model uchun alohida sahifa.",
    teaserButton: "ASSORTIMENTNI KO‘RISH",
    title: "O‘z ishlab chiqarishimizdagi\nuskunalar.",
    intro:
      "Tipo‘lcham qatorlari me'yorlar bo‘yicha hisoblangan va gidravlika bo‘yicha tekshirilgan. Har bir model «taxminan shunday o‘lcham» emas, balki hisob natijasi: turib qolish vaqti, ko‘zgu yuzasiga yuklama va to‘planish hajmi butun qator uchun tekshirib chiqilgan.",
    specLabels: {
      q: "Hisobiy sarf",
      ns: "Nominal sarf NS",
      qd: "Hisobiy sarf",
      vol: "Nominal hajm",
      pe: "Ekvivalent aholi soni",
      diameter: "Korpus diametri",
      depth: "Korpus chuqurligi",
      useful: "Sathlar orasidagi foydali hajm",
      vaer: "Aerotenk hajmi",
      air: "Havo sarfi",
      motor: "Havo puflagich quvvati",
      rings: "Qattiqlik halqalari",
      pcr: "Kritik ezilish bosimi",
      pumps: "Nasoslar soni",
      cl: "Faol xlor",
      saltd: "Tuz sarfi",
      h2: "Vodorod ajralishi",
      ventMin: "Ventilyatsiya, kamida",
      tankSol: "Eritma baki",
      tankSalt: "Tuz saturator baki",
      size: "Gabaritlar (U × K × B)",
      volumeGross: "Geometrik hajm",
      volumeWork: "Ishchi hajm",
      retention: "Turib qolish vaqti",
      area: "Ko‘zgu yuzasi",
      load: "Gidravlik yuklama",
      fat: "Yog‘ to‘planish hajmi",
      sludge: "Qabul-shlam zonasi",
      material: "Korpus materiali",
      laminate: "Laminat qalinligi",
      mass: "Quruq massa",
      dn: "Ulanish kirish / chiqish",
      hatches: "Lyuklar soni",
      vent: "Ventilyatsiya",
      power: "Elektr energiya sarfi",
      install: "O‘rnatish usuli",
    },
    lines: {
      "grease-traps": {
        name: "Yog‘ tutgichlar",
        tagline:
          "Oshxona oqava suvlaridan yog‘lar va oziq-ovqat chiqindilarini kommunal kanalizatsiyaga tashlashdan oldin ajratish",
        intro: [
          "Oshxona oqava suvlari hayvon va o‘simlik kelib chiqishli yog‘lar, oziq-ovqat chiqindilari va yuvish vositalarini o‘z ichiga oladi. Sovishi bilan yog‘ quvur devorlarida va shahar tarmog‘ida qotib qoladi, bu esa tiqilish, avariya va suv ta'minoti tashkiloti tomonidan da'volarga olib keladi.",
          "Yog‘ tutgich oshxona chiqishida, kommunal kanalizatsiyaga ulanishdan oldin o‘rnatiladi. U o‘z oqimi bilan ishlaydi: nasos ham, elektr ta'minoti ham, avtomatika ham talab qilinmaydi.",
          "Restoran oshxonasidagi asosiy qiyinchilik ifloslik emas, balki harorat. Fritürnitsa, parokonvektomat va idish yuvish mashinalari oqavasi 45–60 °C bo‘lib, bunday haroratda yog‘ suyuq holatda qoladi va yuzaga chiqmaydi. U taxminan 30 °C gacha sovigandan keyingina ko‘tariladi. Shu sababli butun qator kamida 79 daqiqalik turib qolish vaqtiga hisoblangan — bu ham sovishga, ham ajralishga yetadi.",
        ],
        forWhom: [
          { title: "Restoran va kafelar", text: "Fritür va idish yuvish mashinasi bilan to‘liq sikl oshxonasi." },
          { title: "Fudkort va oshxonalar", text: "Bitta chiqishga bir nechta oshxona, kuchaygan zalpli tashlama." },
          { title: "Novvoyxona va qandolatxonalar", text: "O‘simlik yog‘lari yuqori bo‘lgan oqava suvlar." },
          { title: "Go‘sht va baliq sexlari", text: "Hayvon yog‘lari, muallaq moddalarning yuqori ulushi." },
          { title: "Mehmonxonalar", text: "Mehmonxona qoshidagi restoran, banket zallari." },
          { title: "Oziq-ovqat ishlab chiqarish", text: "Qayta ishlash sexlarining texnologik oqava suvlari." },
        ],
        includes: [
          "Qattiqlik qovurg‘alari bilan shishaplastik korpus",
          "Ichki yarim botirilgan to‘siqlar",
          "Kirish oqimi tinchlantirgichi va chiqish sifoni",
          "Oziq-ovqat chiqindilari uchun yechiladigan savat, zangl. AISI 304",
          "Lyuklar soniga muvofiq bo‘yinlar va qopqoqlar",
          "Zichlovchi manjetli ulanish patrubkalari",
          "Deflektorli ventilyatsiya stoyagi",
          "Mahsulot pasporti va foydalanish bo‘yicha qo‘llanma",
        ],
        notIncluded: [
          "Yer ishlari va kotlovan qazish",
          "Beton tayyorlash va korpusni betonlash",
          "Yo‘l ostiga o‘rnatishda temir-beton yuk tushiruvchi plita",
          "Mahsulotgacha va undan keyingi tashqi kanalizatsiya tarmoqlari",
          "Ishlatilgan fritür yog‘i uchun idish",
          "Yog‘ massasi va shlamni davriy so‘rib olish",
        ],
        limits: [
          {
            title: "Emulsiyalangan yog‘ og‘irlik kuchi bilan ajralmaydi",
            text: "Yuvish vositalari va idish uchun gellar yog‘ni emulsiyaga aylantiradi, u esa qurilmadan o‘tib ketaveradi. Bu jarayon fizikasining xossasi, mahsulot konstruksiyasining kamchiligi emas.",
          },
          {
            title: "1.0 mg/l me'yoriga gravitatsion usulda erishib bo‘lmaydi",
            text: "O‘zR VM 03.02.2010 y. 11-son qarori yog‘larni 1.0 mg/l darajasida me'yorlaydi. Birorta ham gravitatsion yog‘ tutgich — na mahalliy, na chet ellik — bu qiymatni bermaydi. Birlik mg/l uchun bosimli flotatsiya kerak.",
          },
          {
            title: "Ishlatilgan yog‘ni to‘kish mumkin emas",
            text: "Fritür yog‘i qurilmani bir-ikki hafta ichida ishdan chiqaradi. Uning uchun alohida idish va chiqarib ketish shartnomasi kerak.",
          },
          {
            title: "Biopreparatlar taqiqlanadi",
            text: "«Yog‘ni eritish uchun» fermentlar va emulgatorlar yog‘ni yo‘qotmaydi, balki uni shahar tarmog‘iga haydaydi, u yerda esa yog‘ qotib qoladi.",
          },
        ],
        useTitle: "Qayerda qo‘llaniladi",
        limitsTitle: "Buyurtma berishdan oldin bilish kerak",
        includesTitle: "Yetkazib berishga kiradi",
        notIncludedTitle: "Yetkazib berishga kirmaydi",
        howToChoose:
          "Model o‘rindiqlar soniga emas, balki oshxona oqavasining cho‘qqi sarfiga qarab tanlanadi. Cho‘qqi sarfi texnologik uskunalar tarkibi bilan aniqlanadi: yuvish idishlari, idish yuvish mashinalari, parokonvektomatlar. Uskunalar ro‘yxatini yuboring — tipo‘lchamni tanlab beramiz va quruvchilar uchun ijroiya sxemasini taqdim etamiz.",
        materialValue: "shishaplastik, izoftal poliefir smolasi",
        ventValue: "deflektorli DN110 stoyak",
        powerValue: "yo‘q, o‘z oqimi bilan ishlaydi",
        installValue: "yer osti, beton g‘ilofda",
        modelWord: "Yog‘ tutgich",
        ctaTitle: "Obyektingizga mos tipo‘lchamni\ntanlab beramiz.",
        ctaText:
          "Oshxona uskunalari ro‘yxatini va ulanish nuqtasidagi kanalizatsiya belgisini yuboring. Model tanlovi, narxi va qurilish qismi uchun ijroiya sxemasini qaytaramiz.",
        ctaButton: "TANLOVNI SO‘RASH",
        priceLabel: "NARXI",
        priceText:
          "Narx komplektatsiyaga, lyuklarning yuklama sinfiga va montaj ishlari hajmiga bog‘liq. Ariza yuboring — bir ish kuni ichida javob beramiz.",
        tableTitle: "Tipo‘lcham qatori",
        specsTitle: "Texnik tavsiflar",
        allModels: "Liniyaning barcha modellari",
        backToLine: "Liniyaga qaytish",
      },
      "oil-separators": {
        name: "Neft tutgichlar",
        labels: {
          area: "Samarali separatsiya yuzasi",
          load: "Solishtirma yuklama",
          fat: "Neft mahsulotlari to‘planish hajmi",
          sludge: "Qabul-shlam kamerasi",
        },
        tagline:
          "Avtoyuvish shoxobchalari, ShAQSh, avtoturargohlar va ishlab chiqarish maydonchalari oqavasidan neft mahsulotlari va muallaq zarralarni ajratish",
        intro: [
          "Avtoyuvish shoxobchalari, ShAQSh, avtoturargohlar va ochiq maydonchalar oqavasi neft mahsulotlari, qum va mayda muallaq zarralarni olib keladi. Kanalizatsiyaga tushganda neft mahsulotlari parda hosil qiladi va shahar inshootlaridagi biologik tozalashni bo‘g‘adi; tuproqqa tushganda tuproq va yer osti suvlarini ifloslantiradi.",
          "Neft tutgich maydoncha chiqishiga o‘rnatiladi va o‘z oqimi bilan ishlaydi. Bitta korpusda uch bosqich: qabul-shlam kamerasi, yirik tomchilarni gravitatsion ajratish zonasi va mayda tomchilarni yiriklashtirib yuzaga chiqaradigan koalessent-lamel moduli.",
          "Qator tomchining suzib chiqish tezligi bo‘yicha (Stoks formulasi) hisoblangan. 100 mkm tomcha uchun neft mahsuloti zichligi 850 kg/m³ va suv harorati 15 °C bo‘lganda suzib chiqish tezligi 2,58 m/soat. Butun qator bo‘yicha samarali yuzaga solishtirma yuklama 1,72 m/soat qilib qabul qilingan — hisobiy tezlikka nisbatan 1,5 karra zaxira bilan.",
          "O‘lcham EN 858-2 da qabul qilinganidek, sekundiga litrdagi nominal sarf bilan belgilanadi: НЕФ-10 — bu 10 l/s, ya’ni 36 m³/soat.",
        ],
        forWhom: [
          { title: "Avtoyuvish shoxobchalari", text: "Postlar oqavasi: neft mahsulotlari, qum, abraziv. Qum tutgich bilan birga o‘rnatiladi." },
          { title: "ShAQSh va AGNQSh", text: "Yoqilg‘i quyish va avtotsisternalarni bo‘shatish maydonchasi." },
          { title: "Avtoturargohlar", text: "Pol yuvish, erigan qor suvi, avtomobillardan tomchilash." },
          { title: "Texnik xizmat stansiyalari", text: "Agregatlarni yuvish postlari, moy almashtirish zonasi." },
          { title: "Sanoat maydonchalari", text: "Ochiq omborlar, texnika turadigan maydonchalar." },
          { title: "Yomg‘ir kanalizatsiyasi", text: "Yo‘l va aylanma maydonchalardan chiqish joylari." },
        ],
        includes: [
          "Qattiqlik qovurg‘alari bilan shishatolali plastik korpus",
          "Kirish oqimini tinchlantirgichli qabul-shlam kamerasi",
          "Koalessent-lamel moduli, plastinka qadami 20 mm",
          "Yarim botiq to‘siqlar va chiqish sifoni",
          "Lyuklar soniga mos bo‘yinlar va qopqoqlar",
          "Zichlash muftalari bilan ulanish patrubkalari",
          "Deflektorli ventilyatsiya stoyakasi",
          "Mahsulot pasporti va foydalanish qo‘llanmasi",
        ],
        notIncluded: [
          "Yer ishlari va kotlovan qazish",
          "Beton tayyorlash va korpusni betonlash",
          "Yo‘l ostiga o‘rnatishda temir-beton yuk tushiruvchi plita",
          "Mahsulotgacha va undan keyingi tashqi kanalizatsiya tarmoqlari",
          "Avtomatik yopuvchi kalqovich — opsiya",
          "Sorbsion qo‘shimcha tozalash bloki — opsiya",
          "Neft mahsulotlari va shlamni davriy so‘rib olish",
        ],
        limits: [
          {
            title: "1,0 mg/l me’yoriga gravitatsiya bilan erishib bo‘lmaydi",
            text: "O‘zbekiston Respublikasi Vazirlar Mahkamasining 03.02.2010 yildagi 11-sonli qarori neft mahsulotlarini 1,0 mg/l darajasida me’yorlaydi. Koalessent separator barqaror 5 mg/l beradi — bu EN 858-1 bo‘yicha I sinf, reagentsiz sxema uchun eng yaxshi natija. Bir necha mg/l uchun separatordan keyin sorbsion blok kerak.",
          },
          {
            title: "Emulsiya ajralmaydi",
            text: "Avtoshampunlar, yog‘sizlantirgichlar va faol ko‘pik neft mahsulotini barqaror emulsiyaga aylantiradi, u separatordan o‘tib ketadi. Bu jarayon fizikasining xususiyati, mahsulot konstruksiyasi emas. Faol kimyo bo‘lganda koagulyatsiya yoki bosimli flotatsiya kerak.",
          },
          {
            title: "Qumni paketgacha ushlab qolish shart",
            text: "Abraziv lamel modulini tiqib qo‘yadi. Mahsulot tarkibidagi qabul-shlam kamerasi 1 l/s uchun 200 litrga hisoblangan. Qum ko‘p chiqadigan joylarda — avtoyuvish, qurilish maydonchasi — neft tutgichdan oldin alohida qum tutgich kerak.",
          },
          {
            title: "Hisobiy sarf — quvur diametri emas",
            text: "Yomg‘ir oqavasi uchun sarf KMK 2.04.03-19 bo‘yicha yomg‘ir jadalligi va suv yig‘ish maydoni bo‘yicha, avtoyuvish uchun — bir vaqtda ishlaydigan postlar soni bo‘yicha hisoblanadi. «Mavjud quvur diametri bo‘yicha» tanlash bir necha barobar xatolik beradi.",
          },
        ],
        useTitle: "Qayerda qo‘llaniladi",
        limitsTitle: "Buyurtmadan oldin bilish kerak",
        includesTitle: "Yetkazib berishga kiradi",
        notIncludedTitle: "Yetkazib berishga kirmaydi",
        howToChoose:
          "Avtoyuvish uchun o‘lcham bir vaqtda ishlaydigan postlar soni bilan aniqlanadi: bitta yuqori bosimli apparat 1,2–1,8 m³/soat beradi. ShAQSh, avtoturargoh va yomg‘ir chiqishlari uchun — suv yig‘ish maydoni va KMK 2.04.03-19 bo‘yicha hisobiy yomg‘ir jadalligi bilan. Maydoncha rejasini belgilar va qoplama turlari bilan yuboring — sarf hisobi va o‘lcham tanlovini qaytaramiz.",
        materialValue: "shishatolali plastik, izoftal poliefir smolasi",
        ventValue: "deflektorli DN110 stoyak",
        powerValue: "yo‘q, o‘z oqimi bilan ishlaydi",
        installValue: "yer osti, beton qobiqda",
        modelWord: "Neft tutgich",
        ctaTitle: "Maydonchangiz bo‘yicha\nsarfni hisoblaymiz.",
        ctaText:
          "Maydoncha rejasini, qoplama maydoni va turini, ulanish nuqtasidagi kanalizatsiya belgisini yuboring. Hisobiy sarf, o‘lcham tanlovi va qurilish qismi uchun ijro sxemasini qaytaramiz.",
        ctaButton: "TANLOVNI SO‘RASH",
        priceLabel: "NARXI",
        priceText:
          "Narx komplektatsiya, lyuklarning yuklama sinfi, sorbsion blok mavjudligi va montaj ishlari hajmiga bog‘liq. Ariza yuboring — ish kuni davomida javob beramiz.",
        tableTitle: "O‘lchamlar qatori",
        specsTitle: "Texnik tavsiflar",
        allModels: "Liniyaning barcha modellari",
        backToLine: "Liniyaga qaytish",
      },
      "sand-traps": {
        name: "Qum tutgichlar",
        labels: { sludge: "Shlam zonasi hajmi" },
        tagline:
          "Asosiy tozalash bosqichiga tushishidan oldin qum, abraziv va og‘ir muallaq zarralarni ushlab qolish",
        intro: [
          "Qum va abraziv avtoyuvish shoxobchalari, qurilish maydonchalari va ochiq maydonchalardan keladi. Keyingi bosqichlarda ular neft tutgichlarning lamel paketlarini tiqadi, nasos g‘ildiraklarini yeydi va aerotenklarda cho‘kib, ishchi hajmni siqib chiqaradi.",
          "Qum tutgich barcha inshootlardan oldin o‘rnatiladi va o‘z oqimi bilan ishlaydi: qabul kamerasi tezlikni so‘ndiradi, qum shlam zonasiga cho‘kadi, tiniqlashgan suv yarim botiq to‘siq orqali chiqadi.",
          "Qator yuzaga 25 m/soatdan oshmaydigan yuklamaga hisoblangan. Bunda 0,10 mm dan yirik kvars zarrasi ushlanadi — uning cho‘kish tezligi 6,9 mm/s. KMK me’yori 0,20–0,25 mm zarralarni ushlashni talab qiladi, ularning cho‘kish tezligi uch barobar yuqori, ya’ni zaxira ikki karra.",
        ],
        forWhom: [
          { title: "Avtoyuvish shoxobchalari", text: "Abrazivning asosiy manbai: kuzov va g‘ildiraklardagi qum." },
          { title: "Qurilish maydonchalari", text: "Chiqishda g‘ildiraklarni yuvish, tuproq yo‘llardan oqava." },
          { title: "ShAQSh va avtoturargohlar", text: "Neft tutgich oldidagi birinchi bosqich." },
          { title: "Yomg‘ir kanalizatsiyasi", text: "Yo‘l va aylanma maydonchalardan chiqish joylari." },
        ],
        includes: [
          "Qattiqlik qovurg‘alari bilan shishatolali plastik korpus",
          "Tezlik so‘ndirgichli qabul kamerasi",
          "Chiqishda yarim botiq to‘siq",
          "So‘rib olish uchun chuqurchali shlam zonasi",
          "Bo‘yinlar, qopqoqlar va ulanish patrubkalari",
          "Mahsulot pasporti va foydalanish qo‘llanmasi",
        ],
        notIncluded: [
          "Yer ishlari va kotlovan qazish",
          "Beton tayyorlash va korpusni betonlash",
          "Yo‘l ostiga o‘rnatishda temir-beton yuk tushiruvchi plita",
          "Mahsulotgacha va undan keyingi tashqi kanalizatsiya tarmoqlari",
          "Shlamni davriy so‘rib olish",
        ],
        limits: [
          {
            title: "Qum tutgich neft tutgich o‘rnini bosmaydi",
            text: "U qum va og‘ir muallaq zarralarni ushlaydi, lekin neft mahsulotlari undan o‘tib ketadi. Bu birinchi bosqich, mustaqil tozalash inshooti emas.",
          },
          {
            title: "So‘rib olish jadval bo‘yicha majburiy",
            text: "To‘lgan shlam zonasi ishlashdan to‘xtaydi: qum keyingi bosqichga chiqa boshlaydi. Zona hajmi har 1 l/s hisobiy sarf uchun 300 litrga hisoblangan, davriylik obyektdagi haqiqiy qum miqdoriga qarab belgilanadi.",
          },
          {
            title: "Mayda muallaq zarralar ushlanmaydi",
            text: "0,10 mm dan mayda zarralar va gilli muallaq zarralar oqilona vaqt ichida gravitatsiya bilan cho‘kmaydi. Ular uchun koagulyatsiya yoki filtratsiya kerak.",
          },
        ],
        useTitle: "Qayerda qo‘llaniladi",
        limitsTitle: "Buyurtmadan oldin bilish kerak",
        includesTitle: "Yetkazib berishga kiradi",
        notIncludedTitle: "Yetkazib berishga kirmaydi",
        howToChoose:
          "O‘lcham shu chiqishdagi neft tutgich bilan bir xil olinadi: ular bitta sarfga hisoblanadi va komplekt bo‘lib sotiladi. Alohida o‘rnatilsa, sarf bir vaqtda ishlaydigan yuvish postlari soni yoki KMK 2.04.03-19 bo‘yicha suv yig‘ish maydoni va yomg‘ir jadalligi bilan hisoblanadi.",
        materialValue: "shishatolali plastik, izoftal poliefir smolasi",
        ventValue: "deflektorli DN110 stoyak",
        powerValue: "yo‘q, o‘z oqimi bilan ishlaydi",
        installValue: "yer osti, beton qobiqda",
        modelWord: "Qum tutgich",
        ctaTitle: "Separator bilan komplektda\nqum tutgich tanlaymiz.",
        ctaText:
          "Maydoncha rejasi va qoplama turlarini yuboring. Sarf hisobi, qum tutgich va neft tutgichning yagona komplekt tanlovini hamda ijro sxemasini qaytaramiz.",
        ctaButton: "TANLOVNI SO‘RASH",
        priceLabel: "NARXI",
        priceText:
          "Narx komplektatsiya, lyuklarning yuklama sinfi va montaj ishlari hajmiga bog‘liq. Ariza yuboring — ish kuni davomida javob beramiz.",
        tableTitle: "O‘lchamlar qatori",
        specsTitle: "Texnik tavsiflar",
        allModels: "Liniyaning barcha modellari",
        backToLine: "Liniyaga qaytish",
      },
      tanks: {
        name: "Rezervuarlar va tenglashtirgichlar",
        labels: {
          size: "Gabaritlar (⌀ × uzunlik)",
          volumeGross: "Geometrik hajm",
        },
        tagline:
          "Tenglashtirish, to‘plash, yong‘in va texnologik suv zaxirasi uchun 1–50 m³ shishatolali plastik idishlar",
        intro: [
          "Rezervuar oqava notekis kelib, tozalash esa bir tekis uzatishni talab qilgan joyda kerak. Tozalash inshootlari oldidagi tenglashtirgich to‘satdan tashlamalarni yumshatadi; to‘plovchi idish texnik yoki yong‘in suvi zaxirasini saqlaydi; oraliq rezervuar texnologik sxema bosqichlarini ajratadi.",
          "Korpus gorizontal silindrik, izoftal poliefir smolasidagi shishatolali plastikdan. Silindr estetika uchun emas: bir xil devor qalinligida u tashqi bosimni to‘rtburchak qutidan bir necha barobar yaxshi ko‘taradi.",
          "Yer osti idishining asosiy ko‘rsatkichi — qobiqning yer osti suvi bosimiga chidamliligi. Qattiqlik halqalarisiz silliq qobiq 1,2–2,7 kPa da, ya’ni rezervuar ustidagi 12–27 santimetr suvda ezila boshlaydi. Har 800 mm da halqalar bilan kritik bosim 70–73 kPa gacha ko‘tariladi — bir metr suv ustuniga nisbatan yetti karra zaxira. Shu sababli halqalar butun qatorda majburiy.",
        ],
        forWhom: [
          { title: "Oqavani tenglashtirish", text: "Tozalash inshootlari oldida sarf va tarkibni tenglashtirish." },
          { title: "Suv to‘plash", text: "Texnik va yong‘inga qarshi zaxira, sug‘orish uchun bufer." },
          { title: "Oraliq idishlar", text: "Sxema bosqichlarini ajratish, yuvish suvlarini qabul qilish." },
          { title: "Reagent xo‘jaligi", text: "Eritmalarni tayyorlash va saqlash idishlari." },
        ],
        includes: [
          "Shishatolali plastikdan silindrik korpus",
          "800 mm qadam bilan qattiqlik halqalari",
          "Lyuklar soniga mos bo‘yinlar va qopqoqlar",
          "Zichlash muftalari bilan ulanish patrubkalari",
          "Deflektorli ventilyatsiya stoyakasi",
          "Mahsulot pasporti va foydalanish qo‘llanmasi",
        ],
        notIncluded: [
          "Yer ishlari va kotlovan qazish",
          "Asos beton plitasi va suzib chiqishga qarshi ankerlash",
          "Yer osti suvi yuqori bo‘lganda korpusni betonlash",
          "Nasoslar, aralashtirgichlar, sath o‘lchagichlar va avtomatika",
          "Mahsulotgacha va undan keyingi tashqi tarmoqlar",
        ],
        limits: [
          {
            title: "Bo‘sh rezervuar suzib chiqadi",
            text: "Yer osti suvi yuqori bo‘lganda bo‘sh idish yuqoriga itariladi. Asos beton plitasiga hisobiy massa bilan ankerlash kerak — bu hisobni biz mahsulot bilan birga beramiz, plita va ankerlashni esa qurilish tashkiloti bajaradi.",
          },
          {
            title: "Teskari ko‘mish — konstruksiyaning bir qismi",
            text: "Ko‘mish qatlam-qatlam, toshsiz qum bilan, butun perimetr bo‘ylab zichlab va idish suvga to‘ldirilgan holda olib boriladi. Ko‘mish tartibining buzilishi korpus deformatsiyasining eng ko‘p uchraydigan sababi va bunga kafolat tarqalmaydi.",
          },
          {
            title: "Ortiqcha ichki bosimga mo‘ljallanmagan",
            text: "Mahsulot atmosfera bosimida ishlaydi. Ventilyatsiya stoyakasi ochiq bo‘lishi shart: yopiq ventilyatsiyada so‘rib olish siyraklanish hosil qilib, korpusni ichkaridan ezadi.",
          },
        ],
        useTitle: "Qayerda qo‘llaniladi",
        limitsTitle: "Buyurtmadan oldin bilish kerak",
        includesTitle: "Yetkazib berishga kiradi",
        notIncludedTitle: "Yetkazib berishga kirmaydi",
        howToChoose:
          "Tenglashtirgich uchun hajm kelish grafigi bo‘yicha hisoblanadi: odatda o‘rtacha sarfning 4–8 soati, to‘satdan tashlamalarda — haqiqiy tashlama hajmi bo‘yicha. To‘plovchi idish uchun — talab qilinadigan zaxira bo‘yicha. Sutkalik suv chiqarish grafigini yoki idish vazifasini va yer osti suvi sathini yuboring — hajmni tanlab, ankerlash hisobini beramiz.",
        materialValue: "shishatolali plastik, izoftal poliefir smolasi",
        ventValue: "deflektorli DN110 stoyak, majburiy",
        powerValue: "yo‘q",
        installValue: "loyiha bo‘yicha yer osti yoki yer usti",
        modelWord: "Rezervuar",
        ctaTitle: "Hajmni tanlab\nankerlashni hisoblaymiz.",
        ctaText:
          "Idish vazifasi, kerakli hajm va maydonchadagi yer osti suvi sathini yuboring. Tanlov, chidamlilik hisobi va quruvchilar uchun o‘rnatish sxemasini qaytaramiz.",
        ctaButton: "TANLOVNI SO‘RASH",
        priceLabel: "NARXI",
        priceText:
          "Narx hajm, laminat qalinligi, lyuklar soni va sinfi, ichki to‘siqlar mavjudligiga bog‘liq. Ariza yuboring — ish kuni davomida javob beramiz.",
        tableTitle: "O‘lchamlar qatori",
        specsTitle: "Texnik tavsiflar",
        allModels: "Liniyaning barcha modellari",
        backToLine: "Liniyaga qaytish",
      },
      "pump-stations": {
        name: "KNS — kanalizatsiya nasos stansiyalari",
        labels: { size: "Gabaritlar (⌀ × chuqurlik)", volumeGross: "Geometrik hajm" },
        tagline:
          "Maishiy va ishlab chiqarish oqavalarini haydash uchun shishatolali plastik nasos stansiyasi korpuslari",
        intro: [
          "Nasos stansiyasi o‘z oqimi bilan haydash imkonsiz bo‘lgan joyda kerak: chiqish belgisi kollektordan past, qishloq ko‘tarilish ortida, yerto‘la qavati. Korpus oqavani qabul qiladi, pusk va to‘xtash sathlari orasida to‘playdi va bosimli quvur orqali uzatadi.",
          "Biz korpus, yo‘naltiruvchilar, tayanch tirsaklar, xizmat maydonchasi va ichki quvur ulanishini ishlab chiqaramiz. Nasoslar, kalqovichli datchiklar va boshqaruv shkafi sotib olinadi: aniq obyektning sarfi va bosimiga qarab tanlanadi.",
          "Sathlar orasidagi foydali hajm taxminan emas, nasosning ruxsat etilgan pusklar soni bo‘yicha hisoblanadi: V = Q · t / 4, bunda t — minimal sikl, 7,5 kVt gacha nasoslar uchun o‘n daqiqa, kuchliroqlari uchun o‘n besh daqiqa. Kichikroq hajm tez-tez pusk va ikkinchi yilda kuygan dvigatel demakdir.",
        ],
        forWhom: [
          { title: "Qishloq va turar joylar", text: "Maishiy oqavani shahar kollektoriga haydash." },
          { title: "Tijorat obyektlari", text: "Chiqishi tarmoq belgisidan past kafe, mehmonxona, avtoyuvish." },
          { title: "Sanoat maydonchalari", text: "Ishlab chiqarish oqavasi, sanoat-yomg‘ir chiqishlari." },
          { title: "Yomg‘ir kanalizatsiyasi", text: "Chuqurlashtirilgan maydonchalardan yomg‘ir suvini haydash." },
        ],
        includes: [
          "Qattiqlik halqalari bilan silindrik shishatolali plastik korpus",
          "Nasoslar uchun yo‘naltiruvchilar va tayanch tirsaklar",
          "Teskari klapan va zadvijkali ichki bosim quvurlari",
          "Xizmat maydonchasi va zinapoya",
          "Lyukli bo‘yin va ulanish patrubkalari",
          "Mahsulot pasporti va foydalanish qo‘llanmasi",
        ],
        notIncluded: [
          "Nasoslar, kalqovichli sath datchiklari, boshqaruv shkafi",
          "Yer ishlari, asos beton plitasi va ankerlash",
          "Yer osti suvi yuqori bo‘lganda korpusni betonlash",
          "Tashqi o‘z oqimli va bosimli tarmoqlar",
          "Elektr ta’minoti va kabel liniyalari",
        ],
        limits: [
          {
            title: "3000 mm chuqurlik — katalog o‘lchami, loyiha emas",
            text: "Haqiqiy chuqurlik keluvchi kollektor tagi belgisi va muzlash chuqurligi bilan aniqlanadi. Jadvalda tipik o‘lcham keltirilgan; korpus topshiriq bo‘yicha kerakli chuqurlikka tayyorlanadi.",
          },
          {
            title: "Bitta emas, ikkita nasos",
            text: "Bittasi ishchi, bittasi zaxira, avtomatik ulanish bilan. Yagona nasosli stansiya ta’mirlash vaqtida butun obyektni to‘xtatadi, kanalizatsiya esa kutolmaydi.",
          },
          {
            title: "Ventilyatsiya majburiy",
            text: "Qabul rezervuarida vodorod sulfid hosil bo‘ladi: u xodimlar uchun xavfli va beton bilan metallni yemiradi. Kirish-chiqish stoyakasi va gaz analizatorisiz kirishni taqiqlash — rasmiyatchilik emas.",
          },
        ],
        useTitle: "Qayerda qo‘llaniladi",
        limitsTitle: "Buyurtmadan oldin bilish kerak",
        includesTitle: "Yetkazib berishga kiradi",
        notIncludedTitle: "Yetkazib berishga kirmaydi",
        howToChoose:
          "To‘rtta kattalik kerak: oqavaning hisobiy sarfi, geodezik ko‘tarilish balandligi, bosimli quvurning uzunligi va diametri, keluvchi kollektor tagi belgisi. Ular bo‘yicha nasosning ishchi nuqtasi va korpus chuqurligi hisoblanadi. Shu ma’lumotlarni yoki trassa profilini yuboring — stansiyani nasoslar bo‘yicha tavsiya bilan birga tanlab beramiz.",
        materialValue: "shishatolali plastik, izoftal poliefir smolasi",
        ventValue: "kirish-chiqish, DN110 stoyak",
        powerValue: "tanlangan nasoslar bo‘yicha, 380 V",
        installValue: "yer osti, ankerlangan beton plitada",
        modelWord: "KNS",
        ctaTitle: "Stansiyani nasoslar bilan\nbirga hisoblaymiz.",
        ctaText:
          "Sarf, ko‘tarilish balandligi, bosim liniyasi uzunligi va keluvchi kollektor belgisini yuboring. Korpus tanlovi, nasoslar ishchi nuqtasi va o‘rnatish sxemasini qaytaramiz.",
        ctaButton: "TANLOVNI SO‘RASH",
        priceLabel: "NARXI",
        priceText:
          "Narx korpus chuqurligi, nasoslar markasi, quvur ulanishi va avtomatika tarkibiga bog‘liq. Ariza yuboring — ish kuni davomida javob beramiz.",
        tableTitle: "O‘lchamlar qatori",
        specsTitle: "Texnik tavsiflar",
        allModels: "Liniyaning barcha modellari",
        backToLine: "Liniyaga qaytish",
      },
      "bio-plants": {
        name: "LOI — lokal tozalash inshootlari",
        labels: { sludge: "Il stabilizatori hajmi", retention: "Aerotenkda turib qolish vaqti" },
        tagline:
          "Shishatolali plastik korpusda maishiy oqavalarni 1–25 m³/sut biologik tozalash",
        intro: [
          "Shahar kanalizatsiyasi yo‘q joyda uy, kafe yoki mehmonxona oqavasini joyida tozalashga to‘g‘ri keladi. Lokal tozalash inshootlari buni biologik yo‘l bilan bajaradi: aerotenkdagi mikroorganizmlar organikani oksidlaydi, keyin il cho‘ktirgichda ajralib, qaytadan qaytariladi.",
          "Qator maishiy oqavaga hisoblangan: BPK₅ 300 mg/l, umumiy azot 50 mg/l, aholi jon boshiga sutkasiga 200 litr — KMK 2.04.03-19 bo‘yicha. Il yoshi 15 sutka, il dozasi 2,8 g/l, aerotenkda turib qolish vaqti 13,5 soat: bu organikani oksidlash uchun ham, nitrifikatsiya uchun ham yetarli.",
          "Kislorodga bo‘lgan ehtiyoj DWA-A 131 bo‘yicha hisoblanadi va 0,6 uzatish koeffitsienti hamda mayda pufakli aeratsiyaning 24 foiz samaradorligi bilan standart sharoitga keltiriladi. Shundan havo sarfi olinadi, unga qarab havo puflagich tanlanadi. Il bo‘yicha zaxira butun qatorda 96 sutka, ya’ni taxminan uch oyda bir marta so‘rib olish.",
        ],
        forWhom: [
          { title: "Xususiy uylar va kottejlar", text: "Bitta qurilmaga bir nechta xonadon." },
          { title: "Kafe va mehmon uylari", text: "Oshxona oqavasi yog‘ tutgichdan, keyin LOIga boradi." },
          { title: "Mehmonxona va dam olish maskanlari", text: "Mavsumiy yuklama, ertalab va kechqurun to‘satdan oqim." },
          { title: "Yo‘l bo‘yi obyektlari", text: "Kafeli ShAQSh, motellar, dam olish maydonchalari." },
        ],
        includes: [
          "Ichki zonalashtirilgan shishatolali plastik korpus",
          "Qabul-tenglashtirish kamerasi",
          "Mayda pufakli aeratsiya tizimli aerotenk",
          "Il qaytarishli ikkilamchi cho‘ktirgich",
          "Ortiqcha il stabilizatori",
          "Il qaytarish va haydash erliftlari, bo‘yinlar va lyuklar",
          "Mahsulot pasporti va foydalanish qo‘llanmasi",
        ],
        notIncluded: [
          "Havo puflagich va boshqaruv shkafi — havo sarfi bo‘yicha tanlanadi",
          "Yer ishlari, asos beton plitasi va ankerlash",
          "Qurilmagacha va undan keyingi tashqi kanalizatsiya tarmoqlari",
          "Elektr ta’minoti va kabel liniyalari",
          "Umumiy ovqatlanish bo‘lsa, oshxona chiqishidagi yog‘ tutgich",
          "Barqarorlashtirilgan ilni davriy so‘rib olish",
        ],
        limits: [
          {
            title: "Biologiya uzilishlarga chidamaydi",
            text: "Elektr bir sutkadan ortiq uzilsa il nobud bo‘ladi va qurilma rejimga qayta ikki-uch haftada chiqadi. Tarmoqda uzilishlar bo‘ladigan obyektlar uchun zaxira quvvat manbai kerak.",
          },
          {
            title: "Xlor, erituvchi va to‘satdan yog‘ ilni o‘ldiradi",
            text: "Xlorli vositalar, bo‘yoq, erituvchi yoki katta hajmdagi yog‘ tashlanishi biologiyani to‘xtatadi. Oshxona oqavasi albatta yog‘ tutgichdan o‘tishi shart.",
          },
          {
            title: "Mavsumiy yuklama alohida hisob talab qiladi",
            text: "Yiliga uch oy ishlaydigan dam olish maskani doimiy yashaydigan uyga teng emas: il mavsumga ulgurib o‘smaydi. Bunday obyektlar mavsumdan oldin ishga tushirish rejimi bilan alohida hisoblanadi.",
          },
        ],
        useTitle: "Qayerda qo‘llaniladi",
        limitsTitle: "Buyurtmadan oldin bilish kerak",
        includesTitle: "Yetkazib berishga kiradi",
        notIncludedTitle: "Yetkazib berishga kirmaydi",
        howToChoose:
          "Tanlov xonalar soni bo‘yicha emas, sarf bo‘yicha boradi. Sarf doimiy yashovchilar soni va KMK 2.04.03-19 me’yori bo‘yicha, kafe va mehmonxonalar uchun — sanitariya jihozlari va o‘rinlar soni bo‘yicha hisoblanadi. Oqava tahlili bo‘lsa yuboring: BPK 300 mg/l dan yuqori bo‘lsa, o‘lcham bir pog‘ona yuqoriga suriladi.",
        materialValue: "shishatolali plastik, izoftal poliefir smolasi",
        ventValue: "kirish-chiqish, DN110 stoyak",
        powerValue: "havo puflagich bo‘yicha, 15 m³/sut gacha 220 V",
        installValue: "yer osti, ankerlangan beton plitada",
        modelWord: "LOI",
        ctaTitle: "Sarfni hisoblab\nqurilmani tanlaymiz.",
        ctaText:
          "Yashovchilar soni yoki sanitariya jihozlari tarkibi, oshxona mavjudligi va yer osti suvi sathini yuboring. Sarf hisobi, o‘lcham tanlovi va o‘rnatish sxemasini qaytaramiz.",
        ctaButton: "TANLOVNI SO‘RASH",
        priceLabel: "NARXI",
        priceText:
          "Narx o‘lcham, havo puflagich va avtomatika bilan komplektatsiya, lyuklarning yuklama sinfiga bog‘liq. Ariza yuboring — ish kuni davomida javob beramiz.",
        tableTitle: "O‘lchamlar qatori",
        specsTitle: "Texnik tavsiflar",
        allModels: "Liniyaning barcha modellari",
        backToLine: "Liniyaga qaytish",
      },
      chlorinators: {
        name: "Xloratorlar — NaOCl elektroliz qurilmalari",
        labels: { motor: "Iste'mol quvvati", size: "Rama gabaritlari" },
        tagline:
          "Osh tuzidan obyektning o‘zida natriy gipoxlorit ishlab chiqarish — suvni keltiriladigan reagentsiz zararsizlantirish",
        intro: [
          "Natriy gipoxlorit — ichimlik va texnik suvni zararsizlantirishning asosiy reagenti. Uni kanistrlarda tashish mumkin, yoki obyektning o‘zida ishlab chiqarish mumkin: tuz va tayyorlangan suv elektroliz yacheykasidan o‘tadi va 6–8 g/l faol xlorli eritma hosil bo‘ladi. Eritma to‘plovchi bakka yig‘iladi va suvga dozalanadi.",
          "Bunday konsentratsiyali elektroliz eritmasi kam xavfli hisoblanadi: 19 % li tovar gipoxloritdan farqli ravishda, u birinchi sinf kimyoviy reagentlar ombori va maxsus transport talab qilmaydi. Sarf materiali — oddiy osh tuzi.",
          "Stansiyani biz yig‘amiz: rama, boshqaruv shkafi, tuz saturator baki, eritma to‘plovchi baki, quvur ulanishi va armatura. Elektroliz yacheykasi va to‘g‘rilagich — ishonchli ishlab chiqaruvchilarning sotib olinadigan uzellari; pasportlari mahsulot bilan beriladi.",
          "Tuz sarfi — 1 kg faol xlorga 3,2 kg, elektr energiyasi — 4,5 kVt·soat. Eritma baki sakkiz soatlik uzluksiz ishga mo‘ljallangan.",
        ],
        forWhom: [
          { title: "Suv kanallari va qishloqlar", text: "Quduq va suv olish inshootlari suvini zararsizlantirish." },
          { title: "Basseynlar", text: "Reagent sotib olish o‘rniga joyida gipoxlorit tayyorlash." },
          { title: "Oziq-ovqat korxonalari", text: "Sanitariya ishlovi va texnik suvni zararsizlantirish." },
          { title: "Tozalash inshootlari", text: "Tashlashdan oldin tozalangan oqavani zararsizlantirish." },
        ],
        includes: [
          "O‘zimiz yig‘adigan rama va boshqaruv shkafi",
          "Namakob filtrli tuz saturator baki",
          "Gipoxlorit eritmasi to‘plovchi baki",
          "Quvur ulanishi, armatura va namuna olgichlar",
          "Elektroliz yacheykasi va to‘g‘rilagich — pasportli komplektlar",
          "Shef-montaj va ishga tushirish",
          "Mahsulot pasporti va foydalanish qo‘llanmasi",
        ],
        notIncluded: [
          "Stansiya oldidagi yumshatgich — suv tahlili bo‘yicha tanlanadi, majburiy",
          "Kiritish nuqtasiga eritma dozalash nasosi — sarf bo‘yicha tanlanadi",
          "Xona kirish-chiqish ventilyatsiyasi",
          "Elektr ta'minoti va kabel liniyalari",
          "Osh tuzi",
        ],
        limits: [
          {
            title: "Yacheyka oldida suvni yumshatish majburiy",
            text: "Qattiqlik 1 mg-ekv/l dan yuqori bo‘lsa, elektrodlarda kalsiy karbonat cho‘kadi va yacheyka bir necha haftada quvvatini yo‘qotadi. O‘zbekistonda suv deyarli hamma joyda qattiq, shuning uchun yumshatgich opsiya emas, ishlash sharti. Suv tahlili bo‘yicha tanlanadi va stansiya sxemasiga kiradi.",
          },
          {
            title: "Elektroliz vodorod ajratadi",
            text: "1 kg faol xlorga 0,315 m³ vodorod ajraladi. Stansiya xonasida majburiy ventilyatsiya bo‘lishi kerak: hisobiy minimum har bir model tavsifida ko‘rsatilgan, lekin soatiga xona hajmining kamida 10 karra almashinuvi. Bu xavfsizlik talabi va ishga tushirishda tekshiriladi.",
          },
          {
            title: "Eritma — tovar gipoxlorit emas",
            text: "Stansiya 190 g/l konsentrat emas, 6–8 g/l eritma ishlab chiqaradi. Dozalash liniyasi va bak hajmi aynan shu konsentratsiyaga hisoblanadi.",
          },
        ],
        useTitle: "Qayerda qo‘llaniladi",
        limitsTitle: "Buyurtmadan oldin bilish kerak",
        includesTitle: "Yetkazib berishga kiradi",
        notIncludedTitle: "Yetkazib berishga kirmaydi",
        howToChoose:
          "O‘lcham faol xlor dozasi va ishlanadigan suv sarfi bilan aniqlanadi: stansiyaning g/soat = doza (mg/l) × sarf (m³/soat). Ichimlik suvi uchun tipik doza 1–3 mg/l, tozalangan oqava uchun 3–10 mg/l. Sarf va suv vazifasini yuboring — dozani hisoblab, model va yumshatgichni tanlaymiz.",
        materialValue: "rama — qoplamali po‘lat, baklar — polietilen",
        ventValue: "majburiy, vodorodni suyultirish bo‘yicha",
        powerValue: "220/380 V, o‘lchamga qarab",
        installValue: "isitiladigan xonada",
        modelWord: "Xlorator",
        ctaTitle: "Dozani hisoblab\nstansiyani tanlaymiz.",
        ctaText:
          "Suv sarfi, vazifasi va qattiqlik tahlilini yuboring. Stansiya, yumshatgich tanlovi va xonaga talablarni qaytaramiz.",
        ctaButton: "TANLOVNI SO‘RASH",
        priceLabel: "NARXI",
        priceText:
          "Narx o‘lcham, yacheyka markasi hamda yumshatgich va dozalash liniyasi komplektatsiyasiga bog‘liq. Tavsiflar hisobiy bo‘lib, buyurtmada yacheyka pasporti bo‘yicha aniqlashtiriladi. Ariza yuboring — ish kuni davomida javob beramiz.",
        tableTitle: "O‘lchamlar qatori",
        specsTitle: "Texnik tavsiflar",
        allModels: "Liniyaning barcha modellari",
        backToLine: "Liniyaga qaytish",
      },
      dosing: {
        name: "Reagent dozalash stansiyalari",
        labels: { motor: "Aralashtirgich quvvati", size: "Rama gabaritlari", tankSol: "Sarf baki" },
        tagline:
          "Reagentlarni tayyorlash va uzatishning tayyor uzellari: koagulyant, flokulyant, gipoxlorit, pH korreksiyasi",
        intro: [
          "Dozalash stansiyasi — bu umumiy ramadagi aralashtirgichli sarf baki, ikkita dozalash nasosi va quvur ulanishi. Reagent bakda ishchi konsentratsiyagacha tayyorlanadi va suv sarfiga mutanosib yoki datchik signali bo‘yicha kiritish nuqtasiga uzatiladi.",
          "Rama, bak, aralashtirgich, quvur ulanishi va shkafni biz yig‘amiz. Dozalash nasoslari — sotib olinadi: marka va o‘lcham reagent sarfi va kiritish nuqtasidagi bosim bo‘yicha tanlanadi, pasportlar mahsulot bilan beriladi.",
          "Nasoslar doim ikkita — ishchi va zaxira. Dozalash to‘xtamasligi kerak: tozalash inshootlarida koagulyant to‘xtasa, bir necha daqiqadan keyin muallaq zarralar o‘tib ketadi.",
          "O‘lcham sarf baki hajmi bilan belgilanadi — yuz litrdan bir kubometrgacha. Hajm bitta to‘ldirish kamida bir sutkalik ishga yetadigan qilib tanlanadi.",
        ],
        forWhom: [
          { title: "Tozalash inshootlari", text: "Cho‘ktirish va flotatsiya oldidan koagulyant va flokulyant." },
          { title: "Suv tayyorlash", text: "Gipoxlorit, pH korreksiyasi, membranalar uchun ingibitorlar." },
          { title: "Basseynlar", text: "Datchiklar bo‘yicha gipoxlorit va pH korrektori dozalash." },
          { title: "Sanoat", text: "Sarf o‘lchagich bo‘yicha texnologik reagentlar uzatish." },
        ],
        includes: [
          "O‘zimiz yig‘adigan rama va to‘kilma yig‘uvchi poddon",
          "Qopqoq va sath o‘lchagichli polietilen sarf baki",
          "Elektr yuritmali aralashtirgich",
          "Ikkita dozalash nasosi — ishchi va zaxira, pasportlari bilan",
          "So‘rish va bosim quvurlari, purkash klapani",
          "Boshqaruv shkafi",
          "Mahsulot pasporti va foydalanish qo‘llanmasi",
        ],
        notIncluded: [
          "Reagentlar",
          "Mutanosib dozalash uchun sarf va sifat datchiklari",
          "Stansiyadan kiritish nuqtasigacha quvur",
          "Elektr ta'minoti va kabel liniyalari",
        ],
        limits: [
          {
            title: "Materiallar reagentga qarab tanlanadi",
            text: "Gipoxlorit, kislota va ishqorlar membrana, klapan va zichlagichlarning turli materiallarini talab qiladi. «Istalgan reagentga» universal stansiya yo‘q: buyurtmada nima va qanday konsentratsiyada dozalanishi albatta ko‘rsatiladi.",
          },
          {
            title: "Polimer boshqacha tayyorlanadi",
            text: "Flokulyant eritmaning sekin yetilishini va past tezlikli aralashtirgichni talab qiladi — oddiy stansiya unga to‘g‘ri kelmaydi. Polimer uchun ikki kamerali variant yig‘amiz, bu alohida komplektatsiya.",
          },
          {
            title: "Aniqlik kalibrlash bilan saqlanadi",
            text: "Dozalash nasosi o‘lchov silindri bo‘yicha tekshirilgunicha aniq. Kalibrlash kolonkasi quvur ulanishiga kiradi, tekshirish tartibi qo‘llanmada — oyiga bir marta, besh daqiqa.",
          },
        ],
        useTitle: "Qayerda qo‘llaniladi",
        limitsTitle: "Buyurtmadan oldin bilish kerak",
        includesTitle: "Yetkazib berishga kiradi",
        notIncludedTitle: "Yetkazib berishga kirmaydi",
        howToChoose:
          "Uchta kattalik kerak: reagent va uning ishchi konsentratsiyasi, mg/l dagi talab qilinadigan doza va ishlanadigan suv sarfi. Ulardan eritmaning soatlik sarfi hisoblanadi, u bo‘yicha nasoslar va bak hajmi tanlanadi. Shu ma'lumotlarni yuboring — reagentingizga mos materiallar bilan stansiya tanlovini qaytaramiz.",
        materialValue: "rama — qoplamali po‘lat, bak — polietilen",
        ventValue: "dozalanadigan reagentga qarab",
        powerValue: "220 V",
        installValue: "xonada, tekis polda",
        modelWord: "Stansiya",
        ctaTitle: "Reagentingizga mos\nstansiya tanlaymiz.",
        ctaText:
          "Reagent, doza va suv sarfini yuboring. Nasoslar tanlovi, bak hajmi va kimyoga mos zichlagich materiallarini qaytaramiz.",
        ctaButton: "TANLOVNI SO‘RASH",
        priceLabel: "NARXI",
        priceText:
          "Narx bak hajmi, nasoslar markasi va reagentga mos materiallarga bog‘liq. Ariza yuboring — ish kuni davomida javob beramiz.",
        tableTitle: "O‘lchamlar qatori",
        specsTitle: "Texnik tavsiflar",
        allModels: "Liniyaning barcha modellari",
        backToLine: "Liniyaga qaytish",
      },
    },
  },
  en: {
    label: "PRODUCT RANGE",
    navLabel: "Products",
    teaserTitle: "Models\nand parameters.",
    teaserText: "Size ranges with complete technical data: dimensions, working volume, retention time, connection sizes and weight. Every model has its own page.",
    teaserButton: "VIEW ALL PRODUCTS",
    title: "Equipment made\nat our own plant.",
    intro:
      "The size ranges are calculated to code and verified hydraulically. Every model is not an \"about this big\" guess but the result of a calculation: retention time, surface loading and accumulation volume have been checked across the whole range.",
    specLabels: {
      q: "Design flow rate",
      ns: "Nominal size NS",
      qd: "Design flow rate",
      vol: "Nominal volume",
      pe: "Population equivalent",
      diameter: "Shell diameter",
      depth: "Shell depth",
      useful: "Working volume between levels",
      vaer: "Aeration tank volume",
      air: "Air flow",
      motor: "Blower power",
      rings: "Stiffening rings",
      pcr: "Critical buckling pressure",
      pumps: "Number of pumps",
      cl: "Active chlorine",
      saltd: "Salt consumption",
      h2: "Hydrogen release",
      ventMin: "Ventilation, minimum",
      tankSol: "Solution tank",
      tankSalt: "Salt saturator tank",
      size: "Dimensions (L × W × H)",
      volumeGross: "Gross volume",
      volumeWork: "Working volume",
      retention: "Retention time",
      area: "Surface area",
      load: "Hydraulic loading",
      fat: "Grease accumulation volume",
      sludge: "Inlet and sludge zone",
      material: "Shell material",
      laminate: "Laminate thickness",
      mass: "Dry weight",
      dn: "Connection inlet / outlet",
      hatches: "Number of manhole covers",
      vent: "Ventilation",
      power: "Power consumption",
      install: "Installation method",
    },
    lines: {
      "grease-traps": {
        name: "Grease traps",
        tagline:
          "Separation of fats and food waste from kitchen wastewater before discharge into the municipal sewer",
        intro: [
          "Kitchen wastewater carries fats of animal and vegetable origin, food waste and detergents. As it cools, the grease congeals on pipe walls and inside the city network, causing blockages, failures and claims from the water utility.",
          "The grease trap is installed on the kitchen outlet upstream of the connection to the municipal sewer. It works by gravity: no pumps, no power supply, no controls.",
          "The real difficulty in a restaurant kitchen is not dirt but temperature. Effluent from deep fryers, combi steamers and dishwashers arrives at 45–60 °C, where grease stays liquid and does not float. It rises only after cooling to roughly 30 °C. That is why the entire range is designed for a retention time of at least 79 minutes — enough for both cooling and separation.",
        ],
        forWhom: [
          { title: "Restaurants and cafes", text: "Full-cycle kitchen with a deep fryer and a dishwasher." },
          { title: "Food courts and canteens", text: "Several kitchens on one outlet, heavy peak discharge." },
          { title: "Bakeries and patisseries", text: "Wastewater with a high content of vegetable fats." },
          { title: "Meat and fish shops", text: "Animal fats, a high share of suspended solids." },
          { title: "Hotels", text: "In-house restaurant, banquet halls." },
          { title: "Food production", text: "Process wastewater from processing shops." },
        ],
        includes: [
          "GRP shell with stiffening ribs",
          "Internal semi-submerged baffles",
          "Inlet flow calmer and outlet siphon",
          "Removable food waste basket, AISI 304 stainless steel",
          "Necks and covers matching the number of manhole covers",
          "Connection spigots with sealing gaskets",
          "Ventilation riser with a deflector",
          "Product data sheet and operating manual",
        ],
        notIncluded: [
          "Earthworks and excavation of the pit",
          "Concrete bedding and concrete encasement of the shell",
          "Reinforced concrete load-distributing slab for installation under traffic",
          "External sewer lines upstream and downstream of the unit",
          "Container for used deep-fryer oil",
          "Periodic pump-out of the grease mass and sludge",
        ],
        limits: [
          {
            title: "Emulsified grease cannot be separated by gravity",
            text: "Detergents and dishwashing gels turn grease into an emulsion that passes straight through the unit. This is a property of the physics of the process, not a flaw in the design of the unit.",
          },
          {
            title: "The 1.0 mg/l limit is unreachable by gravity separation",
            text: "Resolution No. 11 of the Cabinet of Ministers of Uzbekistan, 03.02.2010 sets the limit for fats at 1.0 mg/l. No gravity grease trap — domestic or imported — delivers that value. Single-digit mg/l requires dissolved air flotation.",
          },
          {
            title: "Used oil must not be poured in",
            text: "Deep-fryer oil disables the unit within one or two weeks. It needs a separate container and a disposal contract.",
          },
          {
            title: "Biological additives are prohibited",
            text: "Enzymes and emulsifiers sold \"to dissolve grease\" do not remove it; they push it further into the city network, where it congeals.",
          },
        ],
        useTitle: "Where it is used",
        limitsTitle: "What to know before ordering",
        includesTitle: "Included in the delivery",
        notIncludedTitle: "Not included",
        howToChoose:
          "The model is selected by the peak flow of the kitchen effluent, not by the number of seats. Peak flow is defined by the set of process equipment: sinks, dishwashers, combi steamers. Send us the equipment list — we will select the size and provide an as-built drawing for the builders.",
        materialValue: "GRP, isophthalic polyester resin",
        ventValue: "DN110 riser with a deflector",
        powerValue: "none, gravity operation",
        installValue: "underground, in a concrete encasement",
        modelWord: "Grease trap",
        ctaTitle: "We will select the size\nfor your site.",
        ctaText:
          "Send us the list of kitchen equipment and the sewer invert level at the tie-in point. We will return the model selection, the price and an as-built drawing for the civil works.",
        ctaButton: "REQUEST A SELECTION",
        priceLabel: "PRICE",
        priceText:
          "The price depends on the scope of supply, the load class of the manhole covers and the volume of installation work. Send a request — we reply within one business day.",
        tableTitle: "Size range",
        specsTitle: "Technical specifications",
        allModels: "All models in the line",
        backToLine: "Back to the line",
      },
      "oil-separators": {
        name: "Oil separators",
        labels: {
          area: "Effective separation area",
          load: "Specific surface load",
          fat: "Oil storage volume",
          sludge: "Sludge trap chamber",
        },
        tagline:
          "Removal of oil, fuel and suspended solids from car wash, filling station, parking and industrial yard runoff",
        intro: [
          "Runoff from car washes, filling stations, parking decks and open yards carries oil products, sand and fine suspended solids. In the sewer, oil forms a film and suppresses biological treatment at the municipal plant; in the ground it contaminates soil and groundwater.",
          "The separator is installed at the outlet of the paved area and works by gravity. Three stages in one shell: a sludge trap chamber, a gravity zone for coarse droplets, and a coalescing lamella module that merges fine droplets and lifts them to the surface.",
          "The range is calculated from droplet rise velocity (Stokes law). For a 100 µm droplet at an oil density of 850 kg/m³ and a water temperature of 15 °C the rise velocity is 2.58 m/h. The specific load on the effective area is set at 1.72 m/h across the whole range — a safety factor of 1.5 against the calculated velocity.",
          "Sizes are designated by nominal flow in litres per second, as in EN 858-2: НЕФ-10 means 10 l/s, that is 36 m³/h.",
        ],
        forWhom: [
          { title: "Car washes", text: "Bay runoff: oil, sand and abrasives. Installed together with a sand trap." },
          { title: "Filling stations", text: "Dispensing area and tanker unloading pad." },
          { title: "Parking decks", text: "Floor washing, snow melt, drip from vehicles." },
          { title: "Service stations", text: "Component washing bays, oil change area." },
          { title: "Industrial yards", text: "Open storage and equipment parking areas." },
          { title: "Storm drainage", text: "Outlets from driveways, roads and turning areas." },
        ],
        includes: [
          "GRP shell with stiffening ribs",
          "Sludge trap chamber with inlet flow diffuser",
          "Coalescing lamella module, 20 mm plate spacing",
          "Semi-submerged baffles and outlet siphon",
          "Necks and covers according to the number of manholes",
          "Connection stubs with sealing sleeves",
          "Vent stack with cowl",
          "Product passport and operating manual",
        ],
        notIncluded: [
          "Earthworks and excavation",
          "Concrete bedding and encasement of the shell",
          "Reinforced concrete relief slab where installed under traffic",
          "External sewer lines before and after the unit",
          "Automatic closure float — option",
          "Sorption polishing unit — option",
          "Periodic removal of oil and sludge",
        ],
        limits: [
          {
            title: "1.0 mg/l cannot be reached by gravity",
            text: "Uzbekistan Cabinet Resolution No. 11 of 03.02.2010 sets the oil limit at 1.0 mg/l. A coalescing separator reliably delivers 5 mg/l — Class I under EN 858-1 and the best result achievable without chemicals. Single digits in mg/l require a sorption stage after the separator, and its service life has to be calculated separately.",
          },
          {
            title: "Emulsions do not separate",
            text: "Car shampoos, degreasers and active foam turn oil into a stable emulsion that passes straight through the separator. This is the physics of the process, not a property of the unit. Where active chemistry is used, coagulation or dissolved air flotation is required.",
          },
          {
            title: "Sand must be retained ahead of the pack",
            text: "Abrasives clog the lamella module. The built-in sludge chamber is sized at 200 litres per 1 l/s. Where sand carry-over is high — car washes, construction sites, unpaved approaches — a separate sand trap is needed upstream.",
          },
          {
            title: "Design flow is not pipe diameter",
            text: "For storm runoff the flow is calculated from rainfall intensity and catchment area to KMK 2.04.03-19; for a car wash, from the number of bays working simultaneously. Selecting by the diameter of the existing pipe is wrong by a factor of several in either direction.",
          },
        ],
        useTitle: "Where it is used",
        limitsTitle: "What to know before ordering",
        includesTitle: "Included in supply",
        notIncludedTitle: "Not included in supply",
        howToChoose:
          "For a car wash the size follows from the number of bays working at the same time: one high-pressure unit draws 1.2–1.8 m³/h. For filling stations, parking decks and storm outlets it follows from the catchment area and the design rainfall intensity to KMK 2.04.03-19. Send the site plan with levels and surface types and we will return the flow calculation and the selected size.",
        materialValue: "GRP, isophthalic polyester resin",
        ventValue: "DN110 stack with cowl",
        powerValue: "none, gravity operation",
        installValue: "buried, in a concrete encasement",
        modelWord: "Oil separator",
        ctaTitle: "We will calculate the flow\nfor your site.",
        ctaText:
          "Send the site plan, the paved area and surface types, and the sewer level at the connection point. We will return the design flow, the selected size and a construction drawing for the civil works.",
        ctaButton: "REQUEST A SELECTION",
        priceLabel: "PRICE",
        priceText:
          "The price depends on the configuration, the load class of the covers, whether a sorption unit is included, and the scope of installation work. Send an enquiry — we reply within one working day.",
        tableTitle: "Size range",
        specsTitle: "Technical data",
        allModels: "All models in the line",
        backToLine: "Back to the line",
      },
      "sand-traps": {
        name: "Sand traps",
        labels: { sludge: "Sludge zone volume" },
        tagline:
          "Retention of sand, abrasives and heavy solids before the main treatment stage",
        intro: [
          "Sand and abrasives arrive from car washes, construction sites, unpaved approaches and open yards. Further down the line they clog the lamella packs of oil separators, wear out pump impellers and settle in aeration tanks, taking up working volume.",
          "The sand trap is installed first, ahead of everything else, and works by gravity: the inlet chamber kills the velocity, sand drops into the sludge zone, and clarified water leaves through a semi-submerged baffle.",
          "The range is designed for a surface load of no more than 25 m/h. At that load a quartz particle from 0.10 mm upwards is retained — its settling velocity is 6.9 mm/s. KMK requires retention of 0.20–0.25 mm particles, which settle three times faster, so the margin is twofold.",
        ],
        forWhom: [
          { title: "Car washes", text: "The main source of abrasives: sand off bodywork and wheels." },
          { title: "Construction sites", text: "Wheel washing at the exit, runoff from unpaved roads." },
          { title: "Filling stations and parking", text: "First stage ahead of the oil separator." },
          { title: "Storm drainage", text: "Outlets from driveways and turning areas." },
        ],
        includes: [
          "GRP shell with stiffening ribs",
          "Inlet chamber with velocity diffuser",
          "Semi-submerged outlet baffle",
          "Sludge zone with a sump for emptying",
          "Necks, covers and connection stubs",
          "Product passport and operating manual",
        ],
        notIncluded: [
          "Earthworks and excavation",
          "Concrete bedding and encasement of the shell",
          "Reinforced concrete relief slab where installed under traffic",
          "External sewer lines before and after the unit",
          "Periodic removal of sludge",
        ],
        limits: [
          {
            title: "A sand trap does not replace an oil separator",
            text: "It removes sand and heavy solids, but oil passes straight through. This is a first stage, not a standalone treatment unit.",
          },
          {
            title: "Emptying on schedule is mandatory",
            text: "A full sludge zone stops working and sand starts carrying over. The zone is sized at 300 litres per 1 l/s of design flow; the emptying interval follows from the actual sand load on site.",
          },
          {
            title: "Fine solids are not retained",
            text: "Particles below 0.10 mm and clay suspensions do not settle by gravity in any reasonable time. They require coagulation or filtration.",
          },
        ],
        useTitle: "Where it is used",
        limitsTitle: "What to know before ordering",
        includesTitle: "Included in supply",
        notIncludedTitle: "Not included in supply",
        howToChoose:
          "The size matches the oil separator on the same outlet: both are designed for the same flow and are sold as a set. Where the sand trap stands alone, the flow follows from the number of wash bays working simultaneously, or from the catchment area and rainfall intensity to KMK 2.04.03-19.",
        materialValue: "GRP, isophthalic polyester resin",
        ventValue: "DN110 stack with cowl",
        powerValue: "none, gravity operation",
        installValue: "buried, in a concrete encasement",
        modelWord: "Sand trap",
        ctaTitle: "We will size the trap\nand the separator together.",
        ctaText:
          "Send the site plan and the surface types. We will return the flow calculation, a matched sand trap and oil separator set, and a construction drawing.",
        ctaButton: "REQUEST A SELECTION",
        priceLabel: "PRICE",
        priceText:
          "The price depends on the configuration, the load class of the covers and the scope of installation work. Send an enquiry — we reply within one working day.",
        tableTitle: "Size range",
        specsTitle: "Technical data",
        allModels: "All models in the line",
        backToLine: "Back to the line",
      },
      tanks: {
        name: "Tanks and balancing vessels",
        labels: {
          size: "Dimensions (⌀ × length)",
          volumeGross: "Geometric volume",
        },
        tagline:
          "GRP vessels from 1 to 50 m³ for balancing, storage, fire reserve and process water",
        intro: [
          "A tank is needed wherever the inflow is uneven while treatment demands a steady feed. A balancing vessel ahead of a treatment plant absorbs surge discharges; a storage vessel holds process or fire water; an intermediate tank separates the stages of a process scheme.",
          "The shell is a horizontal cylinder in GRP on isophthalic polyester resin. The cylinder is not an aesthetic choice: at the same wall thickness it withstands external pressure an order of magnitude better than a rectangular box.",
          "The governing parameter for a buried vessel is shell stability against groundwater. A plain shell without stiffening rings buckles at 1.2–2.7 kPa — that is 12 to 27 centimetres of water above the crown. With rings every 800 mm the critical pressure rises to 70–73 kPa, a sevenfold margin against one metre of water. This is why rings are mandatory across the whole range.",
        ],
        forWhom: [
          { title: "Flow balancing", text: "Evening out flow and load ahead of a treatment plant." },
          { title: "Water storage", text: "Process and fire reserve, irrigation buffer." },
          { title: "Intermediate vessels", text: "Separating process stages, receiving backwash water." },
          { title: "Chemical dosing", text: "Preparation and storage vessels for solutions." },
        ],
        includes: [
          "Cylindrical GRP shell",
          "Stiffening rings at 800 mm spacing",
          "Necks and covers according to the number of manholes",
          "Connection stubs with sealing sleeves",
          "Vent stack with cowl",
          "Product passport and operating manual",
        ],
        notIncluded: [
          "Earthworks and excavation",
          "Concrete base slab and anti-flotation anchoring",
          "Concrete encasement where groundwater is high",
          "Pumps, mixers, level sensors and controls",
          "External lines before and after the unit",
        ],
        limits: [
          {
            title: "An empty tank floats",
            text: "With a high water table an empty vessel is pushed upwards. It has to be anchored to a concrete base slab of calculated mass — we supply that calculation with the product, but the slab and the anchoring are built by the contractor.",
          },
          {
            title: "Backfill is part of the structure",
            text: "Backfill is placed in layers, with stone-free sand, compacted evenly around the full perimeter, and with the vessel filled with water. Departing from that sequence is the most common cause of shell deformation, and it is not covered by the warranty.",
          },
          {
            title: "Not designed for internal overpressure",
            text: "The vessel works at atmospheric pressure. The vent stack must stay clear: a blocked vent during pump-out creates a vacuum that collapses the shell from inside.",
          },
        ],
        useTitle: "Where it is used",
        limitsTitle: "What to know before ordering",
        includesTitle: "Included in supply",
        notIncludedTitle: "Not included in supply",
        howToChoose:
          "For a balancing vessel the volume follows from the inflow profile: usually 4 to 8 hours of average flow, or the actual surge volume where discharges are batched. For storage it follows from the required reserve. Send the daily discharge profile or the duty of the vessel together with the groundwater level, and we will size it and supply the anchoring calculation.",
        materialValue: "GRP, isophthalic polyester resin",
        ventValue: "DN110 stack with cowl, mandatory",
        powerValue: "none",
        installValue: "buried or above ground, per design",
        modelWord: "Tank",
        ctaTitle: "We will size the vessel\nand calculate the anchoring.",
        ctaText:
          "Send the duty of the vessel, the required volume and the groundwater level on site. We will return the selection, the stability calculation and an installation drawing for the contractor.",
        ctaButton: "REQUEST A SELECTION",
        priceLabel: "PRICE",
        priceText:
          "The price depends on the volume, laminate thickness, the number and load class of manholes, and any internal baffles. Send an enquiry — we reply within one working day.",
        tableTitle: "Size range",
        specsTitle: "Technical data",
        allModels: "All models in the line",
        backToLine: "Back to the line",
      },
      "pump-stations": {
        name: "Sewage pumping stations",
        labels: { size: "Dimensions (⌀ × depth)", volumeGross: "Geometric volume" },
        tagline:
          "GRP pumping station shells for domestic and industrial wastewater",
        intro: [
          "A pumping station is needed wherever gravity will not do: the outlet sits below the sewer, the settlement lies beyond a rise, the floor is a basement. The shell receives the flow, stores it between start and stop levels and delivers it through a rising main.",
          "We manufacture the shell, the guide rails, the duck-foot bends, the service platform and the internal pipework. Pumps, float switches and the control panel are bought in and selected for the flow and head of the particular site.",
          "The working volume between levels is not estimated by eye but calculated from the permitted number of pump starts: V = Q · t / 4, where t is the minimum cycle — ten minutes for pumps up to 7.5 kW and fifteen for larger ones. A smaller volume means frequent starts and a burnt-out motor in the second year.",
        ],
        forWhom: [
          { title: "Settlements and housing", text: "Pumping domestic wastewater into the municipal sewer." },
          { title: "Commercial buildings", text: "Cafés, hotels and car washes with outlets below sewer level." },
          { title: "Industrial sites", text: "Process wastewater and industrial storm outlets." },
          { title: "Storm drainage", text: "Pumping rainwater from sunken areas." },
        ],
        includes: [
          "Cylindrical GRP shell with stiffening rings",
          "Guide rails and duck-foot bends for the pumps",
          "Internal rising pipework with check valves and gate valves",
          "Service platform and ladder",
          "Neck with cover and connection stubs",
          "Product passport and operating manual",
        ],
        notIncluded: [
          "Pumps, float level switches, control panel",
          "Earthworks, concrete base slab and anchoring",
          "Concrete encasement where groundwater is high",
          "External gravity and rising mains",
          "Power supply and cabling",
        ],
        limits: [
          {
            title: "3000 mm depth is a catalogue figure, not a design one",
            text: "The real depth follows from the invert level of the incoming sewer and the frost depth. The table gives a typical size; the shell is manufactured to the depth required by the brief.",
          },
          {
            title: "Two pumps, not one",
            text: "One duty, one standby, with automatic changeover. A station with a single pump shuts the whole site down during a repair, and sewage does not wait.",
          },
          {
            title: "Ventilation is mandatory",
            text: "Hydrogen sulphide forms in the wet well: it is dangerous to personnel and destroys concrete and steel. A supply and extract stack, and a ban on entry without a gas detector, are not a formality.",
          },
        ],
        useTitle: "Where it is used",
        limitsTitle: "What to know before ordering",
        includesTitle: "Included in supply",
        notIncludedTitle: "Not included in supply",
        howToChoose:
          "Four figures are needed: the design flow, the static lift, the length and diameter of the rising main, and the invert level of the incoming sewer. From these the pump duty point and the shell depth follow. Send them, or the route profile, and we will return a complete station selection together with a pump recommendation.",
        materialValue: "GRP, isophthalic polyester resin",
        ventValue: "supply and extract, DN110 stack",
        powerValue: "per selected pumps, 380 V",
        installValue: "buried, on an anchored concrete slab",
        modelWord: "Pumping station",
        ctaTitle: "We will size the station\ntogether with the pumps.",
        ctaText:
          "Send the flow, the static lift, the length of the rising main and the invert level of the incoming sewer. We will return the shell selection, the pump duty point and an installation drawing.",
        ctaButton: "REQUEST A SELECTION",
        priceLabel: "PRICE",
        priceText:
          "The price depends on the shell depth, the pump make, the pipework and the control system. Send an enquiry — we reply within one working day.",
        tableTitle: "Size range",
        specsTitle: "Technical data",
        allModels: "All models in the line",
        backToLine: "Back to the line",
      },
      "bio-plants": {
        name: "Package wastewater treatment plants",
        labels: { sludge: "Sludge holding volume", retention: "Retention in the aeration tank" },
        tagline:
          "Biological treatment of domestic wastewater, 1 to 25 m³/day, in a GRP shell",
        intro: [
          "Where there is no municipal sewer, the wastewater of a house, a café or a hotel has to be treated on site. A package plant does this biologically: micro-organisms in the aeration tank oxidise the organics, the sludge is then separated in the settler and returned.",
          "The range is designed for domestic wastewater: BOD₅ 300 mg/l, total nitrogen 50 mg/l, 200 litres per person per day to KMK 2.04.03-19. Sludge age is taken as 15 days, MLVSS 2.8 g/l, retention in the aeration tank 13.5 hours — enough both to oxidise the organics and to nitrify.",
          "The oxygen demand is calculated to DWA-A 131 and converted to standard conditions with an alpha factor of 0.6 and a fine-bubble transfer efficiency of 24 per cent. The air flow follows from that, and the blower is selected from the air flow. Sludge holding is 96 days across the range, that is emptying roughly every three months.",
        ],
        forWhom: [
          { title: "Houses and cottages", text: "One to five households on a single unit." },
          { title: "Cafés and guest houses", text: "Kitchen wastewater passes a grease trap first." },
          { title: "Hotels and resorts", text: "Seasonal load, morning and evening surges." },
          { title: "Roadside facilities", text: "Filling stations with cafés, motels, rest areas." },
        ],
        includes: [
          "GRP shell with internal zoning",
          "Inlet and balancing chamber",
          "Aeration tank with a fine-bubble aeration system",
          "Secondary settler with sludge return",
          "Excess sludge holding compartment",
          "Airlifts for sludge return and transfer, necks and covers",
          "Product passport and operating manual",
        ],
        notIncluded: [
          "Blower and control panel — selected from the air flow",
          "Earthworks, concrete base slab and anchoring",
          "External sewer lines before and after the plant",
          "Power supply and cabling",
          "Grease trap on the kitchen outlet where catering is present",
          "Periodic removal of stabilised sludge",
        ],
        limits: [
          {
            title: "Biology does not tolerate interruptions",
            text: "If the power is off for more than a day the sludge dies and the plant needs two to three weeks to recover. Sites with an unreliable supply need a backup source.",
          },
          {
            title: "Chlorine, solvents and slugs of grease kill the sludge",
            text: "Discharging chlorine-based cleaners, paints, solvents or a large volume of grease stops the biology. Kitchen wastewater must pass through a grease trap.",
          },
          {
            title: "Seasonal load needs a separate calculation",
            text: "A resort working three months a year is not equivalent to a permanently occupied house: the sludge does not build up in time for the season. Such sites are calculated separately, with a start-up regime before the season.",
          },
        ],
        useTitle: "Where it is used",
        limitsTitle: "What to know before ordering",
        includesTitle: "Included in supply",
        notIncludedTitle: "Not included in supply",
        howToChoose:
          "Selection follows the flow, not the number of rooms. The flow is calculated from the number of permanent occupants and the discharge rate to KMK 2.04.03-19; for cafés and hotels, from the sanitary fittings and the number of covers. If an effluent analysis exists, send it: above 300 mg/l BOD the size moves up one step.",
        materialValue: "GRP, isophthalic polyester resin",
        ventValue: "supply and extract, DN110 stack",
        powerValue: "per blower, 220 V up to 15 m³/day",
        installValue: "buried, on an anchored concrete slab",
        modelWord: "Treatment plant",
        ctaTitle: "We will calculate the flow\nand select the plant.",
        ctaText:
          "Send the number of occupants or the sanitary fittings, whether there is a kitchen, and the groundwater level. We will return the flow calculation, the selected size and an installation drawing.",
        ctaButton: "REQUEST A SELECTION",
        priceLabel: "PRICE",
        priceText:
          "The price depends on the size, whether a blower and controls are included, and the load class of the covers. Send an enquiry — we reply within one working day.",
        tableTitle: "Size range",
        specsTitle: "Technical data",
        allModels: "All models in the line",
        backToLine: "Back to the line",
      },
      chlorinators: {
        name: "On-site sodium hypochlorite generators",
        labels: { motor: "Power consumption", size: "Skid dimensions" },
        tagline:
          "Sodium hypochlorite produced on site from common salt — water disinfection without trucked-in chemicals",
        intro: [
          "Sodium hypochlorite is the workhorse disinfectant for drinking and process water. It can be trucked in as concentrate, or produced on site: salt and softened water pass through an electrolytic cell, yielding a solution of 6–8 g/l active chlorine that accumulates in a storage tank and is dosed from there.",
          "At this concentration the solution is low-hazard: unlike 19 % commercial hypochlorite it needs no chemical warehouse and no special transport. The only consumable is common salt.",
          "We build the station: the frame, the control cabinet, the salt saturator, the solution storage tank, the pipework and valves. The electrolytic cell and the rectifier are bought-in units from established makers; their datasheets are handed over with the product.",
          "Salt consumption is 3.2 kg per kilogram of active chlorine, energy 4.5 kWh per kilogram. The solution tank holds eight hours of continuous output.",
        ],
        forWhom: [
          { title: "Waterworks and settlements", text: "Disinfection of well and intake water." },
          { title: "Swimming pools", text: "On-site hypochlorite instead of purchased chemicals." },
          { title: "Food plants", text: "Sanitation and process water disinfection." },
          { title: "Treatment plants", text: "Disinfection of treated effluent before discharge." },
        ],
        includes: [
          "Frame and control cabinet of our own build",
          "Salt saturator tank with brine filter",
          "Hypochlorite solution storage tank",
          "Pipework, valves and sampling points",
          "Electrolytic cell and rectifier — bought-in units with datasheets",
          "Supervised installation and commissioning",
          "Product passport and operating manual",
        ],
        notIncluded: [
          "Water softener upstream — selected from the water analysis, mandatory",
          "Dosing pump to the injection point — selected from the flow",
          "Room supply and extract ventilation",
          "Power supply and cabling",
          "Salt",
        ],
        limits: [
          {
            title: "Softening ahead of the cell is mandatory",
            text: "Above 1 meq/l of hardness, calcium carbonate plates onto the electrodes and the cell loses output within weeks. Water in Uzbekistan is hard almost everywhere, so the softener is not an option but a condition of operation. It is selected from the water analysis and is part of the station scheme.",
          },
          {
            title: "Electrolysis releases hydrogen",
            text: "Each kilogram of active chlorine releases 0.315 m³ of hydrogen. The room needs forced ventilation: the calculated minimum is given for each model, and never less than ten air changes per hour. This is a safety requirement checked at commissioning.",
          },
          {
            title: "The solution is not commercial hypochlorite",
            text: "The station produces 6–8 g/l solution, not 190 g/l concentrate. The dosing line and tank volume are sized for that concentration — swapping the station for drums one-for-one does not work, nor the reverse.",
          },
        ],
        useTitle: "Where it is used",
        limitsTitle: "What to know before ordering",
        includesTitle: "Included in supply",
        notIncludedTitle: "Not included in supply",
        howToChoose:
          "The size follows from the chlorine dose and the water flow: station g/h = dose (mg/l) × flow (m³/h). Typical doses are 1–3 mg/l for drinking water and 3–10 mg/l for treated effluent. Send the flow and the duty of the water — we will calculate the dose and select the model and its softener.",
        materialValue: "coated steel frame, polyethylene tanks",
        ventValue: "forced, sized for hydrogen dilution",
        powerValue: "220/380 V by size",
        installValue: "indoors, heated room",
        modelWord: "Generator",
        ctaTitle: "We will calculate the dose\nand select the station.",
        ctaText:
          "Send the water flow, its duty and a hardness analysis. We will return the station and softener selection and the room requirements.",
        ctaButton: "REQUEST A SELECTION",
        priceLabel: "PRICE",
        priceText:
          "The price depends on the size, the cell make, and whether a softener and dosing line are included. Figures are design values, confirmed against the cell datasheet at order. Send an enquiry — we reply within one working day.",
        tableTitle: "Size range",
        specsTitle: "Technical data",
        allModels: "All models in the line",
        backToLine: "Back to the line",
      },
      dosing: {
        name: "Chemical dosing stations",
        labels: { motor: "Mixer power", size: "Skid dimensions", tankSol: "Day tank" },
        tagline:
          "Ready-built units for preparing and feeding chemicals: coagulant, flocculant, hypochlorite, pH correction",
        intro: [
          "A dosing station is a day tank with a mixer, two dosing pumps and pipework on a common frame. The chemical is made up to working strength in the tank and fed to the injection point in proportion to the water flow or on a sensor signal.",
          "We build the frame, tank, mixer, pipework and cabinet. The dosing pumps are bought in: make and size follow from the chemical flow and the pressure at the injection point, and their datasheets are handed over with the product.",
          "There are always two pumps — duty and standby. Dosing must not stop: losing coagulant at a treatment plant means solids carry-over within minutes.",
          "The size is set by the day tank volume, from one hundred litres to a cubic metre, chosen so one fill lasts at least a day.",
        ],
        forWhom: [
          { title: "Treatment plants", text: "Coagulant and flocculant ahead of settling and flotation." },
          { title: "Water treatment", text: "Hypochlorite, pH correction, antiscalants for membranes." },
          { title: "Swimming pools", text: "Hypochlorite and pH dosing on sensor control." },
          { title: "Industry", text: "Process chemicals fed on a flow-meter signal." },
        ],
        includes: [
          "Frame and spill tray of our own build",
          "Polyethylene day tank with lid and level gauge",
          "Motor-driven mixer",
          "Two dosing pumps — duty and standby, with datasheets",
          "Suction and discharge pipework, injection valve",
          "Control cabinet",
          "Product passport and operating manual",
        ],
        notIncluded: [
          "Chemicals",
          "Flow and quality sensors for proportional dosing",
          "Piping from the station to the injection point",
          "Power supply and cabling",
        ],
        limits: [
          {
            title: "Materials follow the chemical",
            text: "Hypochlorite, acids and alkalis need different diaphragm, valve and seal materials. A universal any-chemical station does not exist: the order must state what is dosed and at what strength.",
          },
          {
            title: "Polymer is prepared differently",
            text: "Flocculant needs slow maturing and a low-speed mixer — a standard station does not suit it. For polymer we build a two-chamber version; it is a separate configuration.",
          },
          {
            title: "Accuracy is held by calibration",
            text: "A dosing pump stays accurate while it is checked against a calibration cylinder. The cylinder is part of the pipework and the check takes five minutes a month, as described in the manual.",
          },
        ],
        useTitle: "Where it is used",
        limitsTitle: "What to know before ordering",
        includesTitle: "Included in supply",
        notIncludedTitle: "Not included in supply",
        howToChoose:
          "Three figures are needed: the chemical and its working strength, the required dose in mg/l, and the water flow. From these the hourly solution flow follows, and from that the pumps and the tank volume. Send them and we will return a selection with materials matched to your chemistry.",
        materialValue: "coated steel frame, polyethylene tank",
        ventValue: "per the chemical dosed",
        powerValue: "220 V",
        installValue: "indoors, on a level floor",
        modelWord: "Station",
        ctaTitle: "We will match the station\nto your chemical.",
        ctaText:
          "Send the chemical, the dose and the water flow. We will return the pump selection, the tank volume and seal materials for your chemistry.",
        ctaButton: "REQUEST A SELECTION",
        priceLabel: "PRICE",
        priceText:
          "The price depends on the tank volume, the pump make and the materials for the chemical. Send an enquiry — we reply within one working day.",
        tableTitle: "Size range",
        specsTitle: "Technical data",
        allModels: "All models in the line",
        backToLine: "Back to the line",
      },
    },
  },
  zh: {
    label: "产品系列",
    navLabel: "产品型号",
    teaserTitle: "型号\n与参数。",
    teaserText: "完整技术参数的规格系列：外形尺寸、有效容积、停留时间、接管尺寸和重量。每个型号均有独立页面。",
    teaserButton: "查看全部产品",
    title: "我们自有工厂\n生产的设备。",
    intro:
      "各规格系列均按规范计算并经水力校核。每一型号都不是「大概这个尺寸」，而是计算结果：停留时间、表面负荷与积存容积在整个系列范围内均已核验。",
    specLabels: {
      q: "设计流量",
      ns: "公称流量 NS",
      qd: "设计流量",
      vol: "公称容积",
      pe: "当量人口",
      diameter: "壳体直径",
      depth: "壳体深度",
      useful: "启停液位间有效容积",
      vaer: "曝气池容积",
      air: "空气量",
      motor: "鼓风机功率",
      rings: "加强环",
      pcr: "临界屈曲压力",
      pumps: "水泵数量",
      cl: "有效氯",
      saltd: "耗盐量",
      h2: "氢气析出量",
      ventMin: "最小通风量",
      tankSol: "溶液箱",
      tankSalt: "饱和盐箱",
      size: "外形尺寸（长 × 宽 × 高）",
      volumeGross: "几何容积",
      volumeWork: "有效容积",
      retention: "停留时间",
      area: "表面积",
      load: "水力负荷",
      fat: "油脂积存容积",
      sludge: "进水及污泥区",
      material: "壳体材料",
      laminate: "层压厚度",
      mass: "干重",
      dn: "进出口接管",
      hatches: "检查井盖数量",
      vent: "通风",
      power: "耗电量",
      install: "安装方式",
    },
    lines: {
      "grease-traps": {
        name: "隔油池",
        tagline:
          "在排入市政污水管网前，从厨房污水中分离油脂与食物残渣",
        intro: [
          "厨房污水中含有动物性和植物性油脂、食物残渣以及洗涤剂。冷却后油脂会在管道内壁和城市管网中凝结，导致堵塞、事故以及供水公司的追责。",
          "隔油池安装在厨房排出口、接入市政污水管网之前。依靠重力自流运行：无需水泵、无需供电、无需自控。",
          "餐厅厨房的真正难点不是污物，而是温度。煎炸炉、万能蒸烤箱和洗碗机的排水温度为 45–60 °C，此时油脂仍为液态而不会上浮，只有冷却至约 30 °C 后才会浮起。因此整个系列均按不低于 79 分钟的停留时间设计，足以完成冷却与分离。",
        ],
        forWhom: [
          { title: "餐厅与咖啡厅", text: "配备煎炸炉和洗碗机的全流程厨房。" },
          { title: "美食广场与食堂", text: "多个厨房共用一个排出口，瞬时排放量大。" },
          { title: "面包房与烘焙店", text: "植物油脂含量高的污水。" },
          { title: "肉类与水产加工间", text: "动物油脂，悬浮物比例高。" },
          { title: "酒店", text: "酒店附属餐厅、宴会厅。" },
          { title: "食品生产企业", text: "加工车间的工艺污水。" },
        ],
        includes: [
          "带加强筋的玻璃钢壳体",
          "内部半潜式隔板",
          "进水稳流装置与出水虹吸",
          "可拆卸食物残渣篮，AISI 304 不锈钢",
          "与检查井盖数量相匹配的井筒与盖板",
          "带密封胶圈的接管短节",
          "带风帽的通风立管",
          "产品合格证与使用说明书",
        ],
        notIncluded: [
          "土方工程与基坑开挖",
          "混凝土垫层及壳体外包混凝土",
          "车行道下安装时的钢筋混凝土卸荷板",
          "设备前后的室外污水管网",
          "废弃煎炸油的储存容器",
          "油脂与污泥的定期抽吸清运",
        ],
        limits: [
          {
            title: "乳化的油脂无法依靠重力分离",
            text: "洗涤剂和洗碗凝胶会使油脂乳化，乳化后的油脂将直接穿过设备。这是工艺物理特性所决定的，而非设备结构的缺陷。",
          },
          {
            title: "1.0 mg/l 的标准无法通过重力法达到",
            text: "乌兹别克斯坦内阁 2010 年 2 月 3 日第 11 号决议将油脂限值规定为 1.0 mg/l。任何重力式隔油池——无论国产还是进口——都无法达到该数值。要达到个位数 mg/l 需采用压力溶气气浮。",
          },
          {
            title: "严禁倾倒废油",
            text: "煎炸油会在一到两周内使设备失效。废油需要单独的储存容器和清运合同。",
          },
          {
            title: "禁止使用生物制剂",
            text: "所谓「溶解油脂」的酶制剂和乳化剂并不能去除油脂，只会把它推向城市管网，在那里重新凝结。",
          },
        ],
        useTitle: "适用场景",
        limitsTitle: "订购前须知",
        includesTitle: "供货范围",
        notIncludedTitle: "不包含内容",
        howToChoose:
          "型号按厨房污水的峰值流量选取，而不是按餐位数量。峰值流量由工艺设备组成决定：水槽、洗碗机、万能蒸烤箱。请发送设备清单——我们将确定规格并提供供施工方使用的竣工图。",
        materialValue: "玻璃钢，间苯型不饱和聚酯树脂",
        ventValue: "带风帽的 DN110 立管",
        powerValue: "无，重力自流运行",
        installValue: "地埋式，混凝土外包",
        modelWord: "隔油池",
        ctaTitle: "我们将为您的项目\n选定规格。",
        ctaText:
          "请发送厨房设备清单和接入点处的污水管标高。我们将回复型号选型、价格以及供土建部分使用的竣工图。",
        ctaButton: "申请选型",
        priceLabel: "价格",
        priceText:
          "价格取决于配置、检查井盖的荷载等级以及安装工作量。请提交询价——我们将在一个工作日内答复。",
        tableTitle: "规格系列",
        specsTitle: "技术参数",
        allModels: "本系列全部型号",
        backToLine: "返回系列",
      },
      "oil-separators": {
        name: "隔油除油器",
        labels: {
          area: "有效分离面积",
          load: "表面负荷",
          fat: "油品蓄积容积",
          sludge: "沉砂集泥室",
        },
        tagline:
          "分离洗车场、加油站、停车场和工业场地雨污水中的石油类物质与悬浮物",
        intro: [
          "洗车场、加油站、停车场和露天场地的排水携带石油类物质、砂粒和细小悬浮物。进入排水管网后，油类形成油膜并抑制市政污水厂的生物处理；渗入地下则污染土壤和地下水。",
          "除油器安装在场地排水出口，重力自流运行。同一壳体内设三级：沉砂集泥室、大油滴重力分离区，以及将细油滴聚并后浮升至水面的聚结斜板模块。",
          "系列按油滴上浮速度（斯托克斯公式）计算。油滴粒径 100 µm、油品密度 850 kg/m³、水温 15 °C 时，上浮速度为 2.58 m/h。全系列有效面积表面负荷取 1.72 m/h，相对计算速度留有 1.5 倍安全裕度。",
          "规格按每秒升数的公称流量标注，与 EN 858-2 一致：НЕФ-10 即 10 l/s，折合 36 m³/h。",
        ],
        forWhom: [
          { title: "洗车场", text: "洗车工位排水：油类、砂粒、磨料。与沉砂池配套安装。" },
          { title: "加油站", text: "加油区与油罐车卸油平台。" },
          { title: "停车场", text: "地面冲洗水、融雪水、车辆滴漏。" },
          { title: "汽车维修站", text: "部件清洗工位、换油作业区。" },
          { title: "工业场地", text: "露天仓库、机械停放场地。" },
          { title: "雨水管网", text: "车行道、道路和回车场的排水出口。" },
        ],
        includes: [
          "带加强肋的玻璃钢壳体",
          "带进水稳流装置的沉砂集泥室",
          "聚结斜板模块，板间距 20 mm",
          "半潜式隔板与出水虹吸",
          "按检修口数量配套的井筒与盖板",
          "带密封套的接管",
          "带风帽的通气立管",
          "产品合格证与使用说明书",
        ],
        notIncluded: [
          "土方工程与基坑开挖",
          "混凝土垫层与壳体包封",
          "行车荷载下的钢筋混凝土卸荷板",
          "设备前后的室外排水管网",
          "自动关闭浮球——选配",
          "吸附深度处理单元——选配",
          "油品与污泥的定期清运",
        ],
        limits: [
          {
            title: "重力法达不到 1,0 mg/l",
            text: "乌兹别克斯坦内阁 2010 年 2 月 3 日第 11 号决议规定石油类限值为 1,0 mg/l。聚结式除油器可稳定达到 5 mg/l，即 EN 858-1 的 I 级，这是不投加药剂条件下的最佳结果。要达到个位数 mg/l，需在除油器后增设吸附单元，其寿命需单独计算。",
          },
          {
            title: "乳化油无法分离",
            text: "洗车液、除油剂和活性泡沫会把油类变成稳定乳液，直接穿过除油器。这是工艺物理特性，不是设备结构问题。使用活性化学品时需要混凝或加压气浮。",
          },
          {
            title: "砂粒必须在斜板前拦截",
            text: "磨料会堵塞斜板模块。设备内置沉砂室按每 1 l/s 200 升设计。砂量大的场合——洗车场、施工场地——需在除油器前单设沉砂池。",
          },
          {
            title: "设计流量不等于管径",
            text: "雨水排放按 KMK 2.04.03-19 的降雨强度和汇水面积计算，洗车场按同时作业的工位数计算。按现有管径选型会产生数倍误差。",
          },
        ],
        useTitle: "适用场合",
        limitsTitle: "订货前须知",
        includesTitle: "供货范围",
        notIncludedTitle: "不含内容",
        howToChoose:
          "洗车场按同时作业的工位数确定规格：一台高压清洗机耗水 1,2–1,8 m³/h。加油站、停车场和雨水排口按汇水面积和 KMK 2.04.03-19 的设计降雨强度确定。请提供带标高和铺装类型的场地平面图，我们将返回流量计算与选型结果。",
        materialValue: "玻璃钢，间苯型聚酯树脂",
        ventValue: "DN110 立管带风帽",
        powerValue: "无，重力自流运行",
        installValue: "埋地安装，混凝土包封",
        modelWord: "除油器",
        ctaTitle: "我们为您的场地\n计算流量。",
        ctaText:
          "请提供场地平面图、铺装面积与类型，以及接入点的排水管标高。我们将返回设计流量、选型结果和土建施工图。",
        ctaButton: "申请选型",
        priceLabel: "价格",
        priceText:
          "价格取决于配置、盖板荷载等级、是否含吸附单元以及安装工作量。请提交询价，我们将在一个工作日内答复。",
        tableTitle: "规格系列",
        specsTitle: "技术参数",
        allModels: "本系列全部型号",
        backToLine: "返回系列",
      },
      "sand-traps": {
        name: "沉砂池",
        labels: { sludge: "集泥区容积" },
        tagline: "在进入主体处理工艺之前拦截砂粒、磨料和重质悬浮物",
        intro: [
          "砂粒和磨料来自洗车场、施工场地、土路和露天场地。在后续工序中，它们会堵塞除油器的斜板模块、磨损水泵叶轮，并在曝气池中沉积、占用有效容积。",
          "沉砂池设在所有构筑物之前，重力自流运行：进水室消能，砂粒落入集泥区，澄清水经半潜式隔板流出。",
          "系列按不超过 25 m/h 的表面负荷设计。在该负荷下可拦截 0,10 mm 以上的石英颗粒——其沉降速度为 6,9 mm/s。KMK 规范要求拦截 0,20–0,25 mm 颗粒，其沉降速度高出三倍，因此有两倍裕度。",
        ],
        forWhom: [
          { title: "洗车场", text: "磨料的主要来源：车身和轮胎上的砂粒。" },
          { title: "施工场地", text: "出口处的车轮冲洗、土路排水。" },
          { title: "加油站与停车场", text: "除油器之前的第一级。" },
          { title: "雨水管网", text: "车行道和回车场的排水出口。" },
        ],
        includes: [
          "带加强肋的玻璃钢壳体",
          "带消能装置的进水室",
          "出水半潜式隔板",
          "带清掏集泥坑的集泥区",
          "井筒、盖板与接管",
          "产品合格证与使用说明书",
        ],
        notIncluded: [
          "土方工程与基坑开挖",
          "混凝土垫层与壳体包封",
          "行车荷载下的钢筋混凝土卸荷板",
          "设备前后的室外排水管网",
          "污泥的定期清运",
        ],
        limits: [
          {
            title: "沉砂池不能替代除油器",
            text: "它去除砂粒和重质悬浮物，但石油类物质会直接穿过。这是第一级，不是独立的处理构筑物。",
          },
          {
            title: "必须按计划清掏",
            text: "集泥区装满后即失效，砂粒会随水流带出。集泥区按每 1 l/s 设计流量 300 升配置，清掏周期依现场实际含砂量确定。",
          },
          {
            title: "细颗粒无法拦截",
            text: "小于 0,10 mm 的颗粒和黏土类悬浮物在合理时间内无法靠重力沉降，需要混凝或过滤。",
          },
        ],
        useTitle: "适用场合",
        limitsTitle: "订货前须知",
        includesTitle: "供货范围",
        notIncludedTitle: "不含内容",
        howToChoose:
          "规格与同一排水口的除油器一致：两者按同一流量设计并成套供货。若单独设置，流量按同时作业的洗车工位数，或按 KMK 2.04.03-19 的汇水面积和降雨强度确定。",
        materialValue: "玻璃钢，间苯型聚酯树脂",
        ventValue: "DN110 立管带风帽",
        powerValue: "无，重力自流运行",
        installValue: "埋地安装，混凝土包封",
        modelWord: "沉砂池",
        ctaTitle: "沉砂池与除油器\n成套选型。",
        ctaText:
          "请提供场地平面图和铺装类型。我们将返回流量计算、沉砂池与除油器的成套选型以及土建施工图。",
        ctaButton: "申请选型",
        priceLabel: "价格",
        priceText: "价格取决于配置、盖板荷载等级和安装工作量。请提交询价，我们将在一个工作日内答复。",
        tableTitle: "规格系列",
        specsTitle: "技术参数",
        allModels: "本系列全部型号",
        backToLine: "返回系列",
      },
      tanks: {
        name: "储罐与调节池",
        labels: {
          size: "外形尺寸（⌀ × 长度）",
          volumeGross: "几何容积",
        },
        tagline: "1–50 m³ 玻璃钢罐体，用于水量调节、储存、消防和工艺用水",
        intro: [
          "当来水不均匀而处理工艺需要稳定进水时，就需要储罐。处理设施前的调节池可削减瞬时冲击负荷；储存罐保有工艺水或消防水；中间罐用于分隔工艺流程的各个阶段。",
          "罐体为卧式圆筒形，采用间苯型聚酯树脂玻璃钢。选择圆筒并非出于外观：在相同壁厚下，它承受外压的能力比矩形箱体高一个数量级。",
          "埋地罐体的关键指标是壳体抵抗地下水压的稳定性。无加强环的光滑壳体在 1,2–2,7 kPa 即失稳，相当于罐顶以上 12–27 厘米水柱。设置间距 800 mm 的加强环后，临界压力提高到 70–73 kPa，相对 1 米水柱有七倍裕度。因此全系列均设加强环。",
        ],
        forWhom: [
          { title: "水量调节", text: "在处理设施前均衡流量与水质。" },
          { title: "储水", text: "工艺与消防储备、灌溉缓冲。" },
          { title: "中间罐", text: "分隔工艺阶段、接纳反冲洗水。" },
          { title: "加药系统", text: "药剂配制与储存罐。" },
        ],
        includes: [
          "圆筒形玻璃钢壳体",
          "间距 800 mm 的加强环",
          "按检修口数量配套的井筒与盖板",
          "带密封套的接管",
          "带风帽的通气立管",
          "产品合格证与使用说明书",
        ],
        notIncluded: [
          "土方工程与基坑开挖",
          "基础混凝土底板与抗浮锚固",
          "地下水位高时的壳体包封",
          "水泵、搅拌器、液位计与控制系统",
          "设备前后的室外管网",
        ],
        limits: [
          {
            title: "空罐会上浮",
            text: "地下水位高时，空罐会被顶起。必须按计算配重锚固在混凝土底板上——该计算随产品提供，底板和锚固由施工单位实施。",
          },
          {
            title: "回填是结构的一部分",
            text: "回填须分层进行，采用无石块砂料，沿全周均匀夯实，且罐内注满水。不按此顺序施工是壳体变形最常见的原因，且不在质保范围内。",
          },
          {
            title: "不承受内部正压",
            text: "罐体按常压工作。通气立管必须畅通：抽水时通气受阻会形成负压，从内部压瘪壳体。",
          },
        ],
        useTitle: "适用场合",
        limitsTitle: "订货前须知",
        includesTitle: "供货范围",
        notIncludedTitle: "不含内容",
        howToChoose:
          "调节池容积按来水曲线确定：通常取平均流量的 4–8 小时；若为间歇排放，则按实际排放量。储存罐按所需储备量确定。请提供日排水曲线或罐体用途以及地下水位，我们将完成选型并提供抗浮计算。",
        materialValue: "玻璃钢，间苯型聚酯树脂",
        ventValue: "DN110 立管带风帽，必设",
        powerValue: "无",
        installValue: "按设计埋地或地上安装",
        modelWord: "储罐",
        ctaTitle: "确定容积\n并计算抗浮锚固。",
        ctaText:
          "请提供罐体用途、所需容积和现场地下水位。我们将返回选型、稳定性计算和供施工使用的安装图。",
        ctaButton: "申请选型",
        priceLabel: "价格",
        priceText: "价格取决于容积、层压厚度、检修口数量与荷载等级以及内部隔板配置。请提交询价，我们将在一个工作日内答复。",
        tableTitle: "规格系列",
        specsTitle: "技术参数",
        allModels: "本系列全部型号",
        backToLine: "返回系列",
      },
      "pump-stations": {
        name: "污水提升泵站",
        labels: { size: "外形尺寸（⌀ × 深度）", volumeGross: "几何容积" },
        tagline: "用于输送生活污水和工业废水的玻璃钢一体化泵站筒体",
        intro: [
          "当重力自流无法实现时就需要泵站：排出口低于市政管网、村镇位于高坡之后、房间位于地下层。筒体接纳来水，在启泵与停泵液位之间蓄存，再经压力管道输出。",
          "我们生产筒体、导轨、耦合底座、检修平台和内部管路。水泵、浮球开关和控制柜为外购件，按具体项目的流量与扬程选型。",
          "启停液位间的有效容积不是估算的，而是按水泵允许启动次数计算：V = Q · t / 4，其中 t 为最小循环周期，7,5 kW 以下水泵取十分钟，更大者取十五分钟。容积偏小意味着频繁启动，第二年电机烧毁。",
        ],
        forWhom: [
          { title: "村镇与住宅", text: "将生活污水提升至市政管网。" },
          { title: "商业建筑", text: "排出口低于管网标高的餐饮、酒店、洗车场。" },
          { title: "工业场地", text: "生产废水、工业雨水排放口。" },
          { title: "雨水管网", text: "下沉场地的雨水提升。" },
        ],
        includes: [
          "带加强环的圆筒形玻璃钢筒体",
          "水泵导轨与耦合底座",
          "带止回阀和闸阀的内部压力管路",
          "检修平台与爬梯",
          "带盖板的井筒与接管",
          "产品合格证与使用说明书",
        ],
        notIncluded: [
          "水泵、浮球液位开关、控制柜",
          "土方工程、基础混凝土底板与锚固",
          "地下水位高时的筒体包封",
          "室外重力管与压力管",
          "供电与电缆敷设",
        ],
        limits: [
          {
            title: "3000 mm 深度是目录值，不是设计值",
            text: "实际深度由来水管管底标高和冻土深度确定。表中给出典型尺寸；筒体按任务书要求的深度制造。",
          },
          {
            title: "两台泵，而不是一台",
            text: "一用一备，自动切换。单泵泵站在检修期间会使整个项目停摆，而污水是不能等的。",
          },
          {
            title: "通风必须设置",
            text: "集水井内会产生硫化氢：对人员有害，并腐蚀混凝土和金属。送排风立管以及未携气体检测仪禁止入井，都不是形式主义。",
          },
        ],
        useTitle: "适用场合",
        limitsTitle: "订货前须知",
        includesTitle: "供货范围",
        notIncludedTitle: "不含内容",
        howToChoose:
          "需要四个数据：设计流量、几何提升高度、压力管道的长度与管径、来水管管底标高。据此确定水泵工作点和筒体深度。请提供这些数据或管线纵剖面，我们将返回整套泵站选型及水泵推荐。",
        materialValue: "玻璃钢，间苯型聚酯树脂",
        ventValue: "送排风，DN110 立管",
        powerValue: "按所选水泵，380 V",
        installValue: "埋地安装，锚固于混凝土底板",
        modelWord: "泵站",
        ctaTitle: "泵站与水泵\n一并核算。",
        ctaText:
          "请提供流量、提升高度、压力管长度和来水管标高。我们将返回筒体选型、水泵工作点和安装图。",
        ctaButton: "申请选型",
        priceLabel: "价格",
        priceText: "价格取决于筒体深度、水泵品牌、管路配置与控制系统。请提交询价，我们将在一个工作日内答复。",
        tableTitle: "规格系列",
        specsTitle: "技术参数",
        allModels: "本系列全部型号",
        backToLine: "返回系列",
      },
      "bio-plants": {
        name: "一体化生活污水处理设备",
        labels: { sludge: "污泥储存容积", retention: "曝气池停留时间" },
        tagline: "玻璃钢壳体内 1–25 m³/d 生活污水生物处理",
        intro: [
          "在没有市政管网的地方，住宅、餐饮或酒店的污水必须就地处理。一体化设备采用生物法：曝气池中的微生物氧化有机物，随后污泥在沉淀区分离并回流。",
          "系列按生活污水设计：BPK₅ 300 mg/l、总氮 50 mg/l、人均日排水量 200 升（KMK 2.04.03-19）。污泥龄取 15 天，污泥浓度 2,8 g/l，曝气池停留时间 13,5 小时——既满足有机物氧化，也满足硝化。",
          "需氧量按 DWA-A 131 计算，并以 0,6 的传质系数和 24% 的微孔曝气效率折算到标准状态。由此得出空气量，再据以选择鼓风机。全系列污泥储存量为 96 天，即约每三个月清掏一次。",
        ],
        forWhom: [
          { title: "独栋住宅与别墅", text: "一台设备可服务一至五户。" },
          { title: "餐饮与民宿", text: "厨房污水先经隔油器再进入设备。" },
          { title: "酒店与度假基地", text: "季节性负荷，早晚出现峰值排放。" },
          { title: "公路沿线设施", text: "带餐饮的加油站、汽车旅馆、服务区。" },
        ],
        includes: [
          "内部分区的玻璃钢壳体",
          "进水调节室",
          "配微孔曝气系统的曝气池",
          "带污泥回流的二沉区",
          "剩余污泥储存区",
          "污泥回流与提升气提装置、井筒与盖板",
          "产品合格证与使用说明书",
        ],
        notIncluded: [
          "鼓风机与控制柜——按空气量选型",
          "土方工程、基础混凝土底板与锚固",
          "设备前后的室外排水管网",
          "供电与电缆敷设",
          "有餐饮时厨房排水口的隔油器",
          "稳定污泥的定期清掏",
        ],
        limits: [
          {
            title: "生物系统经不起中断",
            text: "停电超过一昼夜污泥即死亡，设备需两到三周才能恢复运行。供电不稳定的项目需配备用电源。",
          },
            {
            title: "氯、溶剂和瞬时油脂会杀死污泥",
            text: "排入含氯清洁剂、油漆、溶剂或大量油脂会使生物系统停止工作。厨房污水必须经隔油器。",
          },
          {
            title: "季节性负荷需单独计算",
            text: "一年只运行三个月的度假基地不等同于常住住宅：污泥来不及在旺季前培养起来。此类项目需单独计算，并制定旺季前的启动方案。",
          },
        ],
        useTitle: "适用场合",
        limitsTitle: "订货前须知",
        includesTitle: "供货范围",
        notIncludedTitle: "不含内容",
        howToChoose:
          "选型依据流量，而不是房间数量。流量按常住人数和 KMK 2.04.03-19 的排水定额计算；餐饮和酒店按卫生器具与座位数计算。若有水质分析请一并提供：BPK 高于 300 mg/l 时规格上调一档。",
        materialValue: "玻璃钢，间苯型聚酯树脂",
        ventValue: "送排风，DN110 立管",
        powerValue: "按鼓风机，15 m³/d 以内 220 V",
        installValue: "埋地安装，锚固于混凝土底板",
        modelWord: "处理设备",
        ctaTitle: "核算流量\n并完成设备选型。",
        ctaText:
          "请提供常住人数或卫生器具配置、是否设厨房以及地下水位。我们将返回流量计算、选型结果和安装图。",
        ctaButton: "申请选型",
        priceLabel: "价格",
        priceText: "价格取决于规格、是否含鼓风机与控制系统、盖板荷载等级。请提交询价，我们将在一个工作日内答复。",
        tableTitle: "规格系列",
        specsTitle: "技术参数",
        allModels: "本系列全部型号",
        backToLine: "返回系列",
      },
      chlorinators: {
        name: "次氯酸钠现场发生器",
        labels: { motor: "耗电功率", size: "撬体尺寸" },
        tagline: "用食盐在现场制取次氯酸钠——无需外购药剂的水消毒",
        intro: [
          "次氯酸钠是饮用水和工艺水消毒的主力药剂。它可以整桶外购，也可以现场制取：盐和软化水通过电解槽，生成有效氯 6–8 g/l 的溶液，储存于储液箱并由此投加。",
          "该浓度的电解液属低危险品：与 19% 商品次氯酸钠不同，无需一类化学品仓库和专用运输。唯一消耗品是普通食盐。",
          "站体由我们制造：机架、控制柜、饱和盐箱、储液箱、管路与阀门。电解槽和整流器为成熟厂家的外购件，其技术文件随产品移交。",
          "每公斤有效氯耗盐 3,2 kg、耗电 4,5 kWh。储液箱按连续运行八小时配置。",
        ],
        forWhom: [
          { title: "供水企业与村镇", text: "水井与取水口的饮用水消毒。" },
          { title: "游泳池", text: "现场制取次氯酸钠，替代外购药剂。" },
          { title: "食品企业", text: "卫生处理与工艺用水消毒。" },
          { title: "污水处理设施", text: "排放前对出水消毒。" },
        ],
        includes: [
          "自制机架与控制柜",
          "带盐水过滤器的饱和盐箱",
          "次氯酸钠储液箱",
          "管路、阀门与取样口",
          "电解槽与整流器——附技术文件的外购件",
          "指导安装与调试",
          "产品合格证与使用说明书",
        ],
        notIncluded: [
          "站前软化器——按水质分析选型，必配",
          "投加点计量泵——按流量选型",
          "机房送排风系统",
          "供电与电缆敷设",
          "食盐",
        ],
        limits: [
          {
            title: "电解槽前必须软化",
            text: "硬度高于 1 mmol/l 时碳酸钙在电极上结垢，数周内电解槽产量下降。乌兹别克斯坦水质普遍偏硬，软化器不是选配而是运行条件，按水质分析选型并纳入系统。",
          },
          {
            title: "电解析出氢气",
            text: "每公斤有效氯析出 0,315 m³ 氢气。机房必须强制通风：各型号给出计算最小值，且不低于每小时 10 次换气。这是调试时要验收的安全要求。",
          },
          {
            title: "溶液不是商品次氯酸钠",
            text: "本装置产出 6–8 g/l 溶液，而非 190 g/l 浓缩液。投加管线和箱体容积均按此浓度设计，两者不能一比一互换。",
          },
        ],
        useTitle: "适用场合",
        limitsTitle: "订货前须知",
        includesTitle: "供货范围",
        notIncludedTitle: "不含内容",
        howToChoose:
          "规格由有效氯投加量和处理水量决定：装置 g/h = 剂量 (mg/l) × 流量 (m³/h)。饮用水典型剂量 1–3 mg/l，处理后污水 3–10 mg/l。请提供水量与用途，我们将计算剂量并选配装置与软化器。",
        materialValue: "机架为涂层钢，箱体为聚乙烯",
        ventValue: "强制通风，按氢气稀释计算",
        powerValue: "220/380 V，视规格",
        installValue: "室内采暖房间安装",
        modelWord: "发生器",
        ctaTitle: "计算剂量\n并选配装置。",
        ctaText: "请提供水量、用途和硬度分析。我们将返回装置与软化器选型及机房要求。",
        ctaButton: "申请选型",
        priceLabel: "价格",
        priceText:
          "价格取决于规格、电解槽品牌以及是否配软化器和投加管线。参数为设计值，订货时按电解槽技术文件确认。请提交询价，我们将在一个工作日内答复。",
        tableTitle: "规格系列",
        specsTitle: "技术参数",
        allModels: "本系列全部型号",
        backToLine: "返回系列",
      },
      dosing: {
        name: "加药装置",
        labels: { motor: "搅拌器功率", size: "撬体尺寸", tankSol: "溶药箱" },
        tagline: "药剂配制与投加成套单元：混凝剂、絮凝剂、次氯酸钠、pH 调节",
        intro: [
          "加药装置由带搅拌器的溶药箱、两台计量泵和管路组成，安装在公共机架上。药剂在箱内配制到工作浓度，按水量比例或传感器信号送往投加点。",
          "机架、箱体、搅拌器、管路和控制柜由我们制造。计量泵为外购件：品牌与规格按药剂流量和投加点压力选定，技术文件随产品移交。",
          "水泵始终为两台——一用一备。投加不允许中断：污水厂混凝剂一停，几分钟后悬浮物即穿透。",
          "规格由溶药箱容积决定，从一百升到一立方米，按一次配药至少满足一昼夜运行选取。",
        ],
        forWhom: [
          { title: "污水处理设施", text: "沉淀和气浮前投加混凝剂与絮凝剂。" },
          { title: "水处理", text: "次氯酸钠、pH 调节、膜用阻垢剂。" },
          { title: "游泳池", text: "按传感器投加次氯酸钠和 pH 调节剂。" },
          { title: "工业", text: "按流量计信号投加工艺药剂。" },
        ],
        includes: [
          "自制机架与防漏托盘",
          "带盖和液位计的聚乙烯溶药箱",
          "电动搅拌器",
          "两台计量泵——一用一备，附技术文件",
          "吸入与压出管路、注入阀",
          "控制柜",
          "产品合格证与使用说明书",
        ],
        notIncluded: [
          "药剂",
          "比例投加用流量与水质传感器",
          "装置至投加点的管道",
          "供电与电缆敷设",
        ],
        limits: [
          {
            title: "材料按药剂选定",
            text: "次氯酸钠、酸和碱对隔膜、阀门和密封材料要求各不相同。不存在'任意药剂通用'的装置：订货时必须注明投加什么药剂、什么浓度。",
          },
          {
            title: "高分子药剂另行配制",
            text: "絮凝剂需要缓慢熟化和低速搅拌——标准装置不适用。高分子采用双腔方案，属单独配置。",
          },
          {
            title: "精度靠校准保持",
            text: "计量泵的精度依赖定期用量筒校验。校准柱包含在管路中，校验方法见说明书——每月一次，五分钟。",
          },
        ],
        useTitle: "适用场合",
        limitsTitle: "订货前须知",
        includesTitle: "供货范围",
        notIncludedTitle: "不含内容",
        howToChoose:
          "需要三个数据：药剂及其工作浓度、所需剂量 (mg/l)、处理水量。据此算出溶液小时流量，再确定水泵和箱体容积。请提供这些数据，我们将返回与您的药剂匹配的选型。",
        materialValue: "机架为涂层钢，箱体为聚乙烯",
        ventValue: "视所投药剂而定",
        powerValue: "220 V",
        installValue: "室内平整地面安装",
        modelWord: "装置",
        ctaTitle: "按您的药剂\n选配装置。",
        ctaText: "请提供药剂、剂量和水量。我们将返回水泵选型、箱体容积和适配密封材料。",
        ctaButton: "申请选型",
        priceLabel: "价格",
        priceText: "价格取决于箱体容积、水泵品牌和耐药剂材料。请提交询价，我们将在一个工作日内答复。",
        tableTitle: "规格系列",
        specsTitle: "技术参数",
        allModels: "本系列全部型号",
        backToLine: "返回系列",
      },
    },
  },
};
