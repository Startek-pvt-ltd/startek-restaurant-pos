import "server-only";

import { Prisma, type UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { notifyActiveUsers } from "@/features/notifications/services/notification-service";
import { getSettingsBundle } from "@/features/settings/services/settings-service";

import type { CheckoutInput } from "../types";

const POS_ROLES: readonly UserRole[] = ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER"];

export async function getPosData() {
  const [categories, products, restaurant, printer] = await Promise.all([
    prisma.category.findMany({
      where: { active: true, deletedAt: null },
      select: {
        id: true,
        name: true,
        _count: { select: { menuItems: { where: { deletedAt: null } } } },
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
    prisma.menuItem.findMany({
      where: { deletedAt: null, category: { active: true, deletedAt: null } },
      select: {
        id: true,
        categoryId: true,
        name: true,
        price: true,
        image: true,
        available: true,
        variants: {
          where: { active: true },
          select: { id: true, name: true, price: true },
          orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
        },
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
    products: products.map(({ category, price, variants, ...product }) => ({
      ...product,
      categoryName: category.name,
      price: Number(price.toFixed(2)),
      variants: variants.map((variant) => ({
        ...variant,
        price: Number(variant.price.toFixed(2)),
      })),
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

          const cartKeys = input.items.map((item) => `${item.menuItemId}:${item.menuItemVariantId ?? "base"}`);
          if (new Set(cartKeys).size !== input.items.length) throw new Error("DUPLICATE_CART_ITEM");
          const uniqueVariantIds = [...new Set(input.items.map((item) => item.menuItemVariantId).filter((id): id is string => Boolean(id)))];
          const uniqueMenuItemIds = [...new Set(input.items.map((item) => item.menuItemId))];

          const [menuItems, variants] = await Promise.all([
            tx.menuItem.findMany({
              where: { id: { in: uniqueMenuItemIds }, deletedAt: null },
              select: {
                id: true,
                price: true,
                available: true,
                variants: { where: { active: true }, select: { id: true } },
                category: { select: { active: true, deletedAt: true } },
              },
            }),
            tx.menuItemVariant.findMany({
              where: { id: { in: uniqueVariantIds }, menuItem: { deletedAt: null } },
              select: {
                id: true,
                name: true,
                price: true,
                active: true,
                menuItem: {
                  select: {
                    id: true,
                    available: true,
                    category: { select: { active: true, deletedAt: true } },
                  },
                },
              },
            }),
          ]);
          const system = await tx.systemSetting.findFirst({ orderBy: { id: "asc" } });

          if (!system) throw new Error("SETTINGS_NOT_FOUND");
          if (menuItems.length !== uniqueMenuItemIds.length) throw new Error("MENU_ITEM_NOT_FOUND");
          if (variants.length !== uniqueVariantIds.length) throw new Error("MENU_ITEM_VARIANT_NOT_FOUND");

          const menuItemMap = new Map(menuItems.map((item) => [item.id, item]));
          const variantMap = new Map(variants.map((variant) => [variant.id, variant]));
          const pricedItems = input.items.map((cartItem) => {
            const menuItem = menuItemMap.get(cartItem.menuItemId);
            if (!menuItem) throw new Error("MENU_ITEM_NOT_FOUND");
            if (!menuItem.available || !menuItem.category.active || menuItem.category.deletedAt) throw new Error("MENU_ITEM_UNAVAILABLE");

            if (!cartItem.menuItemVariantId) {
              if (menuItem.variants.length > 0) throw new Error("MENU_ITEM_VARIANT_REQUIRED");
              return {
                menuItemId: menuItem.id,
                variantId: null,
                variantName: null,
                quantity: cartItem.quantity,
                unitPrice: menuItem.price,
                totalPrice: menuItem.price.mul(cartItem.quantity),
              };
            }

            const variant = variantMap.get(cartItem.menuItemVariantId);
            if (!variant || variant.menuItem.id !== cartItem.menuItemId) {
              throw new Error("MENU_ITEM_VARIANT_NOT_FOUND");
            }
            if (!variant.active || !variant.menuItem.available || !variant.menuItem.category.active || variant.menuItem.category.deletedAt) {
              throw new Error("MENU_ITEM_UNAVAILABLE");
            }

            return {
              menuItemId: variant.menuItem.id,
              variantId: variant.id,
              variantName: variant.name,
              quantity: cartItem.quantity,
              unitPrice: variant.price,
              totalPrice: variant.price.mul(cartItem.quantity),
            };
          });

          const subtotal = pricedItems.reduce(
            (total, item) => total.plus(item.totalPrice),
            new Prisma.Decimal(0),
          );
          const grandTotal = subtotal;

          if (system.requireOrderNotes && !input.notes.trim()) throw new Error("ORDER_NOTES_REQUIRED");
          if ((input.paymentMethod === "CASH" && !system.allowCash) || (input.paymentMethod === "CARD" && !system.allowCard) || (input.paymentMethod === "QR" && !system.allowQr)) throw new Error("PAYMENT_METHOD_DISABLED");

          if (grandTotal.isNegative()) throw new Error("INVALID_TOTAL");

          const receivedAmount = input.paymentMethod === "CASH" && input.amountReceived !== null
            ? new Prisma.Decimal(input.amountReceived.toFixed(2))
            : null;
          const balance = receivedAmount?.minus(grandTotal) ?? new Prisma.Decimal(0);
          if (input.paymentMethod === "CASH" && (receivedAmount === null || balance.isNegative())) {
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
              subtotal,
              discount: 0,
              tax: 0,
              serviceCharge: 0,
              grandTotal,
              items: {
                create: pricedItems.map((item) => ({
                  menuItemId: item.menuItemId,
                  menuItemVariantId: item.variantId,
                  variantName: item.variantName,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  totalPrice: item.totalPrice,
                })),
              },
              payments: {
                create: {
                  paymentMethod: input.paymentMethod,
                  paymentStatus: "PAID",
                  amount: grandTotal,
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
            grandTotal: Number(grandTotal.toFixed(2)),
            balance: Number(balance.toFixed(2)),
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
