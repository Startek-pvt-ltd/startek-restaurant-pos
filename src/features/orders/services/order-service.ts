import "server-only";

import { Prisma, type UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import {
  type OrderDetailRecord,
  type OrderListFilters,
  ORDER_ACCESS_ROLES,
  ORDER_CANCEL_ROLES,
} from "../types";

function colomboDateBoundary(date: string, endOfDay = false) {
  return new Date(`${date}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}+05:30`);
}

function todayInColombo() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function getOrdersPage(filters: OrderListFilters) {
  const where: Prisma.OrderWhereInput = {
    ...(filters.query
      ? {
          orderNumber: { contains: filters.query, mode: "insensitive" as const },
        }
      : {}),
    ...(filters.dateFrom || filters.dateTo
      ? {
          createdAt: {
            ...(filters.dateFrom ? { gte: colomboDateBoundary(filters.dateFrom) } : {}),
            ...(filters.dateTo ? { lte: colomboDateBoundary(filters.dateTo, true) } : {}),
          },
        }
      : {}),
    ...(filters.orderType ? { orderType: filters.orderType } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.paymentMethod || filters.paymentStatus
      ? {
          payments: {
            some: {
              ...(filters.paymentMethod ? { paymentMethod: filters.paymentMethod } : {}),
              ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
            },
          },
        }
      : {}),
  };

  const today = todayInColombo();
  const todayWhere = {
    gte: colomboDateBoundary(today),
    lte: colomboDateBoundary(today, true),
  };

  const [orders, total, ordersToday, completedToday, pendingOrders, cancelledToday, sales] =
    await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          orderType: true,
          status: true,
          grandTotal: true,
          cashier: { select: { fullName: true } },
          payments: {
            select: { paymentMethod: true, paymentStatus: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: filters.sort === "newest" ? "desc" : "asc" },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.order.count({ where }),
      prisma.order.count({ where: { createdAt: todayWhere } }),
      prisma.order.count({ where: { createdAt: todayWhere, status: "COMPLETED" } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { createdAt: todayWhere, status: "CANCELLED" } }),
      prisma.order.aggregate({
        where: { createdAt: todayWhere, status: "COMPLETED" },
        _sum: { grandTotal: true },
      }),
    ]);

  return {
    orders: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt.toISOString(),
      orderType: order.orderType,
      cashierName: order.cashier.fullName,
      paymentMethod: order.payments[0]?.paymentMethod ?? null,
      paymentStatus: order.payments[0]?.paymentStatus ?? null,
      status: order.status,
      grandTotal: order.grandTotal.toFixed(2),
    })),
    total,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    statistics: {
      ordersToday,
      completedToday,
      pendingOrders,
      cancelledToday,
      totalSalesToday: sales._sum.grandTotal?.toFixed(2) ?? "0.00",
    },
  };
}

export async function getOrderDetail(id: string): Promise<OrderDetailRecord | null> {
  const [order, restaurant] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        updatedAt: true,
        orderType: true,
        status: true,
        notes: true,
        cancellationReason: true,
        cancelledAt: true,
        cancelledBy: { select: { fullName: true } },
        subtotal: true,
        discount: true,
        tax: true,
        serviceCharge: true,
        grandTotal: true,
        cashier: { select: { fullName: true } },
        items: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            notes: true,
            menuItem: { select: { name: true } },
          },
          orderBy: { id: "asc" },
        },
        payments: {
          select: {
            paymentMethod: true,
            paymentStatus: true,
            amount: true,
            receivedAmount: true,
            changeAmount: true,
            reference: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),
    prisma.restaurant.findFirst({
      select: {
        name: true,
        address: true,
        phone: true,
        email: true,
        taxNumber: true,
        logo: true,
        currency: true,
        receiptFooter: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  if (!order || !restaurant) return null;
  const payment = order.payments[0];

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    orderType: order.orderType,
    status: order.status,
    notes: order.notes,
    cancellationReason: order.cancellationReason,
    cancelledAt: order.cancelledAt?.toISOString() ?? null,
    cancelledBy: order.cancelledBy?.fullName ?? null,
    cashierName: order.cashier.fullName,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.menuItem.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toFixed(2),
      totalPrice: item.totalPrice.toFixed(2),
      notes: item.notes,
    })),
    subtotal: order.subtotal.toFixed(2),
    discount: order.discount.toFixed(2),
    tax: order.tax.toFixed(2),
    serviceCharge: order.serviceCharge.toFixed(2),
    grandTotal: order.grandTotal.toFixed(2),
    payment: payment
      ? {
          paymentMethod: payment.paymentMethod,
          paymentStatus: payment.paymentStatus,
          amount: payment.amount.toFixed(2),
          receivedAmount: payment.receivedAmount?.toFixed(2) ?? null,
          balance: payment.changeAmount?.toFixed(2) ?? null,
          reference: payment.reference,
        }
      : null,
    restaurant: { ...restaurant },
  };
}

export async function completePendingOrder(orderId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { role: true, status: true },
    });
    if (
      !user ||
      user.status !== "ACTIVE" ||
      !(ORDER_ACCESS_ROLES as readonly UserRole[]).includes(user.role)
    ) {
      throw new Error("ORDER_ACCESS_DENIED");
    }

    const result = await tx.order.updateMany({
      where: { id: orderId, status: "PENDING" },
      data: { status: "COMPLETED" },
    });
    if (result.count !== 1) throw new Error("ORDER_NOT_PENDING");

    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      select: { orderNumber: true },
    });
    await tx.activityLog.create({
      data: { userId, action: `COMPLETED_ORDER ${order.orderNumber}` },
    });
    return order;
  });
}

export async function cancelOrder(orderId: string, reason: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { role: true, status: true },
    });
    if (
      !user ||
      user.status !== "ACTIVE" ||
      !(ORDER_CANCEL_ROLES as readonly UserRole[]).includes(user.role)
    ) {
      throw new Error("ORDER_CANCEL_DENIED");
    }

    const result = await tx.order.updateMany({
      where: { id: orderId, status: { not: "CANCELLED" } },
      data: {
        status: "CANCELLED",
        cancellationReason: reason,
        cancelledAt: new Date(),
        cancelledById: userId,
      },
    });
    if (result.count !== 1) throw new Error("ORDER_ALREADY_CANCELLED");

    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      select: { orderNumber: true },
    });
    await tx.activityLog.create({
      data: { userId, action: `CANCELLED_ORDER ${order.orderNumber}: ${reason}` },
    });
    return order;
  });
}
