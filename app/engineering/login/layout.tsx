import type { Metadata } from "next";
import EngineeringTheme from "../Theme";

export const metadata: Metadata = {
  title: "SUVSANOAT — доступ к разделу «Инжиниринг»",
  robots: { index: false, follow: false },
};

/* Тот же лист, что и в расчётах: на адресе заказчика вход должен быть
   светлым, иначе человек видит белую главную, тёмный вход и снова
   светлый расчёт. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <EngineeringTheme>{children}</EngineeringTheme>;
}
