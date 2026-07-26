import type { UserRole } from "@/generated/prisma/client";
import { hasRole, requireAuth } from "@/lib/auth-utils";

import { MENU_MANAGER_ROLES, type MenuActionResult } from "../types";

export async function authorizeMenuMutation(): Promise<MenuActionResult | null> {
  const session = await requireAuth();

  if (!hasRole(session.user.role, MENU_MANAGER_ROLES as readonly UserRole[])) {
    return {
      success: false,
      message: "You have view-only access. A manager is required to make this change.",
    };
  }

  return null;
}

export function getActionError(
  error: unknown,
  fallback: string,
  relationMessage = "This record is still in use and cannot be deleted.",
): MenuActionResult {
  const message = error instanceof Error ? error.message : "";
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : undefined;

  if (message === "MENU_ITEM_NAME_EXISTS") {
    return {
      success: false,
      message: "An item with this name already exists in the selected category.",
    };
  }
  if (message === "CATEGORY_NAME_EXISTS" || code === "P2002") {
    return { success: false, message: "A record with this name already exists." };
  }
  if (message === "CATEGORY_HAS_ITEMS") {
    return {
      success: false,
      message: "This category cannot be deleted while it still contains menu items.",
    };
  }
  if (code === "P2003") return { success: false, message: relationMessage };
  if (message === "CATEGORY_NOT_FOUND" || code === "P2025") {
    return { success: false, message: "The requested record no longer exists." };
  }

  console.error(fallback, error);
  return { success: false, message: fallback };
}
