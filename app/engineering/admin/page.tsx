"use client";

import { type CSSProperties, FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ==================================================================
 * АДМИНКА: ПОЛЬЗОВАТЕЛИ И ЗАЯВКИ НА ДОСТУП
 *
 * Доступ только с ролью admin (проверяет proxy.ts). Пароль
 * показывается один раз при создании или сбросе — скопируйте
 * и отправьте проектировщику.
 * ================================================================== */

type User = {
  id: number; login: string; name: string; company: string; phone: string; email: string;
  active: boolean; created_at: string; last_login: string | null; note: string;
};
type Req = { id: number; name: string; company: string; phone: string; email: string; message: string; status: string; created_at: string };

const BG = "#06151d";
const PANEL = "rgba(255,255,255,0.04)";
const LINE = "rgba(255,255,255,0.12)";
const ACCENT = "#3ec3e6";
const FAINT = "#8fa6b1";

const input: CSSProperties = {
  boxSizing: "border-box", border: "1px solid #294550", borderRadius: 6, background: BG, color: "#f5f8fa",
  padding: "10px 12px", fontSize: 14, outline: "none", width: "100%",
};
const btn: CSSProperties = {
  padding: "8px 14px", borderRadius: 8, border: `1px solid ${LINE}`, background: "transparent", color: "#eaf6fa", fontSize: 13, cursor: "pointer",
};

function dt(s: string | null): string {
  if (!s) return "—";
  return new Date(s).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function translit(s: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p",
    р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
    ў: "u", қ: "q", ғ: "g", ҳ: "h",
  };
  return s.toLowerCase().split("").map((ch) => map[ch] ?? ch).join("").replace(/[^a-z0-9._-]+/g, ".").replace(/^\.+|\.+$/g, "");
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [reqs, setReqs] = useState<Req[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ login: "", name: "", company: "", phone: "", email: "", note: "", password: "" });
  const [issued, setIssued] = useState<{ login: string; password: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const [u, r] = await Promise.all([fetch("/api/admin/users").then((x) => x.json()), fetch("/api/admin/requests").then((x) => x.json())]);
      if (!u.ok) setError(u.error || "Ошибка загрузки пользователей");
      else setUsers(u.users);
      if (r.ok) setReqs(r.requests);
    } catch {
      setError("Нет связи с сервером");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function create(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!data.ok) setError(data.error);
      else {
        setIssued({ login: data.user.login, password: data.password });
        setForm({ login: "", name: "", company: "", phone: "", email: "", note: "", password: "" });
        load();
      }
    } finally {
      setBusy(false);
    }
  }

  async function toggle(u: User) {
    await fetch("/api/admin/users", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: u.id, active: !u.active }) });
    load();
  }

  async function reset(u: User) {
    if (!window.confirm(`Выдать новый пароль для ${u.login}? Старый перестанет работать.`)) return;
    const data = await fetch("/api/admin/users", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: u.id, resetPassword: true }) }).then((x) => x.json());
    if (data.ok) setIssued({ login: u.login, password: data.password });
    else setError(data.error);
  }

  async function remove(u: User) {
    if (!window.confirm(`Удалить пользователя ${u.login} без возможности восстановления?`)) return;
    await fetch("/api/admin/users", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: u.id }) });
    load();
  }

  async function reqStatus(r: Req, status: string) {
    await fetch("/api/admin/requests", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: r.id, status }) });
    load();
  }

  function fromRequest(r: Req) {
    setForm({ login: translit(r.name).slice(0, 30) || `user${r.id}`, name: r.name, company: r.company, phone: r.phone, email: r.email, note: `Заявка №${r.id}: ${r.message}`.slice(0, 200), password: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/engineering/login");
  }

  const issuedText = issued ? `Доступ к расчётам SUVSANOAT\nСайт: https://suvsanoat.uz/engineering\nЛогин: ${issued.login}\nПароль: ${issued.password}` : "";

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#f5f8fa", padding: "50px 24px 110px" }}>
      <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: "0.14em", color: ACCENT, marginBottom: 8 }}>SUVSANOAT · АДМИНИСТРИРОВАНИЕ</div>
            <h1 style={{ fontSize: 28, margin: 0 }}>Пользователи раздела «Инжиниринг»</h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" style={btn} onClick={load}>Обновить</button>
            <button type="button" style={btn} onClick={logout}>Выйти</button>
          </div>
        </div>

        {error && <p style={{ color: "#ff8a80", background: "rgba(255,138,128,0.08)", padding: "10px 14px", borderRadius: 8, fontSize: 14 }}>{error}</p>}

        {issued && (
          <div style={{ border: "1px solid #9ccc65", background: "rgba(156,204,101,0.08)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.1em", color: "#9ccc65", marginBottom: 10 }}>ВЫДАН ДОСТУП — ПАРОЛЬ ПОКАЗЫВАЕТСЯ ОДИН РАЗ</div>
            <pre style={{ margin: "0 0 12px", fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{issuedText}</pre>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" style={{ ...btn, borderColor: "#9ccc65" }} onClick={() => navigator.clipboard?.writeText(issuedText)}>Скопировать для отправки</button>
              <button type="button" style={btn} onClick={() => setIssued(null)}>Скрыть</button>
            </div>
          </div>
        )}

        {/* НОВЫЙ ПОЛЬЗОВАТЕЛЬ */}
        <form onSubmit={create} style={{ border: `1px solid ${LINE}`, background: PANEL, borderRadius: 12, padding: 20, marginBottom: 28 }}>
          <div style={{ fontSize: 12, letterSpacing: "0.1em", color: ACCENT, marginBottom: 14 }}>НОВЫЙ ПОЛЬЗОВАТЕЛЬ</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            <input style={input} placeholder="Логин (латиница) *" value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} required />
            <input style={input} placeholder="Имя" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input style={input} placeholder="Организация" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <input style={input} placeholder="Телефон" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input style={input} placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input style={input} placeholder="Пароль (пусто — сгенерировать)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <input style={{ ...input, marginTop: 10 }} placeholder="Заметка (откуда, что проектирует)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <button type="submit" disabled={busy || !form.login}
            style={{ marginTop: 12, padding: "11px 22px", borderRadius: 8, border: 0, background: form.login ? ACCENT : "#174454", color: "#06232e", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            {busy ? "Создаю…" : "Создать и выдать пароль"}
          </button>
        </form>

        {/* ЗАЯВКИ */}
        <div style={{ fontSize: 12, letterSpacing: "0.1em", color: "#9ccc65", margin: "0 0 10px" }}>
          ЗАЯВКИ НА ДОСТУП — {reqs.filter((r) => r.status === "new").length} НОВЫХ
        </div>
        <div style={{ overflowX: "auto", marginBottom: 28 }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
            <thead>
              <tr>{["Дата", "Имя", "Организация", "Телефон", "E-mail", "Сообщение", "Статус", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${LINE}`, color: FAINT, fontWeight: 600 }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {reqs.map((r) => (
                <tr key={r.id} style={{ opacity: r.status === "new" ? 1 : 0.55 }}>
                  <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>{dt(r.created_at)}</td>
                  <td style={{ padding: "6px 8px" }}>{r.name}</td>
                  <td style={{ padding: "6px 8px" }}>{r.company}</td>
                  <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>{r.phone}</td>
                  <td style={{ padding: "6px 8px" }}>{r.email}</td>
                  <td style={{ padding: "6px 8px", maxWidth: 260 }}>{r.message}</td>
                  <td style={{ padding: "6px 8px" }}>{r.status === "new" ? "новая" : r.status === "done" ? "выдан" : r.status}</td>
                  <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>
                    {r.status === "new" && <>
                      <button type="button" style={{ ...btn, marginRight: 6 }} onClick={() => fromRequest(r)}>В форму</button>
                      <button type="button" style={btn} onClick={() => reqStatus(r, "done")}>Выдан</button>
                    </>}
                  </td>
                </tr>
              ))}
              {!reqs.length && <tr><td colSpan={8} style={{ padding: 10, color: FAINT }}>Заявок нет.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* ПОЛЬЗОВАТЕЛИ */}
        <div style={{ fontSize: 12, letterSpacing: "0.1em", color: ACCENT, margin: "0 0 10px" }}>ПОЛЬЗОВАТЕЛИ — {users.length}</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
            <thead>
              <tr>{["Логин", "Имя", "Организация", "Телефон", "Создан", "Был", "Статус", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${LINE}`, color: FAINT, fontWeight: 600 }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ opacity: u.active ? 1 : 0.5 }}>
                  <td style={{ padding: "6px 8px", fontWeight: 600 }}>{u.login}</td>
                  <td style={{ padding: "6px 8px" }}>{u.name}</td>
                  <td style={{ padding: "6px 8px" }}>{u.company}</td>
                  <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>{u.phone}</td>
                  <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>{dt(u.created_at)}</td>
                  <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>{dt(u.last_login)}</td>
                  <td style={{ padding: "6px 8px" }}>{u.active ? "активен" : "отключён"}</td>
                  <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>
                    <button type="button" style={{ ...btn, marginRight: 6 }} onClick={() => toggle(u)}>{u.active ? "Отключить" : "Включить"}</button>
                    <button type="button" style={{ ...btn, marginRight: 6 }} onClick={() => reset(u)}>Новый пароль</button>
                    <button type="button" style={{ ...btn, color: "#ff8a80" }} onClick={() => remove(u)}>Удалить</button>
                  </td>
                </tr>
              ))}
              {!users.length && <tr><td colSpan={8} style={{ padding: 10, color: FAINT }}>Пользователей пока нет.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
