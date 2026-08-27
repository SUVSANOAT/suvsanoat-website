import React from "react";

export default function BrandFooter() {
  return (
    <footer
      style={{
        marginTop: 42,
        paddingTop: 22,
        borderTop: "1px solid #1c3742",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
        color: "#627a84",
        fontSize: 11,
        lineHeight: 1.6,
      }}
    >
      <div>
        <div
          style={{
            color: "#b7c9d0",
            fontWeight: 900,
            letterSpacing: ".08em",
          }}
        >
          SUVSANOAT ENGINEERING SYSTEMS
        </div>
        <div>
          Расчёт, предварительный инженерный подбор и техническая аналитика.
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <a
          href="https://www.suvsanoat.uz"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#00d9ff", textDecoration: "none", fontWeight: 800 }}
        >
          www.suvsanoat.uz
        </a>
        <div>+998 77 304 34 00 · suvsanoat@gmail.com</div>
      </div>
    </footer>
  );
}
