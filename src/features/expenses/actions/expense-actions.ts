"use server";

import { revalidatePath } from "next/cache";

import type { UserRole } from "@/generated/prisma/client";
import { hasRole, requireAuth } from "@/lib/auth-utils";

import {
  createExpense,
  deleteExpense,
  updateExpense,
} from "../services/expense-service";
import {
  EXPENSE_ACCESS_ROLES,
  EXPENSE_DELETE_ROLES,
  type ExpenseActionResult,
} from "../types";
import {
  expenseDeleteSchema,
  expenseSchema,
  expenseUpdateSchema,
} from "../validations/expense-schema";

function safeActionError(error: unknown, fallback: string): ExpenseActionResult {
  const message = error instanceof Error ? error.message : "";
  if (message === "EXPENSE_ACCESS_DENIED") {
    return { success: false, message: "Your active account does not have expense access." };
  }
  if (message === "EXPENSE_EDIT_DENIED") {
    return { success: false, message: "Cashiers can only edit expenses they created." };
  }
  if (message === "EXPENSE_NOT_FOUND") {
    return { success: false, message: "This expense no longer exists." };
  }
  if (message === "EXPENSE_UPDATE_CONFLICT") {
    return {
      success: false,
      message: "This expense changed in another session. Refresh the page before trying again.",
    };
  }
  console.error(fallback, error);
  return { success: false, message: fallback };
}

function validationFailure(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  return {
    success: false as const,
    message: "Please correct the highlighted expense fields.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

export async function createExpenseAction(input: unknown): Promise<ExpenseActionResult> {
  const session = await requireAuth();
  if (!hasRole(session.user.role, EXPENSE_ACCESS_ROLES as readonly UserRole[])) {
    return { success: false, message: "You do not have permission to create expenses." };
  }
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    await createExpense(parsed.data, session.user.id);
    revalidatePath("/expenses");
    return { success: true, message: "Expense created successfully." };
  } catch (error) {
    return safeActionError(error, "The expense could not be created. Please try again.");
  }
}

export async function updateExpenseAction(
  id: unknown,
  expectedUpdatedAt: unknown,
  input: unknown,
): Promise<ExpenseActionResult> {
  const session = await requireAuth();
  if (!hasRole(session.user.role, EXPENSE_ACCESS_ROLES as readonly UserRole[])) {
    return { success: false, message: "You do not have permission to edit expenses." };
  }
  const parsed = expenseUpdateSchema.safeParse({ id, expectedUpdatedAt, expense: input });
  if (!parsed.success) {
    const expenseResult = expenseSchema.safeParse(input);
    return expenseResult.success
      ? { success: false, message: "This expense request is invalid. Refresh and try again." }
      : validationFailure(expenseResult.error);
  }

  try {
    await updateExpense(
      parsed.data.id,
      parsed.data.expectedUpdatedAt,
      parsed.data.expense,
      session.user.id,
    );
    revalidatePath("/expenses");
    return { success: true, message: "Expense updated successfully." };
  } catch (error) {
    return safeActionError(error, "The expense could not be updated. Please try again.");
  }
}

export async function deleteExpenseAction(
  id: unknown,
  expectedUpdatedAt: unknown,
): Promise<ExpenseActionResult> {
  const session = await requireAuth();
  if (!hasRole(session.user.role, EXPENSE_DELETE_ROLES as readonly UserRole[])) {
    return { success: false, message: "Only a super admin or owner can delete expenses." };
  }
  const parsed = expenseDeleteSchema.safeParse({ id, expectedUpdatedAt });
  if (!parsed.success) return { success: false, message: "Invalid expense request." };

  try {
    await deleteExpense(parsed.data.id, parsed.data.expectedUpdatedAt, session.user.id);
    revalidatePath("/expenses");
    return { success: true, message: "Expense deleted and recorded in the activity log." };
  } catch (error) {
    return safeActionError(error, "The expense could not be deleted. Please try again.");
  }
}
