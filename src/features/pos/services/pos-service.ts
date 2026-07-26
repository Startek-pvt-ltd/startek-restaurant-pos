import "server-only";

import { Prisma, type UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { notifyActiveUsers } from "@/features/notifications/services/notification-service";
import { getSettingsBundle } from "@/features/settings/services/settings-service";

import { calculateBalance, calculateTotals, toCents } from "../lib/calculate-totals";
import type { CheckoutInput } from "../types";

const POS_ROLES: readonly UserRole[] = ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER"];

export async function getPosData() {
  const [categories, products, restaurant, printer] = await Promise.all([
    prisma.category.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        _count: { select: { menuItems: true } },
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
    prisma.menuItem.findMany({
      where: { category: { active: true } },
      select: {
        id: true,
        categoryId: true,
        name: true,
        price: true,
        image: true,
        available: true,
        category: { select: { name: true, displayOrder: true } },
      },
      orderBy: [{ category: { displayOrder: "asc" } }, { name: "asc" }],
    }),
    prisma.restaurant.findFirst({
      select: {
        currency: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    getSettingsBundle(),
  ]);

  if (!restaurant) throw new Error("Restaurant billing settings are not configured.");

  return {
    categories: categories.map(({ _count, ...category }) => ({
      ...category,
      itemCount: _count.menuItems,
    })),
    products: products.map(({ category, price, ...product }) => ({
      ...product,
      categoryName: category.name,
      price: Number(price.toFixed(2)),
    })),
    settings: {
      currency: restaurant.currency,
      printerName: printer.printer.printerName,
      printerPaperWidth: printer.printer.paperWidth,
      autoOpenReceiptAfterCheckout: printer.printer.autoOpenReceiptAfterCheckout,
      autoPrintAfterCheckout: printer.printer.autoPrintAfterCheckout,
      printLogo: printer.printer.printLogo,
      receiptCopies: printer.printer.receiptCopies,
      defaultOrderType: printer.billing.defaultOrderType,
      allowCash: printer.billing.allowCash,
      allowCard: printer.billing.allowCard,
      allowQr: printer.billing.allowQr,
      requireOrderNotes: printer.billing.requireOrderNotes,
    },
  };
}

function createOrderPrefix(invoicePrefix: string, timezone: string) {
  const now = new Date();
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .replaceAll("-", "");
  return `${invoicePrefix}-${date}-`;
}

async function createOrderNumber(tx: Prisma.TransactionClient, invoicePrefix: string, padding: number, timezone: string) {
  const prefix = createOrderPrefix(invoicePrefix, timezone);
  const pattern = `^${prefix}[0-9]{${padding}}$`;
  const rows = await tx.$queryRaw<Array<{ nextSequence: number }>>(Prisma.sql`
    WITH invoice_lock AS MATERIALIZED (
      SELECT pg_advisory_xact_lock(hashtext(${prefix}))
    )
    SELECT COALESCE(MAX(CAST(RIGHT(orders."orderNumber", ${padding}) AS INTEGER)), 0) + 1 AS "nextSequence"
    FROM invoice_lock
    LEFT JOIN "Order" AS orders
      ON orders."orderNumber" ~ ${pattern}
  `);
  const nextSequence = Number(rows[0]?.nextSequence ?? 1);
  if (!Number.isSafeInteger(nextSequence) || nextSequence < 1 || nextSequence >= 10 ** padding) {
    throw new Error("ORDER_NUMBER_FAILED");
  }

  return `${prefix}${nextSequence.toString().padStart(padding, "0")}`;
}

function isPrismaCode(error: unknown, code: string) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
  );
}

export async function createCompletedOrder(cashierId: string, input: CheckoutInput) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const cashier = await tx.user.findUnique({
            where: { id: cashierId },
            select: { role: true, status: true },
          });

          if (!cashier || cashier.status !== "ACTIVE" || !POS_ROLES.includes(cashier.role)) {
            throw new Error("POS_ACCESS_DENIED");
          }

          const uniqueIds = [...new Set(input.items.map((item) => item.menuItemId))];
          if (uniqueIds.length !== input.items.length) throw new Error("DUPLICATE_CART_ITEM");

          const menuItems = await tx.menuItem.findMany({
            where: { id: { in: uniqueIds } },
            select: {
              id: true,
              price: true,
              available: true,
              category: { select: { active: true } },
            },
          });
          const system = await tx.systemSetting.findFirst({ orderBy: { id: "asc" } });

          if (!system) throw new Error("SETTINGS_NOT_FOUND");
          if (menuItems.length !== uniqueIds.length) throw new Error("MENU_ITEM_NOT_FOUND");

          const menuItemMap = new Map(menuItems.map((item) => [item.id, item]));
          const pricedItems = input.items.map((cartItem) => {
            const menuItem = menuItemMap.get(cartItem.menuItemId);
            if (!menuItem) throw new Error("MENU_ITEM_NOT_FOUND");
            if (!menuItem.available || !menuItem.category.active) {
              throw new Error("MENU_ITEM_UNAVAILABLE");
            }

            return {
              id: menuItem.id,
              quantity: cartItem.quantity,
              price: Number(menuItem.price),
            };
          });

          const totals = calculateTotals({
            items: pricedItems,
            discountType: "FIXED",
            discountValue: 0,
            taxPercentage: 0,
            serviceChargePercentage: 0,
          });

          if (system.requireOrderNotes && !input.notes.trim()) throw new Error("ORDER_NOTES_REQUIRED");
          if ((input.paymentMethod === "CASH" && !system.allowCash) || (input.paymentMethod === "CARD" && !system.allowCard) || (input.paymentMethod === "QR" && !system.allowQr)) throw new Error("PAYMENT_METHOD_DISABLED");

          if (!totals.totalsValid || totals.grandTotal < 0) throw new Error("INVALID_TOTAL");

          const receivedAmount = input.paymentMethod === "CASH" ? input.amountReceived : null;
          const balance =
            receivedAmount === null ? 0 : calculateBalance(receivedAmount, totals.grandTotal);
          if (input.paymentMethod === "CASH" && (receivedAmount === null || balance < 0)) {
            throw new Error("INSUFFICIENT_PAYMENT");
          }

          const orderNumber = await createOrderNumber(tx, system.invoicePrefix, system.invoiceNumberPadding, system.timezone);
          const order = await tx.order.create({
            data: {
              orderNumber,
              cashierId,
              orderType: input.orderType,
              status: "COMPLETED",
              notes: input.notes || null,
              subtotal: totals.subtotal,
              discount: 0,
              tax: 0,
              serviceCharge: 0,
              grandTotal: totals.grandTotal,
              items: {
                create: pricedItems.map((item) => ({
                  menuItemId: item.id,
                  quantity: item.quantity,
                  unitPrice: item.price,
                  totalPrice: toCents(item.price) * item.quantity / 100,
                })),
              },
              payments: {
                create: {
                  paymentMethod: input.paymentMethod,
                  paymentStatus: "PAID",
                  amount: totals.grandTotal,
                  receivedAmount,
                  changeAmount: input.paymentMethod === "CASH" ? balance : null,
                },
              },
            },
            select: { id: true, orderNumber: true },
          });

          await tx.activityLog.create({
            data: {
              userId: cashierId,
              action: `COMPLETED_ORDER ${order.orderNumber}`,
            },
          });
          await notifyActiveUsers(tx, { title: "Order completed", message: `${order.orderNumber} was completed.`, type: "ORDER_COMPLETED", link: `/orders/${order.id}` });

          return {
            orderId: order.id,
            orderNumber: order.orderNumber,
            grandTotal: totals.grandTotal,
            balance,
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if ((isPrismaCode(error, "P2002") || isPrismaCode(error, "P2034")) && attempt < 4) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("ORDER_NUMBER_FAILED");
}
