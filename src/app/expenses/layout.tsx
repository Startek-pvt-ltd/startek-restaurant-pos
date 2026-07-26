import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { EXPENSE_ACCESS_ROLES } from "@/features/expenses/types";
import type { UserRole } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth-utils";

export default async function ExpensesLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(EXPENSE_ACCESS_ROLES as readonly UserRole[]);
  return <DashboardShell user={{ fullName: session.user.name ?? session.user.username, role: session.user.role }}>{children}</DashboardShell>;
}
