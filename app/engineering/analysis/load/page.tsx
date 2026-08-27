"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const BRAND = {
  website: "www.suvsanoat.uz",
  phone: "+998 77 304 34 00",
  email: "suvsanoat@gmail.com",
  logo: "/suvsanoat-logo.png",
};

function LoadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const object = searchParams.get("object") || "Не указан";

  const flow = Number(searchParams.get("flow") || 0);

  const people = Number(searchParams.get("people") || 0);

  const hours = searchParams.get("hours") || "24";

  const [bod, setBod] = useState(searchParams.get("bod") || "");
  const [cod, setCod] = useState(searchParams.get("cod") || "");
  const [tss, setTss] = useState(searchParams.get("tss") || "");
  const [nitrogen, setNitrogen] = useState(
    searchParams.get("nitrogen") || "",
  );
  const [phosphorus, setPhosphorus] = useState(
    searchParams.get("phosphorus") || "",
  );

  /*
   * =========================================================
   * ПРЕДВАРИТЕЛЬНАЯ НАГРУЗКА
   * =========================================================
   */

  const calculated = useMemo(() => {
    const q = flow > 0 ? flow : 0;

    return {
      bod:
        bod && Number(bod) > 0
          ? (q * Number(bod)) / 1000
          : 0,

      cod:
        cod && Number(cod) > 0
          ? (q * Number(cod)) / 1000
          : 0,

      tss:
        tss && Number(tss) > 0
          ? (q * Number(tss)) / 1000
          : 0,

      nitrogen:
        nitrogen && Number(nitrogen) > 0
          ? (q * Number(nitrogen)) / 1000
          : 0,

      phosphorus:
        phosphorus && Number(phosphorus) > 0
          ? (q * Number(phosphorus)) / 1000
          : 0,
    };
  }, [
    flow,
    bod,
    cod,
    tss,
    nitrogen,
    phosphorus,
  ]);

  /*
   * =========================================================
   * 03 → 04
   * =========================================================
   */

  function goNext() {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    params.set("object", object);

    if (flow > 0) {
      params.set("flow", String(flow));
    }

    if (people > 0) {
      params.set("people", String(people));
    }

    if (hours) {
      params.set("hours", hours);
    }

    if (bod) {
      params.set("bod", bod);
    }

    if (cod) {
      params.set("cod", cod);
    }

    if (tss) {
      params.set("tss", tss);
    }

    if (nitrogen) {
      params.set("nitrogen", nitrogen);
    }

    if (phosphorus) {
      params.set("phosphorus", phosphorus);
    }

    /*
     * На шаге 04 технология ещё не выбрана.
     */
    params.delete("technology");

    router.push(
      `/engineering/analysis/technology?${params.toString()}`,
    );
  }

  /*
   * =========================================================
   * 03 → 02
   * =========================================================
   */

  function goBack() {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    params.delete("technology");

    router.push(
      `/engineering/analysis/flow?${params.toString()}`,
    );
  }

  const hasLoadData = Boolean(
    bod ||
      cod ||
      tss ||
      nitrogen ||
      phosphorus,
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#06131d",
        color: "#fff",
        padding: "32px 24px 100px",
      }}
    >
      <div
        style={{
          maxWidth: 970,
          margin: "0 auto",
        }}
      >
        {/* =====================================================
            BRAND HEADER
            ===================================================== */}

        <BrandHeader />

        {/* =====================================================
            BACK
            ===================================================== */}

        <button
          type="button"
          onClick={goBack}
          style={backButton}
        >
          ← Назад
        </button>

        {/* =====================================================
            STEP
            ===================================================== */}

        <div style={stepLabel}>
          ШАГ 03 / НАГРУЗКА ЗАГРЯЗНЕНИЙ
        </div>

        {/* =====================================================
            PROGRESS
            ===================================================== */}

        <div style={progress}>
          {["01", "02", "03", "04"].map(
            (step) => (
              <div
                key={step}
                style={{
                  ...progressItem,
                  border:
                    step === "03"
                      ? "1px solid rgba(0,217,255,.7)"
                      : "1px solid rgba(255,255,255,.12)",
                  color:
                    step === "03"
                      ? "#00d9ff"
                      : "rgba(255,255,255,.35)",
                }}
              >
                {step}
              </div>
            ),
          )}
        </div>

        {/* =====================================================
            HEADER
            ===================================================== */}

        <div
          style={{
            marginBottom: 42,
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,.45)",
              fontSize: 14,
              marginBottom: 10,
            }}
          >
            Объект:{" "}
            <strong
              style={{
                color: "#00d9ff",
              }}
            >
              {object}
            </strong>
          </div>

          <h1
            style={{
              fontSize:
                "clamp(38px, 6vw, 64px)",
              lineHeight: 1.02,
              letterSpacing: "-.04em",
              margin: 0,
              maxWidth: 760,
            }}
          >
            Какая нагрузка
            <br />
            поступает на очистку?
          </h1>

          <p
            style={{
              maxWidth: 720,
              marginTop: 24,
              color: "rgba(255,255,255,.58)",
              fontSize: 18,
              lineHeight: 1.7,
            }}
          >
            Укажите концентрации загрязнений,
            если они уже известны. Если
            лабораторных анализов пока нет —
            поля можно оставить пустыми.
          </p>
        </div>

        {/* =====================================================
            SUMMARY
            ===================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 1,
            background:
              "rgba(255,255,255,.1)",
            border:
              "1px solid rgba(255,255,255,.1)",
            marginBottom: 28,
          }}
        >
          <Summary
            label="Объект"
            value={object}
          />

          <Summary
            label="Расход"
            value={
              flow > 0
                ? `${flow} м³/сутки`
                : "не указан"
            }
          />

          <Summary
            label="Количество человек"
            value={
              people > 0
                ? `${people} чел.`
                : "не указано"
            }
          />

          <Summary
            label="Работа"
            value={`${hours} ч/сут`}
          />
        </div>

        {/* =====================================================
            FORM
            ===================================================== */}

        <section
          style={{
            border:
              "1px solid rgba(255,255,255,.1)",
            background: "#081923",
            padding: 32,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "rgba(255,255,255,.8)",
              marginBottom: 26,
            }}
          >
            Лабораторные показатели, мг/л
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            <Field
              label="БПК₅"
              value={bod}
              onChange={setBod}
              placeholder="Например: 250"
            />

            <Field
              label="ХПК"
              value={cod}
              onChange={setCod}
              placeholder="Например: 500"
            />

            <Field
              label="Взвешенные вещества"
              value={tss}
              onChange={setTss}
              placeholder="Например: 300"
            />

            <Field
              label="Азот общий"
              value={nitrogen}
              onChange={setNitrogen}
              placeholder="Например: 40"
            />

            <Field
              label="Фосфор общий"
              value={phosphorus}
              onChange={setPhosphorus}
              placeholder="Например: 8"
            />
          </div>
        </section>

        {/* =====================================================
            NORMATIVE BASIS
            ===================================================== */}

        <section
          style={{
            marginTop: 24,
            border:
              "1px solid rgba(255,193,7,.22)",
            background:
              "rgba(255,193,7,.035)",
            padding: "24px 28px",
          }}
        >
          <div
            style={{
              color: "#00d9ff",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: ".16em",
              marginBottom: 14,
            }}
          >
            НОРМАТИВНАЯ ОСНОВА РАСЧЁТА
          </div>

          <div
            style={{
              color: "rgba(255,255,255,.78)",
              fontSize: 14,
              lineHeight: 1.75,
            }}
          >
            <strong>КМК 2.04.03-19</strong>{" "}
            используется для определения
            расчётных расходов сточных вод и
            коэффициентов неравномерности.
            При среднем расходе менее 5 л/с
            расчётный расход определяется
            согласно КМК 2.04.01-98.
          </div>

          <div
            style={{
              marginTop: 14,
              color: "rgba(255,255,255,.48)",
              fontSize: 12,
              lineHeight: 1.7,
            }}
          >
            Концентрации БПК₅, ХПК, взвешенных
            веществ, общего азота и общего
            фосфора на этом шаге являются
            исходными данными пользователя /
            лаборатории. Система не подменяет
            лабораторные данные вымышленными
            нормативными значениями.
          </div>
        </section>

        {/* =====================================================
            CALCULATION
            ===================================================== */}

        {hasLoadData &&
          flow > 0 && (
            <section
              style={{
                marginTop: 24,
                border:
                  "1px solid rgba(0,217,255,.18)",
                background:
                  "rgba(0,217,255,.035)",
                padding: "28px 32px",
              }}
            >
              <div
                style={{
                  color: "#00d9ff",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: ".16em",
                  marginBottom: 20,
                }}
              >
                ПРЕДВАРИТЕЛЬНАЯ
                <br />
                СУТОЧНАЯ НАГРУЗКА
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 20,
                }}
              >
                <Result
                  label="БПК₅"
                  value={calculated.bod}
                />

                <Result
                  label="ХПК"
                  value={calculated.cod}
                />

                <Result
                  label="Взвешенные вещества"
                  value={calculated.tss}
                />

                <Result
                  label="Азот общий"
                  value={calculated.nitrogen}
                />

                <Result
                  label="Фосфор общий"
                  value={calculated.phosphorus}
                />
              </div>
            </section>
          )}

        {/* =====================================================
            NEXT
            ===================================================== */}

        <div
          style={{
            marginTop: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,.3)",
              fontSize: 12,
              lineHeight: 1.6,
              maxWidth: 500,
            }}
          >
            {hasLoadData
              ? "Показатели загрязнений введены и будут переданы на следующий этап."
              : "Лабораторные показатели не введены. Расчёт нагрузки по загрязнениям не выполняется до получения исходных концентраций."}
          </div>

          <button
            type="button"
            onClick={goNext}
            style={primaryButton}
          >
            Перейти к технологии →
          </button>
        </div>

        {/* =====================================================
            ENGINEERING NOTE
            ===================================================== */}

        <p style={disclaimer}>
          Расчёт является предварительным.
          Окончательные проектные значения
          определяются на основании исходных
          данных, технического задания,
          лабораторных анализов и применяемой
          нормативной базы.
        </p>

        {/* =====================================================
            BRAND FOOTER
            ===================================================== */}

        <BrandFooter />
      </div>
    </main>
  );
}

/* =========================================================
 * BRAND HEADER
 * ========================================================= */

function BrandHeader() {
  return (
    <header
      style={{
        border:
          "1px solid rgba(0,217,255,.16)",
        background: "#081923",
        padding: "18px 22px",
        marginBottom: 42,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <img
          src={BRAND.logo}
          alt="Suvsanoat"
          style={{
            display: "block",
            width: 230,
            height: "auto",
            maxHeight: 70,
            objectFit: "contain",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 18,
          flexWrap: "wrap",
          fontSize: 12,
        }}
      >
        <a
          href="https://www.suvsanoat.uz"
          target="_blank"
          rel="noreferrer"
          style={brandLink}
        >
          {BRAND.website}
        </a>

        <span
          style={{
            color: "rgba(255,255,255,.5)",
          }}
        >
          {BRAND.phone}
        </span>

        <span
          style={{
            color: "rgba(255,255,255,.5)",
          }}
        >
          {BRAND.email}
        </span>
      </div>
    </header>
  );
}

/* =========================================================
 * BRAND FOOTER
 * ========================================================= */

function BrandFooter() {
  return (
    <footer
      style={{
        marginTop: 70,
        paddingTop: 26,
        borderTop:
          "1px solid rgba(255,255,255,.09)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <img
          src={BRAND.logo}
          alt="Suvsanoat"
          style={{
            width: 150,
            height: "auto",
            maxHeight: 45,
            objectFit: "contain",
          }}
        />

        <div
          style={{
            color: "rgba(255,255,255,.35)",
            fontSize: 11,
            lineHeight: 1.5,
          }}
        >
          SUVSANOAT ENGINEERING
          <br />
          Инженерные системы очистки воды
        </div>
      </div>

      <div
        style={{
          textAlign: "right",
          color: "rgba(255,255,255,.35)",
          fontSize: 11,
          lineHeight: 1.7,
        }}
      >
        <div>
          {BRAND.website}
        </div>

        <div>
          {BRAND.phone}
        </div>

        <div>
          {BRAND.email}
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
 * FIELD
 * ========================================================= */

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label
      style={{
        display: "block",
      }}
    >
      <span
        style={{
          display: "block",
          marginBottom: 10,
          fontSize: 14,
          fontWeight: 700,
          color: "rgba(255,255,255,.8)",
        }}
      >
        {label}
      </span>

      <div
        style={{
          position: "relative",
        }}
      >
        <input
          type="number"
          min="0"
          step="0.1"
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          style={{
            width: "100%",
            boxSizing: "border-box",
            height: 58,
            border:
              "1px solid rgba(255,255,255,.1)",
            background:
              "rgba(255,255,255,.025)",
            color: "#fff",
            padding: "0 70px 0 18px",
            outline: "none",
            fontSize: 16,
          }}
        />

        <span
          style={{
            position: "absolute",
            right: 18,
            top: "50%",
            transform:
              "translateY(-50%)",
            color:
              "rgba(255,255,255,.3)",
            fontSize: 12,
          }}
        >
          мг/л
        </span>
      </div>
    </label>
  );
}

/* =========================================================
 * SUMMARY
 * ========================================================= */

function Summary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#081923",
        padding: 22,
      }}
    >
      <div
        style={{
          color: "#00d9ff",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: ".16em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
 * RESULT
 * ========================================================= */

function Result({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div
        style={{
          color:
            "rgba(255,255,255,.45)",
          fontSize: 12,
          marginBottom: 6,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
        }}
      >
        {value.toFixed(2)}

        <span
          style={{
            fontSize: 12,
            color:
              "rgba(255,255,255,.35)",
            marginLeft: 5,
          }}
        >
          кг/сут
        </span>
      </div>
    </div>
  );
}

/* =========================================================
 * STYLES
 * ========================================================= */

const backButton: React.CSSProperties = {
  background: "none",
  border: 0,
  color: "rgba(255,255,255,.55)",
  cursor: "pointer",
  padding: 0,
  marginBottom: 55,
  fontSize: 14,
};

const stepLabel: React.CSSProperties = {
  color: "#00d9ff",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: ".22em",
  textTransform: "uppercase",
  marginBottom: 24,
};

const progress: React.CSSProperties = {
  display: "flex",
  gap: 8,
  marginBottom: 38,
};

const progressItem: React.CSSProperties = {
  width: 42,
  height: 28,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 5,
  fontSize: 11,
  fontWeight: 700,
};

const primaryButton: React.CSSProperties = {
  border: 0,
  background: "#ffffff",
  color: "#06131d",
  padding: "16px 26px",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
  minWidth: 220,
};

const brandLink: React.CSSProperties = {
  color: "#00d9ff",
  textDecoration: "none",
  fontWeight: 700,
};

const disclaimer: React.CSSProperties = {
  marginTop: 34,
  color: "rgba(255,255,255,.28)",
  fontSize: 12,
  lineHeight: 1.6,
};

/* =========================================================
 * PAGE
 * ========================================================= */

export default function LoadPage() {
  return (
    <Suspense fallback={null}>
      <LoadContent />
    </Suspense>
  );
}
