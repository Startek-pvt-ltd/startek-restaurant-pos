import "server-only";

import { Prisma, type UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { calculateBalance, calculateTotals, toCents } from "../lib/calculate-totals";
import type { CheckoutInput } from "../types";

const POS_ROLES: readonly UserRole[] = ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER"];

export async function getPosData() {
  const [categories, products, restaurant] = await Promise.all([
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
        taxPercentage: true,
        serviceCharge: true,
      },
      orderBy: { createdAt: "asc" },
    }),
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
      taxPercentage: Number(restaurant.taxPercentage),
      serviceChargePercentage: Number(restaurant.serviceCharge),
    },
  };
}

function createOrderNumber() {
  const now = new Date();
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .replaceAll("-", "");
  const suffix = `${now.getTime()}`.slice(-6);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, "0");

  return `RKH-${date}-${suffix}${random}`;
}

function isPrismaCode(error: unknown, code: string) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
  );
}

export async function createCompletedOrder(cashierId: string, input: CheckoutInput) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
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

          const [menuItems, restaurant] = await Promise.all([
            tx.menuItem.findMany({
              where: { id: { in: uniqueIds } },
              select: {
                id: true,
                price: true,
                available: true,
                category: { select: { active: true } },
              },
            }),
            tx.restaurant.findFirst({
              select: { taxPercentage: true, serviceCharge: true },
              orderBy: { createdAt: "asc" },
            }),
          ]);

          if (!restaurant) throw new Error("SETTINGS_NOT_FOUND");
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
            discountType: input.discountType,
            discountValue: input.discountValue,
            taxPercentage: Number(restaurant.taxPercentage),
            serviceChargePercentage: Number(restaurant.serviceCharge),
          });

          if (!totals.discountValid) throw new Error("INVALID_DISCOUNT");
          if (!totals.totalsValid || totals.grandTotal < 0) throw new Error("INVALID_TOTAL");

          const receivedAmount = input.paymentMethod === "CASH" ? input.amountReceived : null;
          const balance =
            receivedAmount === null ? 0 : calculateBalance(receivedAmount, totals.grandTotal);
          if (input.paymentMethod === "CASH" && (receivedAmount === null || balance < 0)) {
            throw new Error("INSUFFICIENT_PAYMENT");
          }

          const orderNumber = createOrderNumber();
          const order = await tx.order.create({
            data: {
              orderNumber,
              cashierId,
              orderType: input.orderType,
              status: "COMPLETED",
              notes: input.notes || null,
              subtotal: totals.subtotal,
              discount: totals.discount,
              tax: totals.tax,
              serviceCharge: totals.serviceCharge,
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
            select: { orderNumber: true },
          });

          await tx.activityLog.create({
            data: {
              userId: cashierId,
              action: `COMPLETED_ORDER ${order.orderNumber}`,
            },
          });

          return {
            orderNumber: order.orderNumber,
            grandTotal: totals.grandTotal,
            balance,
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (isPrismaCode(error, "P2002") && attempt < 2) continue;
      throw error;
    }
  }

  throw new Error("ORDER_NUMBER_FAILED");
}

