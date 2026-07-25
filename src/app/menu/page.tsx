import { MenuManagementClient } from "@/components/menu/MenuManagementClient";
import type { UserRole } from "@/generated/prisma/client";
import { getCategories } from "@/features/menu/services/category-service";
import { getMenuItems } from "@/features/menu/services/menu-item-service";
import { MENU_MANAGER_ROLES } from "@/features/menu/types";
import { hasRole, requireAuth } from "@/lib/auth-utils";

interface MenuPageProps {
  searchParams: Promise<{ action?: string | string[] }>;
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const [session, categories, items, params] = await Promise.all([
    requireAuth(),
    getCategories(),
    getMenuItems(),
    searchParams,
  ]);
  const canManage = hasRole(
    session.user.role,
    MENU_MANAGER_ROLES as readonly UserRole[],
  );

  return (
    <MenuManagementClient
      canManage={canManage}
      categories={categories}
      initialCreateOpen={params.action === "new" && canManage}
      items={items}
    />
  );
}

