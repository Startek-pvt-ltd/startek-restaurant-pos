import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { authorizeMenuApiMutation, menuDeleteErrorResponse } from "@/features/menu/api/menu-api-utils";
import { deleteCategory } from "@/features/menu/services/category-service";
import { categoryIdSchema } from "@/features/menu/validations/category";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorizationError = await authorizeMenuApiMutation();
  if (authorizationError) return authorizationError;

  const parsed = categoryIdSchema.safeParse((await params).id);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "A valid category identifier is required." },
      { status: 400 },
    );
  }

  try {
    const result = await deleteCategory(parsed.data);
    for (const path of ["/menu", "/menu/categories", "/pos", "/dashboard"]) revalidatePath(path);
    return NextResponse.json({
      success: true,
      outcome: result.mode,
      message: result.mode === "archive"
        ? "Category archived successfully. Historical menu data remains unchanged."
        : "Category permanently deleted successfully.",
    });
  } catch (error) {
    return menuDeleteErrorResponse(error, "category");
  }
}
