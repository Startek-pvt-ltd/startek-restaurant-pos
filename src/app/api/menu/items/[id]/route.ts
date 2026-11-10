import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { authorizeMenuApiMutation, menuDeleteErrorResponse } from "@/features/menu/api/menu-api-utils";
import { deleteMenuItem } from "@/features/menu/services/menu-item-service";
import { menuItemIdSchema } from "@/features/menu/validations/menu-item";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorizationError = await authorizeMenuApiMutation();
  if (authorizationError) return authorizationError;

  const parsed = menuItemIdSchema.safeParse((await params).id);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "A valid menu item identifier is required." },
      { status: 400 },
    );
  }

  try {
    const result = await deleteMenuItem(parsed.data);
    for (const path of ["/menu", "/menu/categories", "/pos", "/dashboard"]) revalidatePath(path);
    return NextResponse.json({
      success: true,
      outcome: result.mode,
      message: result.mode === "archive"
        ? "Menu item archived successfully. Historical orders and reports remain unchanged."
        : "Menu item permanently deleted successfully.",
    });
  } catch (error) {
    return menuDeleteErrorResponse(error, "menu item");
  }
}
