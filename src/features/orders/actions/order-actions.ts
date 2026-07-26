"use server";

import { revalidatePath } from "next/cache";

import type { UserRole } from "@/generated/prisma/client";
import { hasRole, requireAuth } from "@/lib/auth-utils";

import {
  type OrderActionResult,
  ORDER_ACCESS_ROLES,
  ORDER_CANCEL_ROLES,
} from "../types";
import { cancellationSchema, orderIdSchema } from "../validations/order";
import { cancelOrder, completePendingOrder } from "../services/order-service";

function refreshOrders(id: string) {
  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
}

function safeActionError(error: unknown, fallback: string): OrderActionResult {
  const message = error instanceof Error ? error.message : "";
  if (message === "ORDER_NOT_PENDING") {
    return { success: false, message: "Only pending orders can be marked completed." };
  }
  if (message === "ORDER_ALREADY_CANCELLED") {
    return { success: false, message: "This order is already cancelled." };
  }
  if (message === "ORDER_NOT_FOUND") {
    return { success: false, message: "The requested order no longer exists." };
  }
  if (message === "ORDER_ACCESS_DENIED") {
    return { success: false, message: "Your active account cannot complete orders." };
  }
  if (message === "ORDER_CANCEL_DENIED") {
    return { success: false, message: "Only an active owner or manager can cancel orders." };
  }
  console.error(fallback, error);
  return { success: false, message: fallback };
}

export async function completeOrderStatusAction(input: unknown): Promise<OrderActionResult> {
  const session = await requireAuth();
  if (!hasRole(session.user.role, ORDER_ACCESS_ROLES as readonly UserRole[])) {
    return { success: false, message: "You do not have permission to complete orders." };
  }
  const parsed = orderIdSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Invalid order request." };

  try {
    const order = await completePendingOrder(parsed.data, session.user.id);
    refreshOrders(parsed.data);
    return { success: true, message: `${order.orderNumber} marked completed.` };
  } catch (error) {
    return safeActionError(error, "The order could not be completed. Please try again.");
  }
}

export async function cancelOrderAction(input: unknown): Promise<OrderActionResult> {
  const session = await requireAuth();
  if (!hasRole(session.user.role, ORDER_CANCEL_ROLES as readonly UserRole[])) {
    return { success: false, message: "Only an owner or manager can cancel orders." };
  }
  const parsed = cancellationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid cancellation request.",
    };
  }

  try {
    const order = await cancelOrder(parsed.data.orderId, parsed.data.reason, session.user.id);
    refreshOrders(parsed.data.orderId);
    return { success: true, message: `${order.orderNumber} cancelled and retained in history.` };
  } catch (error) {
    return safeActionError(error, "The order could not be cancelled. Please try again.");
  }
}
