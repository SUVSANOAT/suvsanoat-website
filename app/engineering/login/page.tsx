"use client";

import { type CSSProperties, FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/* ==================================================================
 * ВХОД В РАЗДЕЛ «ИНЖИНИРИНГ»
 *
 * Слева — вход по логину и паролю, справа — заявка на доступ.
 * Доступ выдаёт SUVSANOAT вручную: заявка приходит в Telegram,
 * логин и пароль создаются в /engineering/admin.
 * ================================================================== */

const BG = "#06151d";
const PANEL = "#081b24";
const LINE = "#18323e";
const ACCENT = "#00aeea";
const FAINT = "#8da5b1";

const input: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #294550",
  borderRadius: 6,
  background: BG,
  color: "#f5f8fa",
  padding: "13px 14px",
  fontSize: 15,
  outline: "none",
  marginBottom: 12,
};

const label: CSSProperties = {
  display: "block",
  color: FAINT,
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.14em",
  marginBottom: 6,
};

function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/engineering";
  return raw;
}

function LoginContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = safeNext(sp.get("next"));
  const adminOnly = sp.get("admin") === "1";

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [req, setReq] = useState({ name: "", company: "", phone: "", email: "", message: "", website: "" });
  const [reqBusy, setReqBusy] = useState(false);
  const [reqDone, setReqDone] = useState("");

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();
      if (data.ok) {
        router.replace(next);
        router.refresh();
      } else setError(data.error || "Не удалось войти.");
    } catch {
      setError("Нет связи с сервером.");
    } finally {
      setBusy(false);
    }
  }

  async function onRequest(e: FormEvent) {
    e.preventDefault();
    setReqBusy(true);
    setReqDone("");
    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(req),
      });
      const data = await res.json();
      setReqDone(data.ok ? "Заявка отправлена. Логин и пароль пришлём на указанный телефон в рабочее время." : data.error || "Ошибка.");
    } catch {
      setReqDone("Нет связи с сервером.");
    } finally {
      setReqBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#f5f8fa", padding: "70px 24px 110px" }}>
      <div style={{ width: "100%", maxWidth: 980, margin: "0 auto" }}>
        <button type="button" onClick={() => router.push("/engineering")}
          style={{ border: 0, background: "transparent", color: FAINT, fontSize: 15, cursor: "pointer", padding: 0, marginBottom: 40 }}>
          ← Инжиниринг
        </button>

        <div style={{ color: "#00d9ff", fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", marginBottom: 16 }}>
          ДОСТУП ДЛЯ ПРОЕКТИРОВЩИКОВ
        </div>
        <h1 style={{ fontSize: "clamp(34px, 6vw, 60px)", lineHeight: 1.05, letterSpacing: "-0.04em", margin: "0 0 18px", maxWidth: 820 }}>
          {adminOnly ? "Нужны права администратора" : "Результат расчёта, чертежи DXF и записка — после входа"}
        </h1>
        <p style={{ maxWidth: 760, color: FAINT, fontSize: 17, lineHeight: 1.65, margin: "0 0 40px" }}>
          Исходные данные вводятся свободно, а готовое решение с чертежами и технической запиской мы отдаём
          зарегистрированным проектировщикам. Доступ бесплатный, выдаётся в рабочее время после заявки.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {/* ВХОД */}
          <form onSubmit={onLogin} style={{ border: `1px solid ${LINE}`, background: PANEL, padding: 30, borderRadius: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: "#00d9ff", marginBottom: 20 }}>ВХОД</div>
            <label style={label} htmlFor="login">ЛОГИН</label>
            <input id="login" style={input} value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" autoCapitalize="none" />
            <label style={label} htmlFor="password">ПАРОЛЬ</label>
            <input id="password" type="password" style={input} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            {error && <p style={{ color: "#ff8a80", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}
            <button type="submit" disabled={busy || !login || !password}
              style={{ border: 0, borderRadius: 7, background: login && password ? ACCENT : "#174454", color: "#fff", padding: "15px 26px", fontSize: 15, fontWeight: 800, cursor: busy ? "wait" : "pointer", width: "100%" }}>
              {busy ? "Проверяю…" : "Войти"}
            </button>
            <p style={{ color: "#58717d", fontSize: 12, marginTop: 14, lineHeight: 1.5 }}>
              Забыли пароль — напишите нам в Telegram или позвоните, выдадим новый.
            </p>
          </form>

          {/* ЗАЯВКА */}
          <form onSubmit={onRequest} style={{ border: `1px solid ${LINE}`, background: PANEL, padding: 30, borderRadius: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: "#9ccc65", marginBottom: 20 }}>НЕТ ДОСТУПА — ЗАПРОСИТЬ</div>
            <label style={label}>ИМЯ *</label>
            <input style={input} value={req.name} onChange={(e) => setReq({ ...req, name: e.target.value })} required />
            <label style={label}>ОРГАНИЗАЦИЯ</label>
            <input style={input} value={req.company} onChange={(e) => setReq({ ...req, company: e.target.value })} placeholder="Проектный институт, ИП, застройщик…" />
            <label style={label}>ТЕЛЕФОН *</label>
            <input style={input} value={req.phone} onChange={(e) => setReq({ ...req, phone: e.target.value })} placeholder="+998 __ ___ __ __" required inputMode="tel" />
            <label style={label}>E-MAIL</label>
            <input style={input} value={req.email} onChange={(e) => setReq({ ...req, email: e.target.value })} inputMode="email" />
            <label style={label}>ЧТО ПРОЕКТИРУЕТЕ</label>
            <textarea style={{ ...input, minHeight: 70, resize: "vertical" }} value={req.message} onChange={(e) => setReq({ ...req, message: e.target.value })} />
            <input tabIndex={-1} autoComplete="off" value={req.website} onChange={(e) => setReq({ ...req, website: e.target.value })}
              style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} aria-hidden="true" />
            {reqDone && <p style={{ color: reqDone.startsWith("Заявка") ? "#9ccc65" : "#ff8a80", fontSize: 13, margin: "0 0 12px" }}>{reqDone}</p>}
            <button type="submit" disabled={reqBusy || !req.name || !req.phone}
              style={{ borderRadius: 7, border: "1px solid #9ccc65", background: "transparent", color: req.name && req.phone ? "#d5f0b8" : "#58717d", padding: "14px 24px", fontSize: 15, fontWeight: 700, cursor: reqBusy ? "wait" : "pointer", width: "100%" }}>
              {reqBusy ? "Отправляю…" : "Отправить заявку"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
