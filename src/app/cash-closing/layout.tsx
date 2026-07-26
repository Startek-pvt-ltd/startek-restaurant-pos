import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CASH_SESSION_ROLES } from "@/features/cash-closing/types";
import type { UserRole } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth-utils";

export default async function CashClosingLayout({children}:{children:React.ReactNode}) {
  const session=await requireRole(CASH_SESSION_ROLES as readonly UserRole[]);
  return <DashboardShell user={{fullName:session.user.name??session.user.username,role:session.user.role}}>{children}</DashboardShell>;
}
