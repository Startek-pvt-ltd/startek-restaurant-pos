import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { requireAuth } from "@/lib/auth-utils";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  return <DashboardShell user={{ fullName: session.user.name ?? session.user.username, role: session.user.role }}><div className="space-y-5"><SettingsNav role={session.user.role} />{children}</div></DashboardShell>;
}
