import type { Language } from "../translations";

/**
 * Список посадочных страниц «под задачу» — для перекрёстных ссылок
 * из ассортимента и каталога.
 */

export type SolutionLink = {
  href: string;
  icon: string;
  title: Record<Language, string>;
};

export const SOLUTION_LINKS: SolutionLink[] = [
  {
    href: "/solutions/restaurant",
    icon: "grit",
    title: {
      ru: "Жироуловитель для ресторана",
      uz: "Restoran uchun yog‘ tutgich",
      en: "Grease trap for a restaurant",
      zh: "餐厅隔油器",
    },
  },
  {
    href: "/solutions/car-wash",
    icon: "truck",
    title: {
      ru: "Очистные для автомойки",
      uz: "Avtoyuvish uchun tozalash",
      en: "Car wash water treatment",
      zh: "洗车场水处理",
    },
  },
  {
    href: "/solutions/gas-station",
    icon: "lamella",
    title: {
      ru: "Нефтеуловитель для АЗС и паркинга",
      uz: "ShAQSh uchun neft tutgich",
      en: "Oil separator for a filling station",
      zh: "加油站除油器",
    },
  },
  {
    href: "/solutions/private-house",
    icon: "bio",
    title: {
      ru: "ЛОС для частного дома",
      uz: "Xususiy uy uchun LOI",
      en: "Package plant for a house",
      zh: "别墅污水设备",
    },
  },
  {
    href: "/solutions/kns",
    icon: "kns",
    title: {
      ru: "КНС для дома и посёлка",
      uz: "Uy va qishloq uchun KNS",
      en: "Pumping station",
      zh: "污水泵站",
    },
  },
  {
    href: "/solutions/tanks",
    icon: "tank",
    title: {
      ru: "Резервуар из стеклопластика",
      uz: "Shishatolali plastik rezervuar",
      en: "GRP tank",
      zh: "玻璃钢储罐",
    },
  },
  {
    href: "/solutions/hotel",
    icon: "station",
    title: {
      ru: "Очистные для гостиницы",
      uz: "Mehmonxona uchun tozalash",
      en: "Hotel wastewater treatment",
      zh: "酒店污水处理",
    },
  },
  {
    href: "/solutions/food-industry",
    icon: "factory",
    title: {
      ru: "Очистные для пищевого производства",
      uz: "Oziq-ovqat korxonasi uchun",
      en: "Food plant effluent treatment",
      zh: "食品厂污水处理",
    },
  },
  {
    href: "/solutions/disinfection",
    icon: "chem",
    title: {
      ru: "Обеззараживание воды посёлка",
      uz: "Qishloq suvini zararsizlantirish",
      en: "Water disinfection",
      zh: "供水消毒",
    },
  },
];
