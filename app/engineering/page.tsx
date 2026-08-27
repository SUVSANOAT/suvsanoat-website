"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./engineering.module.css";

export default function EngineeringPage() {
  const router = useRouter();

  const [started, setStarted] = useState(false);
  const [project, setProject] = useState("");

  const formRef = useRef<HTMLElement | null>(null);

  const handleStart = () => {
    setStarted(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleAnalyze = () => {
    if (!project.trim()) {
      alert("Пожалуйста, опишите ваш объект.");
      return;
    }

    /*
     * Пока сохраняем введённое описание и
     * переходим на страницу выбора параметров.
     */
    const query = new URLSearchParams();

    query.set("object", project.trim());

    router.push(`/engineering/analysis/flow?${query.toString()}`);
  };

  return (
    <main className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a
            href="/"
            className={styles.logo}
            aria-label="Suvsanoat"
          >
            SUVSANOAT
          </a>

          <div className={styles.headerRight}>
            <span className={styles.headerDot} />
            <span>ENGINEERING</span>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroGrid} />

        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowLine} />
              SUVSANOAT ENGINEERING AI
            </div>

            <h1 className={styles.title}>
              Инженерное решение
              <br />
              для очистки сточных вод
            </h1>

            <p className={styles.lead}>
              Вы даёте исходные данные об объекте. Мы помогаем
              определить производительность, технологическую схему
              и состав оборудования ещё до начала полноценного
              проектирования.
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                onClick={handleStart}
                className={styles.primaryButton}
              >
                Начать анализ
                <span>→</span>
              </button>

              <a
                href="/"
                className={styles.secondaryButton}
              >
                SUVSANOAT
              </a>
            </div>

            <div className={styles.note}>
              <span>AI + ENGINEERING</span>
              <span>
                Предварительное инженерное решение
              </span>
            </div>
          </div>

          {/* ENGINEERING VISUAL */}
          <div className={styles.visual}>
            <div className={styles.visualFrame}>
              <div className={styles.visualTop}>
                <span>ENGINEERING SYSTEM</span>
                <span>01 / 03</span>
              </div>

              <div className={styles.diagram}>
                <div className={styles.diagramLine} />

                <div className={styles.node}>
                  <span>01</span>

                  <strong>
                    Исходные данные
                  </strong>

                  <small>
                    объект / расход / нагрузка
                  </small>
                </div>

                <div className={styles.connector} />

                <div className={styles.node}>
                  <span>02</span>

                  <strong>
                    Технология
                  </strong>

                  <small>
                    MBBR / SBR / MBR / другое
                  </small>
                </div>

                <div className={styles.connector} />

                <div className={styles.node}>
                  <span>03</span>

                  <strong>
                    Оборудование
                  </strong>

                  <small>
                    насосы / воздуходувки / автоматика
                  </small>
                </div>
              </div>

              <div className={styles.visualBottom}>
                <span>ENGINEERING LOGIC</span>

                <span className={styles.status}>
                  ● READY
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className={styles.trustSection}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>
            ЧТО ПОЛУЧАЕТ ПРОЕКТИРОВЩИК
          </div>

          <div className={styles.cards}>
            <article className={styles.card}>
              <div className={styles.cardNumber}>
                01
              </div>

              <h2>AI-анализ</h2>

              <p>
                Система разбирает исходные данные объекта
                и определяет, какие параметры необходимо
                уточнить.
              </p>
            </article>

            <article className={styles.card}>
              <div className={styles.cardNumber}>
                02
              </div>

              <h2>Инженерная логика</h2>

              <p>
                Определяем последовательность процессов
                и состав оборудования, а не просто
                подбираем отдельные позиции.
              </p>
            </article>

            <article className={styles.card}>
              <div className={styles.cardNumber}>
                03
              </div>

              <h2>Обоснование</h2>

              <p>
                Показываем, почему выбран конкретный
                вариант технологии, производительности
                и оборудования.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* FORM / STEP 01 */}
      {started && (
        <section
          ref={formRef}
          className={styles.formSection}
        >
          <div className={styles.containerSmall}>
            <div className={styles.formHeader}>
              <div className={styles.sectionLabel}>
                ШАГ 01 / ИСХОДНЫЕ ДАННЫЕ
              </div>

              <h2>
                Расскажите о вашем объекте
              </h2>

              <p>
                Не обязательно знать специальные
                термины. Опишите объект своими словами —
                инженерная система поможет
                структурировать исходные данные.
              </p>
            </div>

            <div className={styles.formCard}>
              <label
                htmlFor="project"
                className={styles.label}
              >
                Что вы проектируете?
              </label>

              <textarea
                id="project"
                rows={6}
                value={project}
                onChange={(event) =>
                  setProject(event.target.value)
                }
                placeholder="Например: гостиница на 300 человек, расход сточных вод около 50 м³/сутки..."
                className={styles.textarea}
              />

              <div className={styles.formFooter}>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className={styles.primaryButton}
                >
                  Проанализировать
                  <span>→</span>
                </button>

                <span className={styles.formHint}>
                  Результат будет предварительным
                </span>
              </div>
            </div>

            <p className={styles.disclaimer}>
              Предварительный результат не является
              рабочим проектом. Окончательные
              технологические решения принимаются
              после проверки исходных данных инженером.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}