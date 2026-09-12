"use client";

/* ==================================================================
 * СОХРАНЁННЫЕ РАСЧЁТЫ — ОДНА ПАНЕЛЬ НА ВСЕ ТРИ СТРАНИЦЫ
 *
 * Водовод, участок и сеть сохраняются одинаково, поэтому панель одна:
 * страница отдаёт ей содержимое своих полей и получает его обратно при
 * открытии. Что именно лежит внутри, панель не знает и знать не должна.
 *
 * СОХРАНЯЕТСЯ ВВОД, А НЕ РЕЗУЛЬТАТ
 *
 * Открытый проект пересчитывается заново текущим кодом. Если бы
 * сохранялся результат, после любой правки расчёта старый проект
 * показывал бы вчерашние числа — включая те, что были ошибкой.
 *
 * ЕСЛИ БАЗА НЕ ПОДКЛЮЧЕНА
 *
 * Панель говорит об этом прямо и не делает вид, что сохранила. Молча
 * потерять введённый профиль на девяносто точек — худшее, что она
 * может сделать.
 * ================================================================== */

import { CSSProperties, useCallback, useEffect, useState } from "react";

export type ProjectKind = "main" | "segment" | "network";

type ProjectRow = {
  id: number;
  kind: ProjectKind;
  name: string;
  object: string;
  updated_at: string;
};

export default function ProjectsPanel({
  kind,
  getState,
  onLoad,
  objectName,
}: {
  kind: ProjectKind;
  /** содержимое полей страницы на момент сохранения */
  getState: () => Record<string, unknown>;
  /** восстановление полей страницы из сохранённого */
  onLoad: (data: Record<string, unknown>) => void;
  objectName?: string;
}) {
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [name, setName] = useState("");
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    setErr("");
    try {
      const r = await fetch(`/api/water-projects?kind=${kind}`);
      const j = (await r.json()) as { ok: boolean; projects?: ProjectRow[]; error?: string };
      if (!j.ok) {
        setErr(j.error ?? "Список не прочитался.");
        return;
      }
      setRows(j.projects ?? []);
    } catch {
      setErr("Сервер не ответил.");
    }
  }, [kind]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function save(asNew: boolean) {
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const r = await fetch("/api/water-projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: asNew ? undefined : currentId ?? undefined,
          kind,
          name: name || objectName || "Без названия",
          object: objectName ?? "",
          data: getState(),
        }),
      });
      const j = (await r.json()) as { ok: boolean; project?: ProjectRow; error?: string };
      if (!j.ok || !j.project) {
        setErr(j.error ?? "Не сохранилось.");
        return;
      }
      setCurrentId(j.project.id);
      setName(j.project.name);
      setMsg(`Сохранено: «${j.project.name}».`);
      await refresh();
    } catch {
      setErr("Сервер не ответил.");
    } finally {
      setBusy(false);
    }
  }

  async function load(id: number) {
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const r = await fetch(`/api/water-projects?id=${id}`);
      const j = (await r.json()) as { ok: boolean; project?: ProjectRow & { data: Record<string, unknown> }; error?: string };
      if (!j.ok || !j.project) {
        setErr(j.error ?? "Проект не открылся.");
        return;
      }
      onLoad(j.project.data);
      setCurrentId(j.project.id);
      setName(j.project.name);
      setMsg(`Открыт расчёт «${j.project.name}». Числа на странице пересчитаны заново.`);
    } catch {
      setErr("Сервер не ответил.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number, label: string) {
    if (!window.confirm(`Удалить расчёт «${label}»? Отменить будет нельзя.`)) return;
    setBusy(true);
    setErr("");
    try {
      const r = await fetch(`/api/water-projects?id=${id}`, { method: "DELETE" });
      const j = (await r.json()) as { ok: boolean; error?: string };
      if (!j.ok) {
        setErr(j.error ?? "Не удалось удалить.");
        return;
      }
      if (currentId === id) setCurrentId(null);
      setMsg(`Удалён расчёт «${label}».`);
      await refresh();
    } catch {
      setErr("Сервер не ответил.");
    } finally {
      setBusy(false);
    }
  }

  const when = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <section style={card}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ ...sectionTitle, margin: 0 }}>СОХРАНЁННЫЕ РАСЧЁТЫ</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={objectName || "название расчёта"}
          style={{ ...inputStyle, maxWidth: 280 }}
        />
        <button style={busy ? ghost : primary} onClick={() => void save(false)} disabled={busy}>
          {currentId ? "Сохранить" : "Сохранить новый"}
        </button>
        {currentId !== null && (
          <button style={ghost} onClick={() => void save(true)} disabled={busy}>
            Сохранить как новый
          </button>
        )}
        <button style={ghost} onClick={() => setOpen((v) => !v)}>
          {open ? "Свернуть список" : `Мои расчёты (${rows.length})`}
        </button>
        <span style={{ ...hint, flex: 1, minWidth: 220 }}>
          Сохраняются только введённые данные. При открытии всё считается заново текущим кодом —
          старых чисел из базы на страницу не попадает.
        </span>
      </div>

      {msg && <div style={okBox}>{msg}</div>}
      {err && <div style={warnBox}>{err}</div>}

      {open && (
        <div style={{ marginTop: 14, overflowX: "auto" }}>
          {rows.length === 0 ? (
            <p style={{ ...hint, margin: 0 }}>Сохранённых расчётов этого вида пока нет.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr>
                  <th style={th}>Название</th>
                  <th style={th}>Объект</th>
                  <th style={th}>Изменён</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} style={p.id === currentId ? { background: "#0d2a33" } : undefined}>
                    <td style={td}>{p.name}</td>
                    <td style={{ ...td, color: "#8ca4ad" }}>{p.object || "—"}</td>
                    <td style={{ ...td, color: "#8ca4ad", whiteSpace: "nowrap" }}>{when(p.updated_at)}</td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>
                      <button style={smallBtn} onClick={() => void load(p.id)} disabled={busy}>
                        Открыть
                      </button>
                      <button style={{ ...smallBtn, borderColor: "#5b2a2a", color: "#e0898a" }} onClick={() => void remove(p.id, p.name)} disabled={busy}>
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  );
}

const card: CSSProperties = { background: "#081b24", border: "1px solid #24444f", borderRadius: 12, padding: 22, marginBottom: 18 };
const sectionTitle: CSSProperties = { color: "#657983", fontSize: 12, fontWeight: 800, letterSpacing: "2px" };
const inputStyle: CSSProperties = { background: "#06151d", border: "1px solid #1c3742", borderRadius: 8, color: "#f4f7f8", padding: "10px 12px", fontSize: 15, outline: "none" };
const primary: CSSProperties = { background: "#0f5f73", border: 0, color: "#eaf7fa", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const ghost: CSSProperties = { background: "transparent", border: "1px solid #2a5b68", color: "#5fb6c9", borderRadius: 8, padding: "10px 16px", fontSize: 13, cursor: "pointer" };
const smallBtn: CSSProperties = { background: "transparent", border: "1px solid #2a5b68", color: "#5fb6c9", borderRadius: 8, padding: "6px 12px", fontSize: 12.5, cursor: "pointer", marginRight: 8 };
const hint: CSSProperties = { color: "#8ca4ad", fontSize: 12.5, lineHeight: 1.6 };
const th: CSSProperties = { color: "#b7cbd3", fontSize: 12, fontWeight: 700, textAlign: "left", padding: "9px 10px", borderBottom: "1px solid #1c3742" };
const td: CSSProperties = { textAlign: "left", padding: "9px 10px", borderBottom: "1px solid #102831", color: "#e7eef1" };
const warnBox: CSSProperties = { background: "#2a2112", border: "1px solid #4a3a1c", borderRadius: 10, padding: 12, color: "#ffcf8a", fontSize: 13, marginTop: 12 };
const okBox: CSSProperties = { background: "#0d2a20", border: "1px solid #1d4a38", borderRadius: 10, padding: 12, color: "#8fe0bb", fontSize: 13, marginTop: 12 };
