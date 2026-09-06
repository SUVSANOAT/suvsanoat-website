/* ==================================================================
 * ЗАКАЗЫ НА КОМПЛЕКТ ЧЕРТЕЖЕЙ — база Neon (Postgres)
 *
 * Комплект DXF выдаётся по оплате. Один заказ — один расчёт
 * (пользователь + объект + расход). Жизненный цикл:
 *
 *   pending  — счёт выставлен, оплата не подтверждена;
 *   paid     — администратор отметил поступление оплаты;
 *   issued   — комплект скачан хотя бы один раз.
 *
 * Таблица создаётся сама при первом обращении, как users в lib/auth.ts.
 * Если строки подключения нет (dbUrl() пустой), маршрут работает в
 * режиме без оплаты — см. app/api/drawings/route.ts.
 *
 * Только для серверных маршрутов.
 * ================================================================== */

import { neon } from "@neondatabase/serverless";

import { dbUrl } from "./auth";

/**
 * ЦЕНА КОМПЛЕКТА ЧЕРТЕЖЕЙ, сум.
 *
 * Значение по умолчанию — 1 500 000 сум. Цену меняет администратор
 * правкой этой константы; в заказе сумма фиксируется на момент
 * выставления счёта, поэтому изменение цены не трогает старые заказы.
 */
export const DRAWING_PACKAGE_PRICE_UZS = 1_500_000;

export function packagePrice(): number {
  return DRAWING_PACKAGE_PRICE_UZS;
}

/**
 * Реквизиты для счёта-оферты. Ничего не выдумываем: поля заполняет
 * администратор здесь же; пустое поле в счёт не печатается, вместо
 * него показывается «уточняется».
 */
export type Payee = {
  name: string;
  inn: string;
  bank: string;
  account: string;
  mfo: string;
  contact: string;
};

export const PAYEE: Payee = {
  name: "",
  inn: "",
  bank: "",
  account: "",
  mfo: "",
  contact: "",
};

export function payee(): Payee {
  return { ...PAYEE };
}

/**
 * Оплата картой для физических лиц (Payme/Click) пока не подключена:
 * кнопка в интерфейсе неактивна с подписью «скоро». Флаг оставлен
 * здесь, чтобы включение шло одной правкой.
 */
export const CARD_PAYMENT_ENABLED = false;

export type OrderStatus = "pending" | "paid" | "issued";

export type DrawingOrder = {
  id: number;
  user_login: string;
  object: string;
  q: number;
  created_at: string;
  status: OrderStatus;
  amount: number;
  invoice_no: string;
  issued_at: string | null;
};

function db() {
  const url = dbUrl();
  if (!url) throw new Error("Строка подключения к базе не найдена (DATABASE_URL / POSTGRES_URL)");
  return neon(url);
}

let ordersReady: Promise<void> | null = null;

export function ensureOrdersSchema(): Promise<void> {
  if (!ordersReady) {
    const sql = db();
    ordersReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS drawing_orders (
        id SERIAL PRIMARY KEY,
        user_login TEXT NOT NULL,
        object TEXT NOT NULL DEFAULT '',
        q DOUBLE PRECISION NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        status TEXT NOT NULL DEFAULT 'pending',
        amount DOUBLE PRECISION NOT NULL DEFAULT 0,
        invoice_no TEXT NOT NULL DEFAULT '',
        issued_at TIMESTAMPTZ
      )`;
    })().catch((e) => {
      ordersReady = null;
      throw e;
    });
  }
  return ordersReady;
}

/** ключ расчёта: объект и расход округляются, чтобы повтор того же расчёта попадал в тот же заказ */
export function orderKey(object: string, q: number): { object: string; q: number } {
  return { object: (object || "—").trim().slice(0, 200), q: Math.round(q * 100) / 100 };
}

/** номер счёта: SUV-ГГГГММДД-<id> */
function invoiceNo(id: number, created: Date): string {
  const d = created.toISOString().slice(0, 10).replace(/-/g, "");
  return `SUV-${d}-${String(id).padStart(4, "0")}`;
}

/** действующий заказ пользователя на этот расчёт (последний по времени) */
export async function findOrder(login: string, object: string, q: number): Promise<DrawingOrder | null> {
  await ensureOrdersSchema();
  const sql = db();
  const key = orderKey(object, q);
  const rows = (await sql`SELECT id, user_login, object, q, created_at, status, amount, invoice_no, issued_at
    FROM drawing_orders
    WHERE user_login = ${login} AND object = ${key.object} AND ABS(q - ${key.q}) < 0.5
    ORDER BY created_at DESC LIMIT 1`) as DrawingOrder[];
  return rows[0] ?? null;
}

export async function createOrder(login: string, object: string, q: number): Promise<DrawingOrder> {
  await ensureOrdersSchema();
  const sql = db();
  const key = orderKey(object, q);
  const rows = (await sql`INSERT INTO drawing_orders (user_login, object, q, status, amount)
    VALUES (${login}, ${key.object}, ${key.q}, 'pending', ${packagePrice()})
    RETURNING id, user_login, object, q, created_at, status, amount, invoice_no, issued_at`) as DrawingOrder[];
  const order = rows[0];
  const no = invoiceNo(order.id, new Date(order.created_at));
  await sql`UPDATE drawing_orders SET invoice_no = ${no} WHERE id = ${order.id}`;
  return { ...order, invoice_no: no };
}

/** заказ на этот расчёт: существующий либо новый со статусом pending */
export async function orderFor(login: string, object: string, q: number): Promise<DrawingOrder> {
  return (await findOrder(login, object, q)) ?? (await createOrder(login, object, q));
}

export async function listOrders(): Promise<DrawingOrder[]> {
  await ensureOrdersSchema();
  const sql = db();
  return (await sql`SELECT id, user_login, object, q, created_at, status, amount, invoice_no, issued_at
    FROM drawing_orders ORDER BY created_at DESC LIMIT 500`) as DrawingOrder[];
}

/** админ подтверждает поступление оплаты */
export async function setOrderStatus(id: number, status: OrderStatus): Promise<void> {
  await ensureOrdersSchema();
  const sql = db();
  await sql`UPDATE drawing_orders SET status = ${status} WHERE id = ${id}`;
}

/** первая выдача комплекта: paid → issued, отметка времени */
export async function markIssued(id: number): Promise<void> {
  await ensureOrdersSchema();
  const sql = db();
  await sql`UPDATE drawing_orders SET status = 'issued', issued_at = COALESCE(issued_at, NOW()) WHERE id = ${id}`;
}

/** оплачен ли заказ: paid — можно скачивать, issued — уже скачивали */
export function isPaid(order: DrawingOrder | null): boolean {
  return order?.status === "paid" || order?.status === "issued";
}

/* ------------------------------------------------------------------
 * СЧЁТ-ОФЕРТА ДЛЯ ПОКАЗА НА СТРАНИЦЕ РЕЗУЛЬТАТА
 * ------------------------------------------------------------------ */

export type Invoice = {
  invoiceNo: string;
  amount: number;
  currency: "UZS";
  object: string;
  q: number;
  createdAt: string;
  status: OrderStatus;
  payee: Payee;
  /** оплата картой для физлиц (Payme/Click) — пока заглушка */
  cardEnabled: boolean;
  lines: string[];
};

export function invoiceFor(order: DrawingOrder): Invoice {
  return {
    invoiceNo: order.invoice_no,
    amount: Number(order.amount) || packagePrice(),
    currency: "UZS",
    object: order.object,
    q: Number(order.q),
    createdAt: order.created_at,
    status: order.status,
    payee: payee(),
    cardEnabled: CARD_PAYMENT_ENABLED,
    lines: [
      "Комплект рабочих чертежей очистных сооружений в формате DXF: генеральный план площадки, лист на каждое сооружение (план, разрезы, изометрия), гидравлический профиль, технологическая схема, ведомость чертежей.",
      "Стадия — концептуальный проект (предпроектная проработка) по результатам онлайн-расчёта.",
      "Комплект выдаётся после подтверждения оплаты администратором.",
    ],
  };
}
