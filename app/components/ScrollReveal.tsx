"use client";

import { useEffect } from "react";

/**
 * Плавное появление блоков при прокрутке.
 *
 * Компонент не рисует ничего сам: он один раз находит нужные блоки
 * по классам и вешает на них наблюдатель. Разметку страницы менять
 * не нужно. Если в системе включено «уменьшить движение» —
 * анимация не применяется вовсе.
 */
const SELECTORS = [
  ".sectionTop",
  ".technologySectionHeader",
  ".servicesIntro",
  ".stat",
  ".catalogCard",
  ".technologyCard",
  ".industryCard",
  ".categorySectionHeader",
  ".categoryIntroGrid",
  ".categoryEquipmentCard",
  ".waterProcessStep",
  ".categoryApplicationItem",
];

export default function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(SELECTORS.join(","))
    );

    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("revealShown");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const counters = new Map<Element, number>();

    nodes.forEach((node) => {
      node.classList.add("revealItem");

      const parent = node.parentElement;

      if (parent) {
        const index = counters.get(parent) ?? 0;

        counters.set(parent, index + 1);

        if (index > 0 && index < 9) {
          node.style.transitionDelay = `${Math.min(index, 8) * 70}ms`;
        }
      }

      observer.observe(node);
    });

    return () => {
      observer.disconnect();

      nodes.forEach((node) => {
        node.classList.remove("revealItem", "revealShown");
        node.style.transitionDelay = "";
      });
    };
  }, []);

  return null;
}
