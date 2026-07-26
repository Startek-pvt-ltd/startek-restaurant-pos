import Link from "next/link";
import { redirect } from "next/navigation";
import { SettingsHeader } from "@/components/settings/SettingsNav";
import { getSettingsBundle } from "@/features/settings/services/settings-service";
import { SETTINGS_ROLES } from "@/features/settings/types";
import { hasRole, requireAuth } from "@/lib/auth-utils";

export default async function SettingsPage(){
  const session=await requireAuth();
  if(!hasRole(session.user.role,SETTINGS_ROLES)) redirect("/settings/profile");
  const s=await getSettingsBundle();
  const cards: Array<[string,string,string]> = [
    ["Restaurant",s.restaurant.name,"/settings/restaurant"],
    ["Receipt",`${s.receipt.paperWidth} mm · ${s.receipt.receiptCopies} copy`,"/settings/receipt"],
    ["Billing",`${s.billing.currencySymbol} · Tax ${s.billing.taxEnabled?`${s.billing.taxPercentage}%`:"off"}`,"/settings/billing"],
    ["Printer",s.printer.printerName,"/settings/printer"],
    ["System",`${s.system.applicationName} ${s.system.applicationVersion}`,"/settings/system"],
    ["Backup","PostgreSQL native backups and guarded restore preparation","/settings/backup"],
    ["Data export","CSV, Excel, and JSON business exports","/settings/data-export"],
    ["Profile",session.user.name??session.user.username,"/settings/profile"],
  ];
  return <div className="space-y-5"><SettingsHeader description="Restaurant, billing, receipt, printer, system, and account configuration." title="Settings"/><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([title,description,href])=><Link className="dashboard-card rounded-3xl border border-border bg-white p-5 shadow-sm" href={href} key={href}><h2 className="font-black text-secondary">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{description}</p><span className="mt-4 inline-block text-sm font-bold text-primary">Open settings →</span></Link>)}</div></div>;
}
