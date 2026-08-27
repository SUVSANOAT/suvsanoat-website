import type { Metadata } from "next";
import NewHome from "./NewHome";

/**
 * Черновик новой главной страницы.
 * Закрыт от индексации: пока это превью для согласования,
 * а не публичная страница. При переносе на главную robots убрать.
 */
export const metadata: Metadata = {
  title: "Новая главная — превью",
  description:
    "Черновой вариант новой главной страницы SUVSANOAT. Страница закрыта от индексации.",
  alternates: { canonical: "/new" },
  robots: { index: false, follow: false },
};

export default function NewHomePage() {
  return <NewHome />;
}
