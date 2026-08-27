import NewHome from "./_home/NewHome";

/**
 * Главная страница SUVSANOAT.
 *
 * Метаданные наследуются из app/layout.tsx — там же canonical "/",
 * OG-превью и разметка Organization.
 *
 * Прежний вариант главной сохранён на /classic как страховка,
 * он закрыт от индексации и не входит в sitemap.
 */
export default function Home() {
  return <NewHome />;
}
