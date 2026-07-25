import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireAuth } from "@/lib/auth-utils";

export default async function ReportsLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  return <DashboardShell user={{ fullName: session.user.name ?? session.user.username, role: session.user.role }}>{children}</DashboardShell>;
}
