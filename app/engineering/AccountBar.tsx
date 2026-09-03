"use client";

import { type CSSProperties, useEffect, useState } from "react";

/* ==================================================================
 * СТРОКА УЧЁТНОЙ ЗАПИСИ В ШАПКЕ РАЗДЕЛА
 *
 * Не вошёл → «Вход для проектировщиков».
 * Вошёл    → имя и «Выйти»; администратору — ещё «Админка».
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

export default function AccountBar() {
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
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  }

  if (!ready) return null;

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
