"use client";

import {
  FormEvent,
  Suspense,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

function AnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [object, setObject] = useState(
    searchParams.get("object") || ""
  );

  function handleContinue(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const value = object.trim();

    if (!value) {
      return;
    }

    const params = new URLSearchParams();

    params.set("object", value);

    /*
     * =====================================================
     * ШАГ 01 → ШАГ 02
     *
     * После объекта всегда открываем FLOW.
     * Никаких переходов напрямую к technology
     * или equipment здесь нет.
     * =====================================================
     */

    router.push(
      `/engineering/analysis/flow?${params.toString()}`
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#06151d",
        color: "#f5f8fa",
        padding: "70px 24px 110px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          margin: "0 auto",
        }}
      >

        {/* =================================================
            НАЗАД
        ================================================= */}

        <button
          type="button"
          onClick={() => router.back()}
          style={{
            border: 0,
            background: "transparent",
            color: "#8fa6b1",
            fontSize: 15,
            cursor: "pointer",
            padding: 0,
            marginBottom: 46,
          }}
        >
          ← Назад
        </button>

        {/* =================================================
            ЗАГОЛОВОК ШАГА
        ================================================= */}

        <div
          style={{
            color: "#00d9ff",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.20em",
            marginBottom: 18,
          }}
        >
          ШАГ 01 / ИСХОДНЫЕ ДАННЫЕ
        </div>

        {/* =================================================
            ИНДИКАТОР ШАГОВ
        ================================================= */}

        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 42,
          }}
        >
          {["01", "02", "03", "04"].map(
            (step) => (
              <div
                key={step}
                style={{
                  width: 48,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${
                    step === "01"
                      ? "rgba(0,217,255,.75)"
                      : "rgba(255,255,255,.12)"
                  }`,
                  borderRadius: 5,
                  color:
                    step === "01"
                      ? "#00d9ff"
                      : "rgba(255,255,255,.35)",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {step}
              </div>
            )
          )}
        </div>

        {/* =================================================
            ЗАГОЛОВОК
        ================================================= */}

        <h1
          style={{
            fontSize:
              "clamp(42px, 7vw, 78px)",
            lineHeight: 1.02,
            letterSpacing: "-0.045em",
            margin: "0 0 24px",
            maxWidth: 850,
          }}
        >
          Расскажите
          <br />
          о вашем объекте
        </h1>

        {/* =================================================
            ОПИСАНИЕ
        ================================================= */}

        <p
          style={{
            maxWidth: 820,
            color: "#8da5b1",
            fontSize: 18,
            lineHeight: 1.7,
            margin: "0 0 48px",
          }}
        >
          Начнём с объекта. На следующем
          шаге система попросит указать
          расход и нагрузку, затем исходные
          показатели сточной воды и только
          после этого предложит технологию.
        </p>

        {/* =================================================
            ФОРМА
        ================================================= */}

        <form onSubmit={handleContinue}>
          <section
            style={{
              border:
                "1px solid #18323e",
              background: "#081b24",
              padding: 34,
              borderRadius: 8,
            }}
          >

            <label
              htmlFor="object"
              style={{
                display: "block",
                color: "#8da5b1",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.16em",
                marginBottom: 12,
              }}
            >
              ЧТО ВЫ ПРОЕКТИРУЕТЕ?
            </label>

            <textarea
              id="object"
              value={object}
              onChange={(event) =>
                setObject(
                  event.target.value
                )
              }
              rows={6}
              placeholder="Например: гостиница на 300 человек, производственный объект, жилой комплекс..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                resize: "vertical",
                minHeight: 150,
                border:
                  "1px solid #294550",
                borderRadius: 6,
                background: "#06151d",
                color: "#f5f8fa",
                padding: 18,
                fontSize: 16,
                lineHeight: 1.6,
                outline: "none",
              }}
            />

            <div
              style={{
                marginTop: 26,
                display: "flex",
                alignItems: "center",
                gap: 18,
                flexWrap: "wrap",
              }}
            >

              <button
                type="submit"
                disabled={!object.trim()}
                style={{
                  border: 0,
                  borderRadius: 7,
                  background:
                    object.trim()
                      ? "#00aeea"
                      : "#174454",
                  color: "#fff",
                  padding:
                    "17px 28px",
                  fontSize: 15,
                  fontWeight: 800,
                  cursor:
                    object.trim()
                      ? "pointer"
                      : "not-allowed",
                }}
              >
                Далее

                <span
                  style={{
                    marginLeft: 12,
                    fontSize: 20,
                  }}
                >
                  →
                </span>
              </button>

              <button
                type="button"
                disabled={!object.trim()}
                onClick={() => {
                  const value = object.trim();
                  if (!value) return;
                  const params = new URLSearchParams();
                  params.set("object", value);
                  router.push(
                    `/engineering/analysis/industry?${params.toString()}`
                  );
                }}
                style={{
                  borderRadius: 7,
                  border: "1px solid #00aeea",
                  background: "transparent",
                  color: object.trim() ? "#9fdcf1" : "#58717d",
                  padding: "16px 24px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: object.trim() ? "pointer" : "not-allowed",
                }}
              >
                Производственный объект — по отрасли →
              </button>

              <span
                style={{
                  color: "#58717d",
                  fontSize: 13,
                }}
              >
                «Далее» — жилые и коммунальные объекты; «по отрасли» —
                заводы и производства с готовыми справочниками загрязнений
              </span>

            </div>
          </section>
        </form>

        {/* =================================================
            ПОСЛЕДОВАТЕЛЬНОСТЬ
        ================================================= */}

        <div
          style={{
            marginTop: 42,
            paddingTop: 28,
            borderTop:
              "1px solid #18323e",
            color: "#526b76",
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          Последовательность анализа:{" "}

          <strong
            style={{
              color: "#6f8792",
            }}
          >
            01 объект → 02 расход и
            нагрузка → 03 исходная вода
            → 04 технология →
            оборудование → итог.
          </strong>
        </div>

      </div>
    </main>
  );
}

/* =========================================================
 * PAGE
 *
 * Suspense нужен для production build,
 * потому что AnalysisContent использует useSearchParams().
 * ========================================================= */

export default function AnalysisPage() {
  return (
    <Suspense fallback={null}>
      <AnalysisContent />
    </Suspense>
  );
}