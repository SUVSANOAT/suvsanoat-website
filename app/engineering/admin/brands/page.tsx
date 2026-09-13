"use client";

/* ==================================================================
 * БРЕНДЫ РАЗДЕЛА: ЗАВЕСТИ ПОКУПАТЕЛЯ ДОСТУПА
 *
 * Одна страница на всю операцию продажи: название и знак покупателя,
 * его домен, срок доступа и логин, которому всё это принадлежит.
 *
 * ПОЧЕМУ ЗДЕСЬ НЕТ ЗАГРУЗКИ ЛОГОТИПА
 *
 * Файл кладётся в public/brands/ вместе с кодом, а сюда вписывается
 * путь. Приёмник загрузки — это отдельное хранилище, проверка формата
 * и размера, и чужие файлы на своём сервере. Ради одного логотипа раз
 * в полгода это лишнее.
 *
 * СРОК ДОСТУПА ОБЯЗАТЕЛЕН ПО СМЫСЛУ
 *
 * Поле можно оставить пустым — тогда доступ бессрочный. Но проданный
 * доступ без срока отозвать нечем, поэтому страница об этом прямо
 * предупреждает.
 * ================================================================== */

import { CSSProperties, useEffect, useState } from "react";
import RequireAuth from "../../RequireAuth";

type Brand = {
  slug: string;
  title: string;
  subtitle: string;
  logo_url: string;
  accent: string;
  contact: string;
  host: string;
  active_until: string | null;
  note: string;
};

const EMPTY: Brand = {
  slug: "",
  title: "",
  subtitle: "",
  logo_url: "",
  accent: "#5fb6c9",
  contact: "",
  host: "",
  active_until: null,
  note: "",
};

export default function BrandsPage() {
  return (
    <RequireAuth>
      <BrandsPageContent />
    </RequireAuth>
  );
}

function BrandsPageContent() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState<Brand>(EMPTY);
  const [login, setLogin] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function refresh() {
    try {
      const r = await fetch("/api/admin/brands");
      const j = (await r.json()) as { ok: boolean; brands?: Brand[]; error?: string };
      if (!j.ok) {
        setErr(j.error ?? "Список не прочитался.");
        return;
      }
      setBrands(j.brands ?? []);
    } catch {
      setErr("Сервер не ответил.");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const set = (k: keyof Brand) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value } as Brand));

  async function save() {
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const r = await fetch("/api/admin/brands", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, login: login || undefined }),
      });
      const j = (await r.json()) as { ok: boolean; brand?: Brand; linked?: string | null; error?: string };
      if (!j.ok) {
        setErr(j.error ?? "Не сохранилось.");
        return;
      }
      setMsg(`Бренд «${j.brand?.title}» сохранён${j.linked ? `, привязан логин ${j.linked}` : ""}.`);
      await refresh();
    } catch {
      setErr("Сервер не ответил.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={page}>
      <div style={container}>
        <div style={eyebrow}>АДМИНИСТРИРОВАНИЕ</div>
        <h1 style={title}>Бренды раздела</h1>
        <p style={lead}>
          Покупатель доступа видит раздел под своим знаком. Код при этом один: копий раздела не
          делается, меняется только оформление и срок.
        </p>

        <section style={card}>
          <div style={sectionTitle}>НОВЫЙ ИЛИ ИЗМЕНЁННЫЙ БРЕНД</div>
          <div style={grid}>
            <label style={field}>
              <span style={fieldLabel}>Идентификатор (латиницей)</span>
              <input value={form.slug} onChange={set("slug")} placeholder="kommunal-liti" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Название в шапке и документах</span>
              <input value={form.title} onChange={set("title")} placeholder="KOMMUNAL LITI" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Подзаголовок</span>
              <input value={form.subtitle} onChange={set("subtitle")} placeholder="Проектирование инженерных сетей" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Логотип: путь в public</span>
              <input value={form.logo_url} onChange={set("logo_url")} placeholder="/brands/kommunal-liti.png" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Фирменный цвет</span>
              <input value={form.accent} onChange={set("accent")} placeholder="#0273d1" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Контакты в шапке</span>
              <input value={form.contact} onChange={set("contact")} placeholder="с 1966 года" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Домен (для отдельного сайта)</span>
              <input value={form.host} onChange={set("host")} placeholder="kl.suvsanoat.uz" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Доступ до (ГГГГ-ММ-ДД)</span>
              <input value={form.active_until ?? ""} onChange={set("active_until")} placeholder="2027-09-13" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Логин владельца</span>
              <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="kommunal" style={inputStyle} />
            </label>
            <label style={field}>
              <span style={fieldLabel}>Заметка для себя</span>
              <input value={form.note} onChange={set("note")} placeholder="договор №__ от __" style={inputStyle} />
            </label>
          </div>

          <p style={{ ...hint, marginTop: 14 }}>
            Пустая дата означает бессрочный доступ. Отозвать его будет нечем, кроме отключения
            пользователя вручную — для проданного доступа лучше поставить срок и продлевать.
          </p>
          <p style={{ ...hint, marginTop: 6 }}>
            Логин заводится отдельно, в разделе пользователей. Здесь он только связывается с брендом:
            под этим логином человек увидит свой знак и на общем адресе.
          </p>

          <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
            <button style={busy ? ghost : primary} onClick={() => void save()} disabled={busy}>
              {busy ? "Сохраняется…" : "Сохранить бренд"}
            </button>
            <button style={ghost} onClick={() => { setForm(EMPTY); setLogin(""); setMsg(""); setErr(""); }}>
              Очистить
            </button>
          </div>

          {msg && <div style={okBox}>{msg}</div>}
          {err && <div style={warnBox}>{err}</div>}
        </section>

        <section style={card}>
          <div style={sectionTitle}>ЗАВЕДЕННЫЕ БРЕНДЫ</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr>
                  <th style={th}>Идентификатор</th>
                  <th style={th}>Название</th>
                  <th style={th}>Домен</th>
                  <th style={th}>Доступ до</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {brands.map((b) => (
                  <tr key={b.slug}>
                    <td style={td}>{b.slug}</td>
                    <td style={td}>{b.title}</td>
                    <td style={{ ...td, color: "#8ca4ad" }}>{b.host || "—"}</td>
                    <td style={{ ...td, color: b.active_until ? "#e7eef1" : "#8ca4ad" }}>{b.active_until ?? "бессрочно"}</td>
                    <td style={td}>
                      <button style={smallBtn} onClick={() => { setForm(b); setMsg(""); setErr(""); }}>
                        Править
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

const page: CSSProperties = { minHeight: "100vh", background: "#06151d", color: "#f4f7f8", fontFamily: "Arial, Helvetica, sans-serif" };
const container: CSSProperties = { width: "min(1150px, calc(100% - 32px))", margin: "0 auto", padding: "60px 0 100px" };
const eyebrow: CSSProperties = { color: "#5fb6c9", fontSize: 12, fontWeight: 800, letterSpacing: "3px" };
const title: CSSProperties = { fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.1, margin: "18px 0 0" };
const lead: CSSProperties = { maxWidth: 780, marginTop: 20, marginBottom: 34, color: "#8ca4ad", fontSize: 16, lineHeight: 1.7 };
const card: CSSProperties = { background: "#081b24", border: "1px solid #1c3742", borderRadius: 12, padding: 22, marginBottom: 18 };
const sectionTitle: CSSProperties = { color: "#657983", fontSize: 12, fontWeight: 800, letterSpacing: "2px", marginBottom: 18 };
const grid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 };
const field: CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };
const fieldLabel: CSSProperties = { color: "#8ca4ad", fontSize: 12 };
const inputStyle: CSSProperties = { background: "#06151d", border: "1px solid #1c3742", borderRadius: 8, color: "#f4f7f8", padding: "10px 12px", fontSize: 15, outline: "none" };
const hint: CSSProperties = { color: "#8ca4ad", fontSize: 12.5, lineHeight: 1.7 };
const primary: CSSProperties = { background: "#0f5f73", border: 0, color: "#eaf7fa", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const ghost: CSSProperties = { background: "transparent", border: "1px solid #2a5b68", color: "#5fb6c9", borderRadius: 8, padding: "10px 16px", fontSize: 13, cursor: "pointer" };
const smallBtn: CSSProperties = { background: "transparent", border: "1px solid #2a5b68", color: "#5fb6c9", borderRadius: 8, padding: "6px 12px", fontSize: 12.5, cursor: "pointer" };
const th: CSSProperties = { color: "#b7cbd3", fontSize: 12, fontWeight: 700, textAlign: "left", padding: "9px 10px", borderBottom: "1px solid #1c3742" };
const td: CSSProperties = { textAlign: "left", padding: "9px 10px", borderBottom: "1px solid #102831", color: "#e7eef1" };
const warnBox: CSSProperties = { background: "#2a2112", border: "1px solid #4a3a1c", borderRadius: 10, padding: 12, color: "#ffcf8a", fontSize: 13, marginTop: 12 };
const okBox: CSSProperties = { background: "#0d2a20", border: "1px solid #1d4a38", borderRadius: 10, padding: 12, color: "#8fe0bb", fontSize: 13, marginTop: 12 };
