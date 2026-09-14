/* ==================================================================
 * ПОД ЧЬИМ ИМЕНЕМ ВЫХОДИТ ДОКУМЕНТ
 *
 * Отчёт, ведомость и чертёж уходят заказчику, а от него — его
 * заказчику. Имя на них решается здесь, в одном месте: раньше каждый
 * маршрут выдачи решал сам, и три маршрута из пяти про бренд вообще
 * не знали — файл выходил с нашим именем в штампе и в названии.
 *
 * Порядок тот же, что у шапки: сначала бренд вошедшего (он главнее
 * домена — человек может зайти под своим логином и на общий адрес),
 * потом бренд адреса, потом наш.
 *
 * Ошибка базы не должна срывать выдачу документа: расчёт человеку
 * нужнее оформления, поэтому при сбое возвращается наш бренд.
 * ================================================================== */

import { getBrand, getBrandByHostCached, userBrandSlug, HOME_BRAND, type Brand } from "./brands";
import { dbUrl } from "./auth";

export async function resolveBrand(login: string, host: string | null): Promise<Brand> {
  try {
    const slug = dbUrl() ? await userBrandSlug(login) : null;
    const byHost = slug ? null : await getBrandByHostCached(host);
    return byHost ?? (await getBrand(slug));
  } catch {
    return HOME_BRAND;
  }
}
