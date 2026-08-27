import React from "react";

export default function BrandHeader() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        padding: "16px 20px",
        marginBottom: 34,
        border: "1px solid rgba(0,217,255,.18)",
        borderRadius: 12,
        background: "rgba(8,27,36,.82)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
        <img
          src="/suvsanoat-logo.png"
          alt="SUVSANOAT ENGINEERING SYSTEMS"
          style={{
            display: "block",
            width: 270,
            height: "auto",
            maxWidth: "48vw",
            objectFit: "contain",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 14,
          flexWrap: "wrap",
          color: "#8fa6b1",
          fontSize: 12,
          lineHeight: 1.4,
        }}
      >
        <a
          href="https://www.suvsanoat.uz"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#00d9ff", textDecoration: "none", fontWeight: 800 }}
        >
          www.suvsanoat.uz
        </a>
        <span>+998 77 304 34 00</span>
        <a
          href="mailto:suvsanoat@gmail.com"
          style={{ color: "#8fa6b1", textDecoration: "none" }}
        >
          suvsanoat@gmail.com
        </a>
      </div>
    </header>
  );
}
