"use client";

import { useState } from "react";

import { useLanguage } from "../LanguageContext";
import type { Language } from "../translations";

/* --------------------------------------------------------------
 * ИЗОМЕТРИЧЕСКАЯ СХЕМА УСТАНОВКИ
 * Геометрия рассчитана изометрической проекцией и вписана в SVG.
 * Состав узлов — по проекту SUVSANOAT AVTO-3К.
 * -------------------------------------------------------------- */

type Solid = {
  part: string;
  kind: "body" | "pipe";
  top: string;
  left: string;
  right: string;
  hatch?: string;
  water?: string;
};

const SOLIDS: Solid[] = [
  { part: "b1", kind: "body", top: "147.3,104.0 214.4,124.5 111.1,156.1 44.0,135.6", left: "44.0,233.0 111.1,253.6 111.1,156.1 44.0,135.6", right: "214.4,222.0 111.1,253.6 111.1,156.1 214.4,124.5", hatch: "129.2,119.9 162.3,130.1 129.2,140.2 96.2,130.1", water: "44.0,230.5 111.1,251.0 111.1,183.4 44.0,162.9" },
  { part: "", kind: "pipe", top: "170.0,167.6 185.5,172.3 171.0,176.8 155.5,172.0", left: "155.5,186.4 171.0,191.1 171.0,176.8 155.5,172.0", right: "185.5,186.7 171.0,191.1 171.0,176.8 185.5,172.3" },
  { part: "b2", kind: "body", top: "229.9,129.3 348.7,165.6 245.4,197.1 126.6,160.8", left: "126.6,258.3 245.4,294.6 245.4,197.1 126.6,160.8", right: "348.7,263.0 245.4,294.6 245.4,197.1 348.7,165.6", hatch: "237.7,153.1 270.7,163.2 237.7,173.3 204.6,163.2", water: "126.6,255.7 245.4,292.1 245.4,224.4 126.6,188.1" },
  { part: "", kind: "pipe", top: "304.3,208.6 319.8,213.4 305.3,217.8 289.8,213.1", left: "289.8,227.4 305.3,232.2 305.3,217.8 289.8,213.1", right: "319.8,227.7 305.3,232.2 305.3,217.8 319.8,213.4" },
  { part: "b3", kind: "body", top: "364.2,170.3 431.3,190.8 328.0,222.4 260.9,201.9", left: "260.9,299.4 328.0,319.9 328.0,222.4 260.9,201.9", right: "431.3,288.3 328.0,319.9 328.0,222.4 431.3,190.8", hatch: "346.1,186.3 379.1,196.4 346.1,206.5 313.0,196.4", water: "260.9,296.8 328.0,317.3 328.0,249.7 260.9,229.2" },
  { part: "", kind: "pipe", top: "386.9,233.9 402.4,238.6 387.9,243.1 372.4,238.3", left: "372.4,252.7 387.9,257.4 387.9,243.1 372.4,238.3", right: "402.4,253.0 387.9,257.4 387.9,243.1 402.4,238.6" },
  { part: "b4", kind: "body", top: "446.8,195.6 513.9,216.1 410.6,247.7 343.5,227.1", left: "343.5,324.6 410.6,345.1 410.6,247.7 343.5,227.1", right: "513.9,313.6 410.6,345.1 410.6,247.7 513.9,216.1", hatch: "428.7,211.5 461.8,221.6 428.7,231.7 395.7,221.6", water: "343.5,322.1 410.6,342.6 410.6,275.0 343.5,254.4" },
  { part: "", kind: "pipe", top: "469.5,260.2 500.5,269.7 487.1,273.8 456.1,264.3", left: "456.1,277.6 487.1,287.1 487.1,273.8 456.1,264.3", right: "500.5,283.0 487.1,287.1 487.1,273.8 500.5,269.7" },
  { part: "rack", kind: "body", top: "512.9,207.1 543.9,216.6 512.9,226.1 481.9,216.6", left: "481.9,342.3 512.9,351.8 512.9,226.1 481.9,216.6", right: "543.9,342.3 512.9,351.8 512.9,226.1 543.9,216.6" },
  { part: "", kind: "pipe", top: "538.7,221.8 549.0,224.9 539.7,227.8 529.4,224.6", left: "529.4,233.9 539.7,237.0 539.7,227.8 529.4,224.6", right: "549.0,234.2 539.7,237.0 539.7,227.8 549.0,224.9" },
  { part: "rack", kind: "body", top: "554.2,219.8 585.2,229.2 554.2,238.7 523.2,229.2", left: "523.2,354.9 554.2,364.4 554.2,238.7 523.2,229.2", right: "585.2,354.9 554.2,364.4 554.2,238.7 585.2,229.2" },
  { part: "", kind: "pipe", top: "575.9,317.2 622.4,331.5 610.0,335.2 563.5,321.0", left: "563.5,333.3 610.0,347.6 610.0,335.2 563.5,321.0", right: "622.4,343.8 610.0,347.6 610.0,335.2 622.4,331.5" },
  { part: "well", kind: "body", top: "642.0,301.9 693.6,317.6 636.8,335.0 585.2,319.2", left: "585.2,383.3 636.8,399.1 636.8,335.0 585.2,319.2", right: "693.6,381.8 636.8,399.1 636.8,335.0 693.6,317.6", hatch: "639.4,308.3 672.5,318.4 639.4,328.5 606.4,318.4" },
];

const ANCHORS: { part: string; x: number; y: number }[] = [
  { part: "b1", x: 129.2, y: 130.1 },
  { part: "b2", x: 237.7, y: 163.2 },
  { part: "b3", x: 346.1, y: 196.4 },
  { part: "b4", x: 428.7, y: 221.6 },
  { part: "rack", x: 512.9, y: 216.6 },
  { part: "well", x: 639.4, y: 318.4 },
];

type IsoText = {
  label: string;
  title: string;
  intro: string;
  note: string;
  parts: { title: string; text: string }[];
};

const T: Record<Language, IsoText> = {
  ru: {
    label: "УСТРОЙСТВО УСТАНОВКИ",
    title: "Что находится\nвнутри корпуса.",
    intro: "Разрез установки очистки стоков автомойки. Наведите на номер — узел подсветится.",
    note: "Корпус — стеклопластик собственного производства: изофталевая полиэфирная смола, ламинат 7–8 мм, кольца жёсткости, гидроиспытание каждого изделия 24 часа до отгрузки.",
    parts: [
      { title: "Пескоуловитель", text: "Песок, грязь и тяжёлые фракции оседают в шламовой зоне. Откачка шлама раз в 3–4 недели." },
      { title: "Отстойная зона с ламельным блоком", text: "Тонкослойный блок увеличивает площадь осаждения в несколько раз. Граница осаждения — частицы от 15 мкм." },
      { title: "Коалесцентный модуль", text: "Мелкие капли нефтепродуктов сливаются в крупные и всплывают. Без него плёнку не снять." },
      { title: "Маслосборный карман", text: "Всплывшая нефтяная плёнка собирается скиммером в отдельную ёмкость." },
      { title: "Фильтровальная стойка", text: "Кварцевый песок и активированный уголь. Обратная промывка по перепаду давления." },
      { title: "Контрольный колодец", text: "Пробоотборное устройство и расходомер — та самая точка, которую проверяет водоканал." },
    ],
  },

  uz: {
    label: "QURILMANING TUZILISHI",
    title: "Korpus ichida\nnima joylashgan.",
    intro: "Avtomoyka oqava suvlarini tozalash qurilmasining kesimi. Raqam ustiga olib boring — tugun yoritiladi.",
    note: "Korpus — o‘z ishlab chiqarishimizdagi shishaplastik: izoftal poliefir smolasi, 7–8 mm laminat, qattiqlik halqalari, har bir buyum jo‘natishdan oldin 24 soat gidrosinovdan o‘tadi.",
    parts: [
      { title: "Qum tutgich", text: "Qum, loyqa va og‘ir fraksiyalar shlam zonasida cho‘kadi. Shlam 3–4 haftada bir marta so‘riladi." },
      { title: "Lamel blokli tindirish zonasi", text: "Yupqa qatlamli blok cho‘kish yuzasini bir necha barobar oshiradi. Cho‘kish chegarasi — 15 mkm dan katta zarralar." },
      { title: "Koalessent modul", text: "Neft mahsulotlarining mayda tomchilari birlashib yiriklashadi va suzib chiqadi. Usiz pardani yo‘qotib bo‘lmaydi." },
      { title: "Yog‘ yig‘ish cho‘ntagi", text: "Suzib chiqqan neft pardasi skimmer orqali alohida sig‘imga yig‘iladi." },
      { title: "Filtr stoykasi", text: "Kvars qumi va faollashtirilgan ko‘mir. Bosim farqi bo‘yicha teskari yuvish." },
      { title: "Nazorat qudug‘i", text: "Namuna olish qurilmasi va sarf o‘lchagich — suv kanali tekshiradigan aynan o‘sha nuqta." },
    ],
  },

  en: {
    label: "INSIDE THE UNIT",
    title: "What sits\ninside the vessel.",
    intro: "Cutaway of a car wash wastewater treatment unit. Hover over a number to highlight the component.",
    note: "The vessel is GRP made in our own shop: isophthalic polyester resin, 7–8 mm laminate, stiffening rings, and a 24-hour hydrotest on every unit before shipment.",
    parts: [
      { title: "Grit trap", text: "Sand, dirt and heavy fractions settle in the sludge zone. Sludge is pumped out every 3–4 weeks." },
      { title: "Settling zone with lamella pack", text: "The lamella pack multiplies the settling area. Cut-off size — particles from 15 µm." },
      { title: "Coalescing module", text: "Fine oil droplets merge into larger ones and float up. Without it the film cannot be removed." },
      { title: "Oil collection pocket", text: "The floating oil film is skimmed off into a separate tank." },
      { title: "Filter rack", text: "Quartz sand and activated carbon. Backwash triggered by differential pressure." },
      { title: "Sampling manhole", text: "Sampling device and flow meter — the exact point the water utility inspects." },
    ],
  },

  zh: {
    label: "设备内部构造",
    title: "罐体内部\n有什么。",
    intro: "洗车场污水处理设备剖视图。将鼠标移到编号上，对应部件会高亮显示。",
    note: "罐体为我方自产玻璃钢：间苯型聚酯树脂，7–8 mm 层压厚度，加强环，每台出厂前进行 24 小时水压试验。",
    parts: [
      { title: "沉砂室", text: "砂粒、泥土和重质组分沉降在污泥区。每 3–4 周抽排一次污泥。" },
      { title: "斜板沉淀区", text: "斜板组件使沉淀面积成倍增加。沉降界限为 15 µm 以上的颗粒。" },
      { title: "聚结分离模块", text: "细小油滴聚并成大油滴并上浮。没有它无法去除油膜。" },
      { title: "集油腔", text: "上浮的油膜由刮油器收集至单独的容器。" },
      { title: "过滤机架", text: "石英砂与活性炭。按压差进行反冲洗。" },
      { title: "检查井", text: "取样装置和流量计 — 供水公司检查的正是这一点。" },
    ],
  },

};

export default function IsoPlant() {
  const { language } = useLanguage();
  const c = T[language];

  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="isoSection" id="inside">
      <div className="isoHead">
        <div>
          <div className="sectionLabel">{c.label}</div>

          <h2>
            {c.title.split("\n").map((line, index) => (
              <span key={index}>
                {index > 0 && <br />}
                {line}
              </span>
            ))}
          </h2>
        </div>

        <p>{c.intro}</p>
      </div>

      <div className="isoBody">
        <svg className="isoSvg" viewBox="0 0 738 503" role="img" aria-label={c.label}>
          {SOLIDS.map((solid, index) => (
            <g
              key={index}
              className={`isoSolid isoSolid--${solid.kind} ${
                solid.part && active === solid.part ? "active" : ""
              } ${active && solid.part && active !== solid.part ? "dim" : ""}`}
              onMouseEnter={() => solid.part && setActive(solid.part)}
              onMouseLeave={() => setActive(null)}
            >
              <polygon className="isoLeft" points={solid.left} />
              <polygon className="isoRight" points={solid.right} />
              <polygon className="isoTop" points={solid.top} />
              {solid.water && <polygon className="isoWater" points={solid.water} />}
              {solid.hatch && <polygon className="isoHatch" points={solid.hatch} />}
            </g>
          ))}

          {ANCHORS.map((anchor, index) => (
            <g
              key={anchor.part}
              className={`isoPin ${active === anchor.part ? "active" : ""}`}
              onMouseEnter={() => setActive(anchor.part)}
              onMouseLeave={() => setActive(null)}
            >
              <line x1={anchor.x} y1={anchor.y} x2={anchor.x} y2={anchor.y - 42} />
              <circle cx={anchor.x} cy={anchor.y - 42} r={15} />
              <text x={anchor.x} y={anchor.y - 42} dy="5" textAnchor="middle">
                {String(index + 1).padStart(2, "0")}
              </text>
            </g>
          ))}
        </svg>

        <ol className="isoList">
          {c.parts.map((part, index) => (
            <li
              key={part.title}
              className={active === ANCHORS[index].part ? "active" : ""}
              onMouseEnter={() => setActive(ANCHORS[index].part)}
              onMouseLeave={() => setActive(null)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>

              <div>
                <strong>{part.title}</strong>
                <p>{part.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="isoNote">{c.note}</p>
    </section>
  );
}
