import { CategoryManagementClient } from "@/components/menu/CategoryManagementClient";
import type { UserRole } from "@/generated/prisma/client";
import { getCategories } from "@/features/menu/services/category-service";
import { MENU_MANAGER_ROLES } from "@/features/menu/types";
import { hasRole, requireAuth } from "@/lib/auth-utils";

export default async function CategoriesPage() {
  const [session, categories] = await Promise.all([requireAuth(), getCategories()]);
  const canManage = hasRole(
    session.user.role,
    MENU_MANAGER_ROLES as readonly UserRole[],
  );

  return <CategoryManagementClient canManage={canManage} categories={categories} />;
}

