"use client";

import { type CSSProperties, useEffect, useState } from "react";

/* ==================================================================
 * УЧЁТНАЯ ЗАПИСЬ В РАЗДЕЛЕ «ИНЖИНИРИНГ»
 *
 * variant="header" — мелкая строка в шапке.
 * variant="hero"   — заметная кнопка рядом с «Начать анализ»:
 *                    не вошёл → «Вход для проектировщиков»,
 *                    вошёл    → «Кабинет проектировщика» / «Админка».
 * AccountNote      — строка «Вы вошли как … · Выйти» под кнопками.
 * ================================================================== */

type Me = { ok: true; login: string; role: "admin" | "user"; name: string };

const link: CSSProperties = {
  color: "inherit",
  textDecoration: "none",
  fontSize: "inherit",
  fontWeight: "inherit",
  letterSpacing: "inherit",
  fontFamily: "inherit",
  opacity: 0.85,
  cursor: "pointer",
  background: "transparent",
  border: 0,
  padding: 0,
  whiteSpace: "nowrap",
};

function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.ok) setMe(d as Me);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { me, ready };
}

async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.reload();
}

export default function AccountBar({
  variant = "header",
  buttonClass,
}: {
  variant?: "header" | "hero";
  buttonClass?: string;
}) {
  const { me, ready } = useMe();

  if (!ready) return null;

  /* ---------- заметная кнопка в первом экране ---------- */
  if (variant === "hero") {
    if (!me) {
      return (
        <a href="/engineering/login" className={buttonClass}>
          Вход для проектировщиков
        </a>
      );
    }
    return (
      <a href={me.role === "admin" ? "/engineering/admin" : "/designers"} className={buttonClass}>
        {me.role === "admin" ? "Админка" : "Кабинет проектировщика"}
      </a>
    );
  }

  /* ---------- мелкая строка в шапке ---------- */
  if (!me) {
    return (
      <>
        <span style={{ opacity: 0.35 }}>·</span>
        <a href="/engineering/login" style={link}>
          ВХОД ДЛЯ ПРОЕКТИРОВЩИКОВ
        </a>
      </>
    );
  }

  return (
    <>
      <span style={{ opacity: 0.35 }}>·</span>
      <span style={{ ...link, opacity: 0.7 }}>{me.name || me.login}</span>
      {me.role === "admin" && (
        <a href="/engineering/admin" style={{ ...link, opacity: 1 }}>
          АДМИНКА
        </a>
      )}
      <button type="button" onClick={logout} style={link}>
        ВЫЙТИ
      </button>
    </>
  );
}

/* строка состояния под кнопками первого экрана */
export function AccountNote({ className }: { className?: string }) {
  const { me, ready } = useMe();
  if (!ready || !me) return null;

  return (
    <div className={className} style={{ marginTop: 16 }}>
      <span>{me.role === "admin" ? "АДМИНИСТРАТОР" : "ДОСТУП ОТКРЫТ"}</span>
      <span>
        {"Вы вошли как "}
        {me.name || me.login}
        {" · "}
        <button type="button" onClick={logout} style={{ ...link, textDecoration: "underline" }}>
          Выйти
        </button>
      </span>
    </div>
  );
}
