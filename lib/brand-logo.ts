/* ==================================================================
 * ЛОГОТИП БРЕНДА ДЛЯ ДОКУМЕНТОВ
 *
 * Отчёт Word и печатная версия PDF выходят под знаком того, кто их
 * заказал. Файл берётся из public по адресу, записанному в бренде, и
 * кладётся в документ как есть.
 *
 * ПРОПОРЦИИ НЕ ЛОМАЮТСЯ
 *
 * Высота считается из настоящих размеров картинки, а не назначается.
 * Растянутый или сплющенный чужой логотип в документе, который уйдёт
 * заказчику, — это хуже, чем документ вовсе без логотипа.
 *
 * Только для серверных маршрутов (node:fs).
 * ================================================================== */

import { readFile } from "node:fs/promises";
import path from "node:path";

export type DocLogo = { data: Uint8Array; ext: "png" | "jpeg"; widthMm: number; heightMm: number };

/** Размеры PNG — из заголовка IHDR, он всегда идёт первым чанком. */
function pngSize(b: Uint8Array): { w: number; h: number } | null {
  if (b.length < 24 || b[0] !== 0x89 || b[1] !== 0x50) return null;
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  return { w: dv.getUint32(16), h: dv.getUint32(20) };
}

/** Размеры JPEG — из первого кадрового маркера SOF. */
function jpegSize(b: Uint8Array): { w: number; h: number } | null {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = b[i + 1];
    const len = (b[i + 2] << 8) | b[i + 3];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { h: (b[i + 5] << 8) | b[i + 6], w: (b[i + 7] << 8) | b[i + 8] };
    }
    i += 2 + len;
  }
  return null;
}

/**
 * Читает логотип бренда из public. Возвращает null, если файла нет или
 * формат не тот: документ должен собраться и без логотипа — отчёт
 * важнее оформления.
 */
export async function loadBrandLogo(logoUrl: string | undefined | null, maxWidthMm = 38): Promise<DocLogo | null> {
  if (!logoUrl || /^https?:/i.test(logoUrl)) return null;
  const rel = logoUrl.replace(/^\/+/, "");
  /* только из public и только внутрь него: «..» в адресе бренда не
     должно выводить чтение за пределы папки */
  const root = path.join(process.cwd(), "public");
  const file = path.resolve(root, rel);
  if (!file.startsWith(root)) return null;

  try {
    const buf = await readFile(file);
    const data = new Uint8Array(buf);
    const ext: "png" | "jpeg" = /\.jpe?g$/i.test(rel) ? "jpeg" : "png";
    const size = ext === "png" ? pngSize(data) : jpegSize(data);
    if (!size || !size.w || !size.h) return null;
    const widthMm = maxWidthMm;
    const heightMm = Math.round(((maxWidthMm * size.h) / size.w) * 10) / 10;
    return { data, ext, widthMm, heightMm };
  } catch {
    return null;
  }
}
