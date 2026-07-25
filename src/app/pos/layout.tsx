import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { UserRole } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth-utils";

const POS_ROLES: readonly UserRole[] = ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER"];

export default async function PosLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(POS_ROLES);

  return (
    <DashboardShell
      contentClassName="px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5"
      user={{ fullName: session.user.name ?? session.user.username, role: session.user.role }}
    >
      {children}
    </DashboardShell>
  );
}

