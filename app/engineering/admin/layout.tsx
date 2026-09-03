import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SUVSANOAT — доступ к разделу «Инжиниринг»",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
