import "server-only";

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { MENU_MANAGER_ROLES } from "../types";

export async function authorizeMenuApiMutation(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Authentication is required to manage the menu." },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true },
  });
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json(
      { success: false, message: "Your account is not active." },
      { status: 401 },
    );
  }
  if (!(MENU_MANAGER_ROLES as readonly UserRole[]).includes(user.role)) {
    return NextResponse.json(
      { success: false, message: "A manager is required to delete menu records." },
      { status: 403 },
    );
  }

  return null;
}

export function menuDeleteErrorResponse(error: unknown, entity: "category" | "menu item") {
  const message = error instanceof Error ? error.message : "";
  const code = typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : undefined;

  if (message === "MENU_ITEM_NOT_FOUND" || message === "CATEGORY_NOT_FOUND" || code === "P2025") {
    return NextResponse.json(
      { success: false, message: `The requested ${entity} does not exist.` },
      { status: 404 },
    );
  }
  if (message === "CATEGORY_HAS_ITEMS") {
    return NextResponse.json(
      {
        success: false,
        message: "This category contains active menu items. Move, delete, or archive those items before deleting the category.",
      },
      { status: 409 },
    );
  }
  if (code === "P2003") {
    return NextResponse.json(
      { success: false, message: `The ${entity} is still referenced by required data and cannot be deleted.` },
      { status: 409 },
    );
  }

  console.error(`Unable to delete ${entity}.`, error);
  return NextResponse.json(
    { success: false, message: `Unable to delete the ${entity}. Please try again.` },
    { status: 500 },
  );
}
