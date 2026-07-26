import { CheckCircle2, Database, HardDrive, MonitorCog, ShieldAlert, UsersRound } from "lucide-react";

import { readableEnum, relativeDashboardTime } from "@/features/dashboard/formatters";
import type { DashboardHealth } from "@/features/dashboard/types";

export function SystemHealth({ data }: { data: DashboardHealth }) {
  const healthy = data.database === "OPERATIONAL" && data.restaurantConfigured && !data.maintenanceMode;
  return <article className="dashboard-card rounded-2xl border border-border/80 bg-card p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-bold text-foreground">System Health</h2><p className="mt-1 text-xs text-muted-foreground">Live configuration status</p></div>{healthy ? <CheckCircle2 aria-label="System operational" className="size-5 text-success" /> : <ShieldAlert aria-label="System attention required" className="size-5 text-accent" />}</div><dl className="mt-5 space-y-3 text-xs"><HealthRow icon={Database} label="Database" value="Operational" healthy /><HealthRow icon={MonitorCog} label="Mode" value={data.maintenanceMode ? "Maintenance" : "Live"} healthy={!data.maintenanceMode} /><HealthRow icon={UsersRound} label="Active users" value={String(data.activeUsers)} healthy={data.activeUsers > 0} /><HealthRow icon={HardDrive} label="Receipt printer" value={data.printerName ? `${data.printerName} · ${data.printerPaperWidth}mm` : "Not configured"} healthy={Boolean(data.printerName)} /></dl><div className="mt-4 rounded-xl border border-border bg-muted/25 p-3 text-xs"><p className="font-bold text-foreground">Latest backup</p><p className="mt-1 text-muted-foreground">{data.lastBackupStatus ? `${readableEnum(data.lastBackupStatus)}${data.lastBackupAt ? ` · ${relativeDashboardTime(data.lastBackupAt)}` : ""}` : "No backup record available"}</p></div></article>;
}

function HealthRow({ healthy, icon: Icon, label, value }: { healthy: boolean; icon: typeof Database; label: string; value: string }) {
  return <div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon aria-hidden="true" className="size-4" /></span><dt className="text-muted-foreground">{label}</dt><dd className={`ml-auto font-bold ${healthy ? "text-success" : "text-accent"}`}>{value}</dd></div>;
}
