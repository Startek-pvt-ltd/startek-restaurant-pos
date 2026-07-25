import { ReceiptText } from "lucide-react";

import { PrinterSettingsForm } from "@/components/settings/PrinterSettingsForm";
import type { UserRole } from "@/generated/prisma/client";
import { getPrinterSettings } from "@/features/settings/services/printer-settings-service";
import { PRINTER_MANAGER_ROLES } from "@/features/settings/types";
import { hasRole, requireAuth } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export default async function ReceiptSettingsPage() {
  const [session, settings] = await Promise.all([requireAuth(), getPrinterSettings()]);
  return <div className="mx-auto max-w-4xl space-y-5"><header><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary"><ReceiptText aria-hidden="true" className="size-4" />System settings</div><h1 className="mt-2 text-2xl font-black tracking-tight text-secondary sm:text-3xl">Receipt printing</h1><p className="mt-1 text-sm text-muted-foreground">Configure browser-based Xprinter XP-80T output for Rice &amp; Kottu Hut.</p></header><PrinterSettingsForm canManage={hasRole(session.user.role, PRINTER_MANAGER_ROLES as readonly UserRole[])} initial={settings} /></div>;
}
