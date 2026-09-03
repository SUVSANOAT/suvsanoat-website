"use client";

import { Fragment, type ReactNode } from "react";

/* ==================================================================
 * ОТОБРАЖЕНИЕ ЗАПИСКИ
 *
 * Записка приходит в Markdown (от ИИ или шаблона). Здесь — маленький
 * рендер без зависимостей: заголовки, абзацы, списки, таблицы, жирный.
 * ================================================================== */

const FAINT = "#8fa6b1";

function inline(text: string, key: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Fragment key={key}>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? <b key={i}>{part.slice(2, -2)}</b> : <Fragment key={i}>{part}</Fragment>
      )}
    </Fragment>
  );
}

function Table({ rows, k }: { rows: string[]; k: string }) {
  const cells = rows
    .filter((r) => !/^\|\s*-{2,}/.test(r))
    .map((r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
  if (!cells.length) return null;
  const [head, ...body] = cells;
  return (
    <div key={k} style={{ overflowX: "auto", margin: "10px 0 14px" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid rgba(255,255,255,0.25)", color: FAINT, fontWeight: 600 }}>
                {inline(h, `h${i}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, r) => (
            <tr key={r}>
              {row.map((c, i) => (
                <td key={i} style={{ padding: "6px 8px", borderBottom: "1px solid rgba(255,255,255,0.08)", verticalAlign: "top" }}>
                  {inline(c, `c${r}-${i}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function NoteView({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  let k = 0;

  while (i < lines.length) {
    const line = lines[i];
    const key = `n${k++}`;

    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("|")) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++]);
      out.push(<Table key={key} rows={rows} k={key} />);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^[-*]\s+/, ""));
      out.push(
        <ul key={key} style={{ margin: "6px 0 12px", paddingLeft: 22, fontSize: 14, lineHeight: 1.6 }}>
          {items.map((it, j) => (
            <li key={j} style={{ marginBottom: 4 }}>{inline(it, `${key}-${j}`)}</li>
          ))}
        </ul>
      );
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\d+\.\s+/, ""));
      out.push(
        <ol key={key} style={{ margin: "6px 0 12px", paddingLeft: 22, fontSize: 14, lineHeight: 1.6 }}>
          {items.map((it, j) => (
            <li key={j} style={{ marginBottom: 4 }}>{inline(it, `${key}-${j}`)}</li>
          ))}
        </ol>
      );
      continue;
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const style =
        level === 1
          ? { fontSize: 22, margin: "0 0 14px", lineHeight: 1.25 }
          : level === 2
          ? { fontSize: 17, margin: "22px 0 8px", lineHeight: 1.3 }
          : { fontSize: 15, margin: "16px 0 6px", lineHeight: 1.3 };
      out.push(
        level === 1 ? <h2 key={key} style={style}>{h[2]}</h2> : level === 2 ? <h3 key={key} style={style}>{h[2]}</h3> : <h4 key={key} style={style}>{h[2]}</h4>
      );
      i++;
      continue;
    }
    /* абзац — до пустой строки */
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|\||[-*]\s|\d+\.\s)/.test(lines[i])) para.push(lines[i++]);
    out.push(
      <p key={key} style={{ fontSize: 14, lineHeight: 1.65, margin: "0 0 10px" }}>
        {inline(para.join(" "), key)}
      </p>
    );
  }

  return <div className="noteBody">{out}</div>;
}
