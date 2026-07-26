import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { STAFF_ACCESS_ROLES } from "@/features/staff/types";
import type { UserRole } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth-utils";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(STAFF_ACCESS_ROLES as readonly UserRole[]);
  return <DashboardShell user={{ fullName: session.user.name ?? session.user.username, role: session.user.role }}>{children}</DashboardShell>;
}
