"use client";

/* ==================================================================
 * ДОСТУП К ИНСТРУМЕНТАМ ПРОЕКТИРОВЩИКА
 *
 * Оборачивает страницу и пускает дальше только вошедшего. Пока идёт
 * проверка — показывается заглушка, а не содержимое: иначе расчёт
 * мелькает на экране до перенаправления, и защита превращается в
 * видимость защиты.
 *
 * Серверная сторона от этого не зависит: маршруты /api/* всё равно
 * проверяют сессию сами и отдают 401. Здесь — только вход в интерфейс,
 * чтобы человек попадал на страницу входа, а не в пустую форму.
 * ================================================================== */

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type Props = {
  children: ReactNode;
  /** что написать на заглушке, пока идёт проверка */
  title?: string;
};

export default function RequireAuth({ children, title = "Проверяем доступ…" }: Props) {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me")
      .then((r) => {
        if (!alive) return;
        if (r.ok) {
          setState("ok");
          return;
        }
        setState("denied");
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        router.replace(`/engineering/login?next=${next}`);
      })
      .catch(() => {
        if (!alive) return;
        /* Сеть отвалилась — не выкидываем со страницы: человек мог
           потерять связь на минуту, а не потерять доступ. */
        setState("denied");
      });
    return () => {
      alive = false;
    };
  }, [router]);

  if (state === "ok") return <>{children}</>;

  return (
    <main style={page}>
      <div style={box}>
        <div style={eyebrow}>SUVSANOAT · ИНЖИНИРИНГ</div>
        <h1 style={h1}>{state === "checking" ? title : "Нужен вход"}</h1>
        <p style={text}>
          {state === "checking"
            ? "Секунду — проверяем, есть ли у вас доступ к разделу."
            : "Раздел доступен проектировщикам по логину и паролю. Если доступа ещё нет, оставьте заявку на странице входа — выдаём вручную."}
        </p>
        {state === "denied" && (
          <a href="/engineering/login" style={button}>
            Перейти ко входу
          </a>
        )}
      </div>
    </main>
  );
}

const page: CSSProperties = {
  minHeight: "100vh",
  background: "#06151d",
  color: "#f4f7f8",
  fontFamily: "Arial, Helvetica, sans-serif",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const box: CSSProperties = {
  width: "min(560px, 100%)",
  background: "#081b24",
  border: "1px solid #1c3742",
  borderRadius: 12,
  padding: 28,
};

const eyebrow: CSSProperties = { color: "#5fb6c9", fontSize: 11, fontWeight: 800, letterSpacing: "3px" };
const h1: CSSProperties = { fontSize: 26, margin: "14px 0 0" };
const text: CSSProperties = { color: "#8ca4ad", fontSize: 15, lineHeight: 1.7, marginTop: 14 };
const button: CSSProperties = {
  display: "inline-block",
  marginTop: 18,
  background: "#0f5f73",
  color: "#eaf7fa",
  borderRadius: 10,
  padding: "11px 20px",
  fontSize: 15,
  fontWeight: 700,
  textDecoration: "none",
};
