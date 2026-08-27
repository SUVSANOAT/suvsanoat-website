"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useLanguage } from "../LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import type { Language } from "../translations";
import { SOLIDS, ANCHORS, VIEW_BOX, FLOW_POINTS, FLOW_LENGTH } from "./isoData";
import s from "./new.module.css";

/* --------------------------------------------------------------
 * НОВАЯ ГЛАВНАЯ СТРАНИЦА
 *
 * Первый экран: живая изометрия установки + строка ввода объекта,
 * которая ведёт в инженерный расчёт.
 * Второй блок: прокрутка вдоль установки — камера идёт от ступени
 * к ступени, показатели пересчитываются.
 *
 * Все числовые значения взяты из проекта SUVSANOAT AVTO-3К
 * (стоки автомойки 20 м³/сут). Норматив — ПКМ РУз № 11 от 03.02.2010.
 * -------------------------------------------------------------- */

/** Показатели на выходе каждой ступени, мг/л */
const VALUES = [
  { ss: 1500, oil: 50, bod: 150 },
  { ss: 110, oil: 4, bod: 130 },
  { ss: 25, oil: 2.5, bod: 115 },
  { ss: 20, oil: 0.5, bod: 90 },
  { ss: 20, oil: 0.5, bod: 10 },
  { ss: 20, oil: 0.5, bod: 10 },
];

const NORMS = { ss: 150, oil: 1, bod: 15 };

const CATEGORY_LINKS = [
  "/catalog/wastewater",
  "/catalog/water-treatment",
  "/catalog/mechanical-treatment",
  "/catalog/pump-equipment",
  "/catalog/disinfection-dosing",
  "/catalog/sludge-treatment",
  "/catalog/aeration-equipment",
  "/catalog/tanks-reservoirs",
  "/catalog/automation",
  "/catalog/valves-pipelines",
  "/catalog/treatment-technologies",
  "/catalog/integrated-solutions",
];

const VB = VIEW_BOX.split(" ").map(Number);
const VB_W = VB[2];
const VB_H = VB[3];
const ZOOM_W = 330;

type NewText = {
  eyebrow: string;
  title: string;
  lead: string;
  askLabel: string;
  askPlaceholder: string;
  askButton: string;
  askHint: string;
  chips: string[];
  journeyLabel: string;
  stages: { title: string; sub: string }[];
  metrics: { ss: string; oil: string; bod: string };
  unit: string;
  normLabel: string;
  source: string;
  makeLabel: string;
  makeTitle: string;
  makeText: string;
  makeCards: { title: string; text: string }[];
  catalogLabel: string;
  catalogTitle: string;
  catalogText: string;
  ctaTitle: string;
  ctaText: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

const T: Record<Language, NewText> = {
  ru: {
    eyebrow: "SUVSANOAT · ИНЖЕНЕРНЫЕ СИСТЕМЫ ВОДООЧИСТКИ",
    title: "Опишите объект.\nПолучите расчёт.",
    lead: "Мы не начинаем с прайса. Сначала считаем: расход, нагрузку, технологию и состав оборудования по нормам КМК Узбекистана. Потом производим — в Ташкенте, на своём участке.",
    askLabel: "Что вы проектируете",
    askPlaceholder: "например: автомойка на 4 поста",
    askButton: "РАССЧИТАТЬ",
    askHint:
      "Расчёт предварительный, занимает около минуты. Ни звонка, ни регистрации.",
    chips: [
      "автомойка на 4 поста",
      "гостиница на 300 человек",
      "молокозавод 200 м³/сут",
      "посёлок на 1 500 жителей",
    ],
    journeyLabel: "ПУТЬ ВОДЫ",
    stages: [
      {
        title: "Приём стока",
        sub: "Усреднитель принимает залповый сброс и отдаёт воду на очистку равномерно. Без него все сооружения пришлось бы считать на пиковый расход.",
      },
      {
        title: "Механическая очистка",
        sub: "Пескоуловитель, отстойник с ламельным блоком и коалесцентный модуль. Здесь уходит основная масса взвеси и нефтепродуктов.",
      },
      {
        title: "Песчаная фильтрация",
        sub: "Кварцевый песок снимает остаточную взвесь. Промывка обратным током по перепаду давления.",
      },
      {
        title: "Сорбция",
        sub: "Активированный уголь забирает то, что не берут песок и отстаивание: остатки нефтепродуктов и запах.",
      },
      {
        title: "Биологическая доочистка",
        sub: "Единственная ступень, которая снимает БПК. Ни отстойник, ни угольный фильтр этого не делают — поэтому её нельзя выбросить из схемы ради экономии.",
      },
      {
        title: "Сброс в канализацию",
        sub: "Контрольный колодец с пробоотборником и расходомером — та самая точка, которую проверяет водоканал.",
      },
    ],
    metrics: {
      ss: "Взвешенные вещества",
      oil: "Нефтепродукты",
      bod: "БПК₅",
    },
    unit: "мг/л",
    normLabel: "норматив",
    source:
      "Расчёт по проекту SUVSANOAT AVTO-3К: стоки автомойки 20 м³/сут. Нормативы приёма в коммунальную канализацию — ПКМ РУз № 11 от 03.02.2010.",
    makeLabel: "СОБСТВЕННОЕ ПРОИЗВОДСТВО",
    makeTitle: "Мы не перепродаём.\nМы делаем.",
    makeText:
      "Корпуса очистных сооружений мы производим в Узбекистане из стеклопластика. Это то, что отличает завод от поставщика: сроки, цена и гарантия зависят от нас, а не от чужого склада.",
    makeCards: [
      {
        title: "Стеклопластик, а не металл",
        text: "Изофталевая полиэфирная смола не боится нефтепродуктов и ПАВ. Металл в стоке автомойки живёт 5–7 лет, стеклопластик — весь срок службы объекта.",
      },
      {
        title: "Толщина под контролем",
        text: "Ламинат 7–8 мм для подземных корпусов, кольца жёсткости с шагом 900 мм, твёрдость по Барколю не ниже 35. Приёмка с толщиномером.",
      },
      {
        title: "Гидроиспытание каждого",
        text: "Каждый корпус стоит под водой 24 часа до отгрузки. Течь на объекте обходится дороже, чем испытание в цехе.",
      },
      {
        title: "Расчёт по нормам КМК",
        text: "КМК 2.04.03-19 и КМК 2.04.01-98, дополненные балансом массы, кинетикой и расчётом потребности в кислороде по DWA-A 131.",
      },
    ],
    catalogLabel: "КАТАЛОГ",
    catalogTitle: "Оборудование\nи технологии.",
    catalogText:
      "От отдельного жироуловителя до комплексных очистных сооружений под ключ.",
    ctaTitle: "Пришлите исходные —\nвернём решение.",
    ctaText:
      "Достаточно понимать, что за объект и сколько воды. Остальное посчитаем сами и покажем, из чего складывается цена.",
    ctaPrimary: "ОТПРАВИТЬ ЗАЯВКУ",
    ctaSecondary: "ИНЖЕНЕРНЫЙ РАСЧЁТ ОНЛАЙН",
  },

  uz: {
    eyebrow: "SUVSANOAT · SUV TOZALASH MUHANDISLIK TIZIMLARI",
    title: "Obyektni tasvirlang.\nHisob-kitobni oling.",
    lead: "Biz narxlar ro‘yxatidan boshlamaymiz. Avval hisoblaymiz: sarf, yuklama, texnologiya va uskunalar tarkibini O‘zbekiston QMQ me’yorlari bo‘yicha. Keyin ishlab chiqaramiz — Toshkentda, o‘z uchastkamizda.",
    askLabel: "Siz nimani loyihalayapsiz",
    askPlaceholder: "masalan: 4 postli avtomoyka",
    askButton: "HISOBLASH",
    askHint:
      "Hisob-kitob dastlabki, taxminan bir daqiqa vaqt oladi. Qo‘ng‘iroq ham, ro‘yxatdan o‘tish ham kerak emas.",
    chips: [
      "4 postli avtomoyka",
      "300 kishilik mehmonxona",
      "sut zavodi 200 m³/sutka",
      "1 500 aholili qishloq",
    ],
    journeyLabel: "SUVNING YO‘LI",
    stages: [
      {
        title: "Oqavani qabul qilish",
        sub: "O‘rtachalashtirgich zalvorli oqimni qabul qiladi va suvni tozalashga bir tekis uzatadi. Usiz barcha inshootlarni eng yuqori sarfga hisoblashga to‘g‘ri kelardi.",
      },
      {
        title: "Mexanik tozalash",
        sub: "Qum tutgich, lamel blokli tindirgich va koalessent modul. Muallaq moddalar va neft mahsulotlarining asosiy qismi shu yerda yo‘qoladi.",
      },
      {
        title: "Qumli filtrlash",
        sub: "Kvars qumi qoldiq muallaq moddalarni ushlaydi. Bosim farqi bo‘yicha teskari oqim bilan yuviladi.",
      },
      {
        title: "Sorbsiya",
        sub: "Faollashtirilgan ko‘mir qum va tindirish ololmaydigan narsani oladi: neft mahsulotlari qoldig‘i va hid.",
      },
      {
        title: "Biologik qo‘shimcha tozalash",
        sub: "BODni kamaytiradigan yagona bosqich. Tindirgich ham, ko‘mir filtri ham buni qilmaydi — shuning uchun uni tejash uchun sxemadan chiqarib tashlab bo‘lmaydi.",
      },
      {
        title: "Kanalizatsiyaga chiqarish",
        sub: "Namuna olgich va sarf o‘lchagichli nazorat qudug‘i — suv kanali tekshiradigan aynan o‘sha nuqta.",
      },
    ],
    metrics: {
      ss: "Muallaq moddalar",
      oil: "Neft mahsulotlari",
      bod: "BOD₅",
    },
    unit: "mg/l",
    normLabel: "me’yor",
    source:
      "SUVSANOAT AVTO-3К loyihasi bo‘yicha hisob: avtomoyka oqava suvlari 20 m³/sutka. Kommunal kanalizatsiyaga qabul qilish me’yorlari — O‘zR VM 03.02.2010 yildagi 11-sonli qarori.",
    makeLabel: "O‘Z ISHLAB CHIQARISHIMIZ",
    makeTitle: "Biz qayta sotmaymiz.\nBiz ishlab chiqaramiz.",
    makeText:
      "Tozalash inshootlari korpuslarini O‘zbekistonda shishaplastikdan ishlab chiqaramiz. Zavodni yetkazib beruvchidan ajratib turadigan narsa shu: muddat, narx va kafolat begona omborga emas, bizga bog‘liq.",
    makeCards: [
      {
        title: "Metall emas, shishaplastik",
        text: "Izoftal poliefir smolasi neft mahsulotlari va SFMdan qo‘rqmaydi. Avtomoyka oqavasida metall 5–7 yil xizmat qiladi, shishaplastik — obyektning butun xizmat muddati davomida.",
      },
      {
        title: "Qalinlik nazorat ostida",
        text: "Yer osti korpuslari uchun 7–8 mm laminat, 900 mm qadam bilan qattiqlik halqalari, Barkol bo‘yicha qattiqlik 35 dan kam emas. Qabul qilish qalinlik o‘lchagich bilan.",
      },
      {
        title: "Har biri gidrosinovdan o‘tadi",
        text: "Har bir korpus jo‘natishdan oldin 24 soat suv bilan sinaladi. Obyektdagi oqish sexdagi sinovdan qimmatroqqa tushadi.",
      },
      {
        title: "QMQ me’yorlari bo‘yicha hisob",
        text: "QMQ 2.04.03-19 va QMQ 2.04.01-98, massa balansi, kinetika va DWA-A 131 bo‘yicha kislorod ehtiyoji hisobi bilan to‘ldirilgan.",
      },
    ],
    catalogLabel: "KATALOG",
    catalogTitle: "Uskunalar\nva texnologiyalar.",
    catalogText:
      "Alohida yog‘ tutgichdan to kalit topshirish sharti bilan kompleks tozalash inshootlarigacha.",
    ctaTitle: "Dastlabki ma’lumotlarni yuboring —\nyechimni qaytaramiz.",
    ctaText:
      "Qanday obyekt va qancha suv — shuni bilish kifoya. Qolganini o‘zimiz hisoblaymiz va narx nimalardan tashkil topishini ko‘rsatamiz.",
    ctaPrimary: "ARIZA YUBORISH",
    ctaSecondary: "ONLAYN MUHANDISLIK HISOBI",
  },

  en: {
    eyebrow: "SUVSANOAT · WATER TREATMENT ENGINEERING",
    title: "Describe your site.\nGet the calculation.",
    lead: "We do not start with a price list. First we calculate: flow, load, technology and equipment list to the Uzbek KMK codes. Then we manufacture — in Tashkent, at our own shop.",
    askLabel: "What are you designing",
    askPlaceholder: "for example: a car wash with 4 bays",
    askButton: "CALCULATE",
    askHint:
      "The result is preliminary and takes about a minute. No phone call, no sign-up.",
    chips: [
      "a car wash with 4 bays",
      "a hotel for 300 people",
      "a dairy plant, 200 m³/day",
      "a village of 1,500 residents",
    ],
    journeyLabel: "THE PATH OF WATER",
    stages: [
      {
        title: "Influent",
        sub: "The equalization tank absorbs the peak discharge and feeds the plant evenly. Without it every structure would have to be sized for the peak flow.",
      },
      {
        title: "Mechanical treatment",
        sub: "Grit trap, lamella settler and coalescing module. This is where the bulk of the solids and oil products is removed.",
      },
      {
        title: "Sand filtration",
        sub: "Quartz sand removes the residual solids. Backwashed on differential pressure.",
      },
      {
        title: "Sorption",
        sub: "Activated carbon takes what sand and settling cannot: the remaining oil products and the odour.",
      },
      {
        title: "Biological polishing",
        sub: "The only stage that removes BOD. Neither a settler nor a carbon filter does this — which is why it cannot be dropped from the scheme to save money.",
      },
      {
        title: "Discharge to sewer",
        sub: "A sampling manhole with a sampler and a flow meter — the exact point the water utility inspects.",
      },
    ],
    metrics: {
      ss: "Suspended solids",
      oil: "Oil products",
      bod: "BOD₅",
    },
    unit: "mg/l",
    normLabel: "limit",
    source:
      "Figures from the SUVSANOAT AVTO-3K project: car wash wastewater, 20 m³/day. Sewer acceptance limits per Resolution No. 11 of the Cabinet of Ministers of Uzbekistan, 03.02.2010.",
    makeLabel: "OUR OWN PRODUCTION",
    makeTitle: "We do not resell.\nWe manufacture.",
    makeText:
      "We produce treatment plant vessels in Uzbekistan from GRP. That is what separates a manufacturer from a supplier: lead time, price and warranty depend on us, not on somebody else's warehouse.",
    makeCards: [
      {
        title: "GRP, not steel",
        text: "Isophthalic polyester resin is not affected by oil products or surfactants. Steel in car wash effluent lasts 5–7 years, GRP lasts the life of the site.",
      },
      {
        title: "Laminate thickness controlled",
        text: "7–8 mm laminate for buried vessels, stiffening rings at 900 mm spacing, Barcol hardness of at least 35. Accepted with a thickness gauge.",
      },
      {
        title: "Every vessel hydrotested",
        text: "Every vessel holds water for 24 hours before shipment. A leak on site costs more than a test in the shop.",
      },
      {
        title: "Calculated to KMK codes",
        text: "KMK 2.04.03-19 and KMK 2.04.01-98, supplemented by mass balance, kinetics and oxygen demand to DWA-A 131.",
      },
    ],
    catalogLabel: "CATALOGUE",
    catalogTitle: "Equipment\nand technologies.",
    catalogText:
      "From a single grease trap to complete turnkey treatment plants.",
    ctaTitle: "Send the input data —\nwe return a solution.",
    ctaText:
      "Knowing the type of site and the water volume is enough. We will do the rest and show what the price consists of.",
    ctaPrimary: "SEND A REQUEST",
    ctaSecondary: "ONLINE ENGINEERING CALCULATION",
  },

  zh: {
    eyebrow: "SUVSANOAT · 水处理工程系统",
    title: "描述您的项目。\n获取计算结果。",
    lead: "我们不从价目表开始。首先按乌兹别克斯坦 KMK 规范计算流量、负荷、工艺和设备配置，然后在塔什干自有车间生产。",
    askLabel: "您正在设计什么",
    askPlaceholder: "例如：4 个工位的洗车场",
    askButton: "开始计算",
    askHint: "结果为初步方案，约需一分钟。无需通话，无需注册。",
    chips: [
      "4 个工位的洗车场",
      "可容纳 300 人的酒店",
      "乳品厂 200 m³/天",
      "1 500 人的村镇",
    ],
    journeyLabel: "水的流程",
    stages: [
      {
        title: "污水进水",
        sub: "调节池吸纳瞬时高峰水量，并均匀地送入处理系统。没有它，所有构筑物都必须按峰值流量设计。",
      },
      {
        title: "机械处理",
        sub: "沉砂池、斜板沉淀池和聚结分离模块。悬浮物和石油类物质的绝大部分在此去除。",
      },
      {
        title: "石英砂过滤",
        sub: "石英砂去除残余悬浮物。按压差进行反冲洗。",
      },
      {
        title: "吸附",
        sub: "活性炭去除砂滤和沉淀无法处理的部分：残余石油类物质和异味。",
      },
      {
        title: "生化深度处理",
        sub: "唯一能降低 BOD 的工段。沉淀池和活性炭过滤器都做不到 — 因此不能为了省钱把它从流程中去掉。",
      },
      {
        title: "排入市政管网",
        sub: "带取样装置和流量计的检查井 — 供水公司检查的正是这一点。",
      },
    ],
    metrics: {
      ss: "悬浮物",
      oil: "石油类",
      bod: "BOD₅",
    },
    unit: "mg/L",
    normLabel: "标准",
    source:
      "数据来自 SUVSANOAT AVTO-3K 项目：洗车场污水 20 m³/天。排入市政管网的标准依据乌兹别克斯坦内阁 2010 年 2 月 3 日第 11 号决议。",
    makeLabel: "自有生产",
    makeTitle: "我们不做转售。\n我们自己制造。",
    makeText:
      "污水处理设备的罐体由我们在乌兹别克斯坦用玻璃钢制造。这正是制造商与供应商的区别：交期、价格和质保取决于我们，而不是别人的仓库。",
    makeCards: [
      {
        title: "玻璃钢，而非金属",
        text: "间苯型聚酯树脂不惧石油类物质和表面活性剂。金属在洗车污水中可用 5–7 年，玻璃钢则可用满项目的全生命周期。",
      },
      {
        title: "厚度受控",
        text: "埋地罐体层压厚度 7–8 mm，加强环间距 900 mm，巴氏硬度不低于 35。验收时使用测厚仪。",
      },
      {
        title: "每台都做水压试验",
        text: "每台罐体出厂前满水静置 24 小时。现场渗漏的代价远高于车间试验。",
      },
      {
        title: "按 KMK 规范计算",
        text: "KMK 2.04.03-19 与 KMK 2.04.01-98，并结合物料平衡、动力学以及按 DWA-A 131 的需氧量计算。",
      },
    ],
    catalogLabel: "产品目录",
    catalogTitle: "设备\n与工艺技术。",
    catalogText: "从单台隔油池到成套交钥匙污水处理设施。",
    ctaTitle: "发送原始数据 —\n我们给出方案。",
    ctaText:
      "只需知道项目类型和水量即可。其余由我们计算，并向您说明价格的构成。",
    ctaPrimary: "提交需求",
    ctaSecondary: "在线工程计算",
  },
};

function lines(text: string) {
  return text.split("\n").map((line, index) => (
    <span key={index}>
      {index > 0 && <br />}
      {line}
    </span>
  ));
}

function useAnimatedNumber(target: number, duration = 600) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;

    const start = performance.now();

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);

      setValue(from + (target - from) * eased);

      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      fromRef.current = target;
    };
  }, [target, duration]);

  return value;
}

function format(value: number, language: Language) {
  const decimals = value < 10 && value % 1 !== 0 ? 1 : 0;
  const rounded = value.toFixed(decimals);

  return language === "en" || language === "zh"
    ? rounded
    : rounded.replace(".", ",");
}

function Metric({
  name,
  value,
  norm,
  unit,
  normLabel,
  language,
}: {
  name: string;
  value: number;
  norm: number;
  unit: string;
  normLabel: string;
  language: Language;
}) {
  const animated = useAnimatedNumber(value);

  return (
    <div className={`${s.met} ${value <= norm ? s.ok : s.bad}`}>
      <span className={s.metName}>{name}</span>

      <strong className={s.metValue}>
        {format(animated, language)}
        <em>{unit}</em>
      </strong>

      <span className={s.metNorm}>
        {normLabel} {format(norm, language)} {unit}
      </span>
    </div>
  );
}

export default function NewHome() {
  const { t, language } = useLanguage();
  const c = T[language];
  const router = useRouter();

  const [object, setObject] = useState("");
  const [progress, setProgress] = useState(0);

  const journeyRef = useRef<HTMLElement | null>(null);

  const total = ANCHORS.length;
  const stage = Math.min(total - 1, Math.floor(progress * total));
  const values = VALUES[stage];

  /* прокрутка вдоль установки */
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;

      const node = journeyRef.current;
      if (!node) return;

      const span = node.offsetHeight - window.innerHeight;
      if (span <= 0) return;

      const passed = -node.getBoundingClientRect().top;

      setProgress(Math.min(1, Math.max(0, passed / span)));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* положение «камеры»: плавно едет от узла к узлу */
  const slot = progress * (total - 1);
  const from = ANCHORS[Math.min(total - 1, Math.floor(slot))];
  const to = ANCHORS[Math.min(total - 1, Math.floor(slot) + 1)];
  const k = slot - Math.floor(slot);

  const camX = from.x + (to.x - from.x) * k;
  const camY = from.y + (to.y - from.y) * k + 55;

  const zoom = Math.min(1, progress / 0.07);
  const winW = VB_W - (VB_W - ZOOM_W) * zoom;
  const winH = (winW * VB_H) / VB_W;

  const viewX = Math.max(0, Math.min(VB_W - winW, camX - winW / 2));
  const viewY = Math.max(0, Math.min(VB_H - winH, camY - winH / 2));

  /* при приближении выноски должны сохранять экранный размер */
  const pk = winW / VB_W;

  const submit = useCallback(
    (text: string) => {
      const value = text.trim();
      if (!value) return;

      const query = new URLSearchParams();
      query.set("object", value);

      router.push(`/engineering/analysis/flow?${query.toString()}`);
    },
    [router]
  );

  const plant = (dim: boolean) => (
    <>
      {SOLIDS.map((solid, index) => {
        const active = solid.part === ANCHORS[stage].part;

        return (
          <g
            key={index}
            className={`${s.solid} ${solid.kind === "pipe" ? s.pipe : ""} ${
              dim && active ? s.on : ""
            } ${dim && solid.part && !active ? s.off : ""}`}
          >
            <polygon className={s.faceLeft} points={solid.left} vectorEffect="non-scaling-stroke" />
            <polygon className={s.faceRight} points={solid.right} vectorEffect="non-scaling-stroke" />
            <polygon className={s.faceTop} points={solid.top} vectorEffect="non-scaling-stroke" />
            {solid.water && (
              <polygon className={s.waterFace} points={solid.water} vectorEffect="non-scaling-stroke" />
            )}
            {solid.hatch && (
              <polygon className={s.hatchFace} points={solid.hatch} vectorEffect="non-scaling-stroke" />
            )}
          </g>
        );
      })}
    </>
  );

  return (
    <main className={s.page}>
      {/* ШАПКА */}
      <header className={s.header}>
        <a href="/" className={s.logo} aria-label="SUVSANOAT">
          <img src="/logo.png" alt="SUVSANOAT" />
        </a>

        <nav className={s.nav}>
          <a href="#catalog">{t.nav.catalog}</a>
          <a href="#make">{t.nav.technologies}</a>
          <a href="/engineering">{t.nav.engineering}</a>
          <a href="#contacts">{t.nav.contacts}</a>

          <LanguageSwitcher />

          <a href="#contacts" className={s.navButton}>
            {t.nav.calculation}
          </a>
        </nav>
      </header>

      {/* ПЕРВЫЙ ЭКРАН */}
      <section className={s.hero}>
        <div className={s.heroGlow} />

        <svg className={s.heroPlant} viewBox={VIEW_BOX} aria-hidden="true">
          {plant(false)}

          <polyline className={s.flowBase} points={FLOW_POINTS} vectorEffect="non-scaling-stroke" />
          <polyline className={s.flowDash} points={FLOW_POINTS} vectorEffect="non-scaling-stroke" />
        </svg>

        <div className={s.heroInner}>
          <div className={s.eyebrow}>{c.eyebrow}</div>

          <h1>{lines(c.title)}</h1>

          <p className={s.heroLead}>{c.lead}</p>

          <div className={s.ask}>
            <span className={s.askLabel}>{c.askLabel}</span>

            <form
              className={s.askRow}
              onSubmit={(event) => {
                event.preventDefault();
                submit(object);
              }}
            >
              <input
                type="text"
                value={object}
                onChange={(event) => setObject(event.target.value)}
                placeholder={c.askPlaceholder}
                aria-label={c.askLabel}
              />

              <button type="submit">{c.askButton}</button>
            </form>

            <div className={s.chips}>
              {c.chips.map((chip) => (
                <button key={chip} type="button" onClick={() => submit(chip)}>
                  {chip}
                </button>
              ))}
            </div>

            <p className={s.askHint}>{c.askHint}</p>
          </div>
        </div>
      </section>

      {/* ПУТЬ ВОДЫ */}
      <section
        className={s.journey}
        ref={journeyRef}
        style={{ height: `${total * 85}vh` }}
      >
        <div className={s.sticky}>
          <div className={s.journeyPanel}>
            <div className={s.journeyLabel}>{c.journeyLabel}</div>

            <div className={s.stageNumber}>
              {String(stage + 1).padStart(2, "0")}
            </div>

            <h2>{c.stages[stage].title}</h2>

            <p className={s.stageSub}>{c.stages[stage].sub}</p>

            <div className={s.mets}>
              <Metric
                name={c.metrics.ss}
                value={values.ss}
                norm={NORMS.ss}
                unit={c.unit}
                normLabel={c.normLabel}
                language={language}
              />

              <Metric
                name={c.metrics.oil}
                value={values.oil}
                norm={NORMS.oil}
                unit={c.unit}
                normLabel={c.normLabel}
                language={language}
              />

              <Metric
                name={c.metrics.bod}
                value={values.bod}
                norm={NORMS.bod}
                unit={c.unit}
                normLabel={c.normLabel}
                language={language}
              />
            </div>
          </div>

          <div className={s.scene}>
            <svg
              className={s.sceneSvg}
              viewBox={`${viewX} ${viewY} ${winW} ${winH}`}
              aria-hidden="true"
            >
              {plant(true)}

              <polyline className={s.flowBase} points={FLOW_POINTS} vectorEffect="non-scaling-stroke" />

              <polyline
                className={s.flowLive}
                points={FLOW_POINTS}
                vectorEffect="non-scaling-stroke"
                strokeDasharray={FLOW_LENGTH}
                strokeDashoffset={FLOW_LENGTH * (1 - progress)}
              />

              {ANCHORS.map((anchor, index) => (
                <g
                  key={anchor.part}
                  className={`${s.pin} ${index === stage ? s.on : ""}`}
                >
                  <line
                    x1={anchor.x}
                    y1={anchor.y}
                    x2={anchor.x}
                    y2={anchor.y - 40 * pk}
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle
                    cx={anchor.x}
                    cy={anchor.y - 40 * pk}
                    r={14 * pk}
                    vectorEffect="non-scaling-stroke"
                  />
                  <text
                    x={anchor.x}
                    y={anchor.y - 40 * pk}
                    dy={5 * pk}
                    fontSize={13 * pk}
                    textAnchor="middle"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </text>
                </g>
              ))}
            </svg>

            <div className={s.rail}>
              {ANCHORS.map((anchor, index) => (
                <i key={anchor.part} className={index === stage ? s.on : ""} />
              ))}
            </div>
          </div>

          <p className={s.journeySource}>{c.source}</p>
        </div>
      </section>

      {/* ПРОИЗВОДСТВО */}
      <section className={s.make} id="make">
        <div className={s.secHead}>
          <div>
            <div className={s.secLabel}>{c.makeLabel}</div>
            <h2>{lines(c.makeTitle)}</h2>
          </div>

          <p>{c.makeText}</p>
        </div>

        <div className={s.makeGrid}>
          {c.makeCards.map((card, index) => (
            <article className={s.makeCard} key={card.title}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* КАТАЛОГ */}
      <section className={s.catalog} id="catalog">
        <div className={s.secHead}>
          <div>
            <div className={s.secLabel}>{c.catalogLabel}</div>
            <h2>{lines(c.catalogTitle)}</h2>
          </div>

          <p>{c.catalogText}</p>
        </div>

        <div className={s.catGrid}>
          {t.categories.map((title, index) => (
            <a className={s.catCard} href={CATEGORY_LINKS[index]} key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <i className={s.catArrow}>↗</i>
            </a>
          ))}
        </div>
      </section>

      {/* ФИНАЛ */}
      <section className={s.cta} id="contacts">
        <div className={s.ctaInner}>
          <h2>{lines(c.ctaTitle)}</h2>

          <div>
            <p>{c.ctaText}</p>

            <div className={s.ctaLinks}>
              <a className={s.ctaPrimary} href="/#contacts">
                {c.ctaPrimary}
              </a>

              <a className={s.ctaSecondary} href="/engineering">
                {c.ctaSecondary}
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className={s.footer}>
        <span>{t.footer.copyright}</span>

        <div>
          <a href="tel:+998773043400">+998 77 304 34 00</a>
          {" · "}
          <a href="mailto:suvsanoat@gmail.com">suvsanoat@gmail.com</a>
        </div>
      </footer>
    </main>
  );
}
