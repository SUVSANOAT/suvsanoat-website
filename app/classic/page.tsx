import type { Metadata } from "next";
import ClassicHome from "./ClassicHome";

/**
 * Прежний вариант главной страницы.
 * Оставлен как страховка на время перехода: закрыт от индексации,
 * в sitemap не входит. Когда новая главная отработает без замечаний —
 * эту папку можно удалить целиком.
 */
export const metadata: Metadata = {
  title: "Прежняя версия главной страницы",
  description: "Архивная версия главной страницы SUVSANOAT.",
  alternates: { canonical: "/classic" },
  robots: { index: false, follow: false },
};

export default function ClassicPage() {
  return <ClassicHome />;
}
