"use server";

import { revalidatePath } from "next/cache";

import type { MenuActionResult } from "../types";
import {
  createMenuItem,
  deleteMenuItem,
  setMenuItemAvailable,
  updateMenuItem,
} from "../services/menu-item-service";
import { menuItemIdSchema, menuItemSchema } from "../validations/menu-item";
import { authorizeMenuMutation, getActionError } from "./action-utils";

function refreshMenu() {
  revalidatePath("/menu");
  revalidatePath("/menu/categories");
  revalidatePath("/pos");
  revalidatePath("/dashboard");
}

export async function createMenuItemAction(input: unknown): Promise<MenuActionResult> {
  const authorizationError = await authorizeMenuMutation();
  if (authorizationError) return authorizationError;

  const parsed = menuItemSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted menu item fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await createMenuItem(parsed.data);
    refreshMenu();
    return { success: true, message: "Menu item created successfully." };
  } catch (error) {
    return getActionError(error, "Unable to create the menu item. Please try again.");
  }
}

export async function updateMenuItemAction(id: unknown, input: unknown): Promise<MenuActionResult> {
  const authorizationError = await authorizeMenuMutation();
  if (authorizationError) return authorizationError;

  const parsedId = menuItemIdSchema.safeParse(id);
  const parsedInput = menuItemSchema.safeParse(input);
  if (!parsedId.success || !parsedInput.success) {
    return {
      success: false,
      message: "Please correct the highlighted menu item fields.",
      fieldErrors: parsedInput.success ? undefined : parsedInput.error.flatten().fieldErrors,
    };
  }

  try {
    await updateMenuItem(parsedId.data, parsedInput.data);
    refreshMenu();
    return { success: true, message: "Menu item updated successfully." };
  } catch (error) {
    return getActionError(error, "Unable to update the menu item. Please try again.");
  }
}

export async function toggleMenuItemAction(id: unknown, available: unknown): Promise<MenuActionResult> {
  const authorizationError = await authorizeMenuMutation();
  if (authorizationError) return authorizationError;

  const parsed = menuItemIdSchema.safeParse(id);
  if (!parsed.success || typeof available !== "boolean") {
    return { success: false, message: "Invalid availability request." };
  }

  try {
    await setMenuItemAvailable(parsed.data, available);
    refreshMenu();
    return {
      success: true,
      message: `Menu item marked ${available ? "available" : "unavailable"}.`,
    };
  } catch (error) {
    return getActionError(error, "Unable to update menu item availability.");
  }
}

export async function deleteMenuItemAction(id: unknown): Promise<MenuActionResult> {
  const authorizationError = await authorizeMenuMutation();
  if (authorizationError) return authorizationError;

  const parsed = menuItemIdSchema.safeParse(id);
  if (!parsed.success) return { success: false, message: "Invalid menu item request." };

  try {
    const result = await deleteMenuItem(parsed.data);
    refreshMenu();
    return {
      success: true,
      message: result.mode === "archive"
        ? "Menu item archived successfully. Historical orders remain unchanged."
        : "Menu item permanently deleted successfully.",
    };
  } catch (error) {
    return getActionError(
      error,
      "This item cannot be deleted because it is referenced by an order. Mark it unavailable instead.",
      "This item cannot be deleted because it is referenced by an order. Mark it unavailable instead.",
    );
  }
}
