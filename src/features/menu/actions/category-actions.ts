"use server";

import { revalidatePath } from "next/cache";

import type { MenuActionResult } from "../types";
import { categoryIdSchema, categorySchema } from "../validations/category";
import {
  createCategory,
  deleteCategory,
  setCategoryActive,
  updateCategory,
} from "../services/category-service";
import { authorizeMenuMutation, getActionError } from "./action-utils";

function refreshMenuRoutes() {
  revalidatePath("/menu");
  revalidatePath("/menu/categories");
}

export async function createCategoryAction(input: unknown): Promise<MenuActionResult> {
  const authorizationError = await authorizeMenuMutation();
  if (authorizationError) return authorizationError;

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted category fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await createCategory(parsed.data);
    refreshMenuRoutes();
    return { success: true, message: "Category created successfully." };
  } catch (error) {
    return getActionError(error, "Unable to create the category. Please try again.");
  }
}

export async function updateCategoryAction(id: unknown, input: unknown): Promise<MenuActionResult> {
  const authorizationError = await authorizeMenuMutation();
  if (authorizationError) return authorizationError;

  const parsedId = categoryIdSchema.safeParse(id);
  const parsedInput = categorySchema.safeParse(input);
  if (!parsedId.success || !parsedInput.success) {
    return {
      success: false,
      message: "Please correct the highlighted category fields.",
      fieldErrors: parsedInput.success ? undefined : parsedInput.error.flatten().fieldErrors,
    };
  }

  try {
    await updateCategory(parsedId.data, parsedInput.data);
    refreshMenuRoutes();
    return { success: true, message: "Category updated successfully." };
  } catch (error) {
    return getActionError(error, "Unable to update the category. Please try again.");
  }
}

export async function toggleCategoryAction(id: unknown, active: unknown): Promise<MenuActionResult> {
  const authorizationError = await authorizeMenuMutation();
  if (authorizationError) return authorizationError;

  const parsed = categoryIdSchema.safeParse(id);
  if (!parsed.success || typeof active !== "boolean") {
    return { success: false, message: "Invalid category status request." };
  }

  try {
    await setCategoryActive(parsed.data, active);
    refreshMenuRoutes();
    return {
      success: true,
      message: `Category ${active ? "activated" : "deactivated"} successfully.`,
    };
  } catch (error) {
    return getActionError(error, "Unable to update the category status.");
  }
}

export async function deleteCategoryAction(id: unknown): Promise<MenuActionResult> {
  const authorizationError = await authorizeMenuMutation();
  if (authorizationError) return authorizationError;

  const parsed = categoryIdSchema.safeParse(id);
  if (!parsed.success) return { success: false, message: "Invalid category request." };

  try {
    await deleteCategory(parsed.data);
    refreshMenuRoutes();
    return { success: true, message: "Category deleted successfully." };
  } catch (error) {
    return getActionError(
      error,
      "Unable to delete the category. Please try again.",
      "This category cannot be deleted while it still contains menu items.",
    );
  }
}
