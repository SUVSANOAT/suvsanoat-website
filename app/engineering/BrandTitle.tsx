"use client";

/* ==================================================================
 * ИМЯ ВО ВКЛАДКЕ БРАУЗЕРА
 *
 * Заголовки страниц заданы в метаданных и кончаются на «SUVSANOAT» —
 * это правильно для нашего домена и неправильно для адреса заказчика:
 * человек открывает свою ссылку, а во вкладке чужое имя. Оно же
 * попадает в закладку и в пересланную ссылку.
 *
 * ПОЧЕМУ НЕ В МЕТАДАННЫХ
 *
 * Честный способ — generateMetadata с чтением домена. Но чтение
 * заголовков запроса делает страницу динамической: витрина перестаёт
 * отдаваться готовой и начинает собираться на каждый заход. Ради
 * подписи во вкладке платить скоростью главной страницы раздела не
 * стоит.
 *
 * Поэтому подмена делается на месте: сервер отдаёт свой заголовок
 * (его видят поисковики нашего домена — там всё верно), а в браузере
 * на чужом адресе имя заменяется на имя владельца адреса. Адрес
 * заказчика закрыт от индексации, так что поисковой разницы нет.
 *
 * Заголовок переписывается и при переходах внутри раздела: App Router
 * ставит его заново после каждой навигации, поэтому следим за самим
 * элементом <title>, а не выполняем подмену один раз.
 * ================================================================== */

import { useEffect } from "react";
import { useBrand } from "./BrandHeader";

/** имя, которое стоит в метаданных страниц раздела */
const OURS = "SUVSANOAT";

export default function BrandTitle() {
  const brand = useBrand();
  const title = brand?.title ?? "";

  useEffect(() => {
    /* Свой знак — ничего не трогаем. */
    if (!title || title.toUpperCase() === OURS) return;

    const fix = () => {
      const now = document.title;
      if (!now.includes(OURS)) return;
      const next = now.split(OURS).join(title);
      if (next !== now) document.title = next;
    };

    fix();

    const el = document.querySelector("title");
    if (!el) return;
    const observer = new MutationObserver(fix);
    observer.observe(el, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [title]);

  return null;
}
