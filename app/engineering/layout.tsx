import type { Metadata } from "next";
import { headers } from "next/headers";

import EngineeringLang from "./EngineeringLang";
import BrandTitle from "./BrandTitle";
import { getBrandByHostCached } from "../../lib/brands";
import { dbUrl } from "../../lib/auth";

/* ==================================================================
 * ПРЕДПРОСМОТР ССЫЛКИ В МЕССЕНДЖЕРАХ
 *
 * Telegram, WhatsApp и почта не открывают страницу — они читают
 * несколько строк в её заголовке и показывают карточку. Пока эти
 * строки были написаны в коде, заказчик отправлял свою ссылку, а в
 * карточке появлялись наше имя, наш текст и наша картинка. Для того,
 * кто купил раздел под своим знаком, это худшее место для чужого
 * логотипа: карточку видят все, кому он перешлёт ссылку.
 *
 * Поэтому заголовок собирается по домену запроса. Заодно на чужом
 * адресе ставится запрет индексации: приватный инструмент в поиске
 * не нужен.
 *
 * Цена решения — страница перестаёт отдаваться готовой и собирается
 * на каждый заход. Обращение к базе кэшируется на минуту, так что
 * поток посетителей до неё не доходит.
 *
 * BrandTitle остаётся: витрине он больше не нужен — сервер отдаёт ей
 * правильный заголовок сам, — но у страницы входа и у расчётов свои
 * заголовки, и там имя во вкладке по-прежнему подменяется в браузере.
 * Делать динамическими ещё и их ради подписи во вкладке не стоит.
 * ================================================================== */

const HOME: Metadata = {
  title: "Инженерный подбор системы очистки сточных вод",
  description:
    "Онлайн-подбор технологии и оборудования очистки сточных вод по нормам Узбекистана: КМК 2.04.01-98 и КМК 2.04.03-19. Расход, нагрузка, выбор технологии MBBR / SBR / MBR, спецификация оборудования.",
  alternates: { canonical: "/engineering" },
  openGraph: {
    title: "Инженерный подбор системы очистки сточных вод | SUVSANOAT",
    description:
      "Подбор технологии и оборудования по нормам Узбекистана — КМК 2.04.01-98 и КМК 2.04.03-19.",
    url: "https://suvsanoat.uz/engineering",
    siteName: "SUVSANOAT",
    type: "website",
    locale: "ru_RU",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Инженерный подбор SUVSANOAT" }],
  },
  robots: { index: true, follow: true },
};

export async function generateMetadata(): Promise<Metadata> {
  let host = "";
  try {
    host = (await headers()).get("host") ?? "";
    const brand = dbUrl() ? await getBrandByHostCached(host) : null;
    if (!brand) return HOME;

    const base = `https://${host}`;
    /* Если своей картинки у бренда нет, лучше не показывать никакой,
       чем показать чужую: мессенджер нарисует карточку без картинки, и
       это не выдаст постороннее имя. */
    const image = brand.og_image
      ? [{ url: `${base}${brand.og_image}`, width: 1200, height: 630, alt: brand.title }]
      : [];

    return {
      /* absolute — иначе корневой шаблон допишет «| SUVSANOAT»
         к чужому имени, и мы вернём в карточку ровно то, что
         убираем. */
      title: { absolute: brand.title },
      description: brand.subtitle,
      alternates: { canonical: `${base}/engineering` },
      openGraph: {
        title: brand.title,
        description: brand.subtitle,
        url: `${base}/engineering`,
        siteName: brand.title,
        type: "website",
        images: image,
      },
      /* Telegram и часть мессенджеров читают не только og:, но и
         twitter:. Эти теги задаются в корневой раскладке сайта и
         остаются нашими, если их не перекрыть здесь: получается
         карточка, где имя уже его, а заголовок и картинка ещё наши —
         ровно то, что мы убирали. */
      twitter: {
        card: "summary_large_image",
        title: brand.title,
        description: brand.subtitle,
        images: image.map((x) => x.url),
      },
      /* Отдельный адрес — приватный инструмент, в выдаче ему не место. */
      robots: { index: false, follow: false },
    };
  } catch {
    /* Заголовок — оформление, а не расчёт: при недоступной базе
       страница обязана открыться. */
    return HOME;
  }
}

export default function EngineeringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <EngineeringLang />
      <BrandTitle />
      {children}
    </>
  );
}
