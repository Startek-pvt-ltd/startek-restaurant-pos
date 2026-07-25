"use server";

import type { UserRole } from "@/generated/prisma/client";
import { hasRole, requireAuth } from "@/lib/auth-utils";

import { createCompletedOrder } from "../services/pos-service";
import type { CheckoutResult } from "../types";
import { checkoutSchema } from "../validations/checkout";

const POS_ROLES: readonly UserRole[] = ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER"];

function checkoutError(error: unknown): CheckoutResult {
  const message = error instanceof Error ? error.message : "";
  const knownErrors: Record<string, string> = {
    POS_ACCESS_DENIED: "Your account does not have permission to complete orders.",
    DUPLICATE_CART_ITEM: "The cart contains a duplicate item. Clear the cart and try again.",
    MENU_ITEM_NOT_FOUND: "One or more menu items no longer exist. Refresh the POS and try again.",
    MENU_ITEM_UNAVAILABLE: "One or more items are no longer available. Refresh the POS and update the cart.",
    SETTINGS_NOT_FOUND: "Restaurant billing settings are not configured.",
    INVALID_DISCOUNT: "The discount cannot exceed the order subtotal.",
    INVALID_TOTAL: "The calculated order total is invalid.",
    INSUFFICIENT_PAYMENT: "The cash received is less than the amount due.",
    ORDER_NUMBER_FAILED: "A unique order number could not be created. Please try again.",
  };

  if (knownErrors[message]) return { success: false, message: knownErrors[message] };

  console.error("Unable to complete POS order.", error);
  return {
    success: false,
    message: "The order could not be completed. Check the details and try again.",
  };
}

export async function completeOrderAction(input: unknown): Promise<CheckoutResult> {
  const session = await requireAuth();
  if (!hasRole(session.user.role, POS_ROLES)) {
    return { success: false, message: "Your account cannot create POS orders." };
  }

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid checkout information.",
    };
  }

  try {
    const order = await createCompletedOrder(session.user.id, parsed.data);
    return {
      success: true,
      message: `Order ${order.orderNumber} completed successfully.`,
      ...order,
    };
  } catch (error) {
    return checkoutError(error);
  }
}
