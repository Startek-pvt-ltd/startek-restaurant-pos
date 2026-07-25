import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { UserRole } from "@/generated/prisma/client";
import { ORDER_ACCESS_ROLES } from "@/features/orders/types";
import { requireRole } from "@/lib/auth-utils";

export default async function OrdersLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(ORDER_ACCESS_ROLES as readonly UserRole[]);
  return <DashboardShell user={{ fullName: session.user.name ?? session.user.username, role: session.user.role }}>{children}</DashboardShell>;
}
