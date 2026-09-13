import { headers } from "next/headers";
import { getBrandByHostCached } from "../../lib/brands";
import { dbUrl } from "../../lib/auth";

/* ==================================================================
 * ЦВЕТ РАЗДЕЛА — ОДНО МЕСТО НА ВСЕ СТРАНИЦЫ
 *
 * Раздел был тёмно-синим весь. На адресе проектного института это
 * выглядело разрывом: главная — белый бланк, зашёл в расчёт — ночь.
 * Поэтому цвета вынесены в переменные и задаются здесь.
 *
 * Значения по умолчанию — ровно те, что были в коде страниц. Это не
 * осторожность ради осторожности: на нашем домене раздел обязан
 * остаться в точности прежним, до оттенка, и такой набор значений
 * это гарантирует без отдельной проверки каждой страницы.
 *
 * Светлая палитра включается только там, где у адреса есть свой
 * бренд, — то есть у заказчика. Фирменный цвет знака становится
 * рабочим цветом раздела: кнопки, ссылки, заголовки. Поэтому
 * следующему покупателю ничего перекрашивать не придётся — он
 * получит свой цвет из своей же записи бренда.
 * ================================================================== */

const THEME_CSS = `
[data-sv-theme] {
  --sv-bg: #06151d;
  --sv-bg2: #06232e;
  --sv-card: #081b24;
  --sv-card-line: #24444f;
  --sv-line: #1c3742;
  --sv-line-soft: #102831;
  --sv-ink: #f4f7f8;
  --sv-ink2: #e7eef1;
  --sv-ink3: #cfdde3;
  --sv-muted: #8ca4ad;
  --sv-faint: #5c7280;
  --sv-faint2: #657983;
  --sv-th: #b7cbd3;
  --sv-accent: #5fb6c9;
  --sv-accent-line: #2a5b68;
  --sv-accent-line2: #2a6d80;
  --sv-accent-soft: #eaf6fa;
  --sv-primary: #0f5f73;
  --sv-primary-ink: #eaf7fa;
  --sv-warn-ink: #ffcf8a;
  --sv-warn-bg: #2a2112;
  --sv-warn-line: #4a3a1c;
  --sv-warn2: #ffb74d;
  --sv-ok: #9ccc65;
  --sv-ok2: #7ee0a1;
  --sv-ok3: #9fd6b4;
  --sv-bad: #ff9d8a;
  --sv-plate: #ffffff;
}

/* Светлый бланк: тот же лист, что и на главной странице заказчика. */
[data-sv-theme="light"] {
  --sv-bg: #ffffff;
  --sv-bg2: #f2f6f9;
  --sv-card: #f8fafc;
  --sv-card-line: #cfdbe3;
  --sv-line: #dbe4ea;
  --sv-line-soft: #eaeff3;
  --sv-ink: #12222c;
  --sv-ink2: #12222c;
  --sv-ink3: #24404f;
  --sv-muted: #4d6474;
  --sv-faint: #6b8190;
  --sv-faint2: #6b8190;
  --sv-th: #3d5765;
  --sv-accent-line: #c3d8e6;
  --sv-accent-line2: #c3d8e6;
  --sv-accent-soft: #eef4fa;
  --sv-primary-ink: #ffffff;
  /* Предупреждение на белом должно читаться: светло-жёлтый по тёмному
     тексту, а не тёмный фон по светлому. */
  --sv-warn-ink: #8a5a00;
  --sv-warn-bg: #fff6e0;
  --sv-warn-line: #efd8a0;
  --sv-warn2: #a86400;
  --sv-ok: #2e7d32;
  --sv-ok2: #1b7f5a;
  --sv-ok3: #1b7f5a;
  --sv-bad: #c0392b;
  /* Логотип на белом листе подложки не требует. */
  --sv-plate: transparent;
}

/* Поля ввода на светлом листе: рамка видна, фон белый. */
[data-sv-theme="light"] input,
[data-sv-theme="light"] select,
[data-sv-theme="light"] textarea {
  background: #ffffff;
}
`;

export default async function EngineeringTheme({ children }: { children: React.ReactNode }) {
  let accent = "";
  let light = false;
  try {
    const host = (await headers()).get("host");
    const brand = dbUrl() ? await getBrandByHostCached(host) : null;
    if (brand) {
      light = true;
      accent = brand.accent || "";
    }
  } catch {
    /* Цвет — оформление, а не расчёт: если база недоступна, раздел
       обязан открыться, просто в своём обычном виде. */
  }

  /* Фирменный цвет подставляется переменной. Собственного типа для
     переменных CSS в React нет, поэтому объект приводится к типу
     стиля — иначе проверка типов не пропустит имя «--sv-accent». */
  const vars = (accent ? { ["--sv-accent"]: accent, ["--sv-primary"]: accent } : {}) as React.CSSProperties;

  return (
    <div data-sv-theme={light ? "light" : "dark"} style={vars}>
      <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
      {children}
    </div>
  );
}
