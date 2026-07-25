"use client";

import { LoaderCircle, Printer, Save, Usb } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updatePrinterSettingsAction } from "@/features/settings/actions/printer-settings-actions";
import type { PrinterSettings } from "@/features/settings/types";

const inputClass = "mt-2 h-11 w-full rounded-xl border border-input bg-white px-3 text-sm font-bold text-secondary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500";

function SettingToggle({ checked, description, disabled, label, onChange }: { checked: boolean; description: string; disabled: boolean; label: string; onChange: (checked: boolean) => void }) {
  return <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border border-border p-3 text-sm font-black text-secondary"><span><span className="block">{label}</span><span className="mt-0.5 block text-xs font-medium text-muted-foreground">{description}</span></span><input checked={checked} className="size-5 shrink-0 accent-primary" disabled={disabled} onChange={(event) => onChange(event.target.checked)} type="checkbox" /></label>;
}

export function PrinterSettingsForm({ canManage, initial }: { canManage: boolean; initial: PrinterSettings }) {
  const [settings, setSettings] = useState(initial);
  const [pending, startTransition] = useTransition();
  const disabled = !canManage || pending;
  const update = <Key extends keyof PrinterSettings>(key: Key, value: PrinterSettings[Key]) => setSettings((current) => ({ ...current, [key]: value }));
  const save = () => startTransition(async () => {
    const result = await updatePrinterSettingsAction({
      printerName: settings.printerName,
      paperWidth: settings.paperWidth,
      autoOpenReceiptAfterCheckout: settings.autoOpenReceiptAfterCheckout,
      autoPrintAfterCheckout: settings.autoPrintAfterCheckout,
      printLogo: settings.printLogo,
      receiptCopies: settings.receiptCopies,
      showTaxLine: settings.showTaxLine,
      showServiceChargeLine: settings.showServiceChargeLine,
    });
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  });

  return <section className="dashboard-card rounded-2xl border border-border bg-card p-5 sm:p-6">
    <div className="flex items-start gap-3 border-b border-border pb-5"><span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-[#a56e00]"><Printer aria-hidden="true" className="size-5" /></span><div><h2 className="text-lg font-black text-secondary">Receipt printer</h2><p className="mt-1 text-sm text-muted-foreground">Browser-based 80 mm receipt defaults for the cashier workstation.</p></div></div>
    <div className="mt-5 grid gap-5 sm:grid-cols-2">
      <label className="text-sm font-black text-secondary">Printer display name<input className={inputClass} disabled={disabled} maxLength={100} onChange={(event) => update("printerName", event.target.value)} value={settings.printerName} /></label>
      <label className="text-sm font-black text-secondary">Paper width<select className={inputClass} disabled value={settings.paperWidth}><option value={80}>80 mm</option></select></label>
      <label className="text-sm font-black text-secondary">Receipt copies<select className={inputClass} disabled={disabled} onChange={(event) => update("receiptCopies", Number(event.target.value))} value={settings.receiptCopies}>{[1, 2, 3].map((copy) => <option key={copy} value={copy}>{copy}</option>)}</select></label>
      <div className="space-y-3 sm:col-span-2">
        <SettingToggle checked={settings.autoOpenReceiptAfterCheckout} description="Navigate to the saved receipt after a successful transaction." disabled={disabled} label="Auto-open receipt preview after checkout" onChange={(value) => update("autoOpenReceiptAfterCheckout", value)} />
        <SettingToggle checked={settings.autoPrintAfterCheckout} description="Trigger the browser/system print dialog after the preview loads." disabled={disabled} label="Auto-trigger print dialog after checkout" onChange={(value) => update("autoPrintAfterCheckout", value)} />
        <SettingToggle checked={settings.printLogo} description="Render a grayscale, high-contrast restaurant logo." disabled={disabled} label="Print logo" onChange={(value) => update("printLogo", value)} />
        <SettingToggle checked={settings.showTaxLine} description="Show the stored tax line on printed receipts." disabled={disabled} label="Show tax line" onChange={(value) => update("showTaxLine", value)} />
        <SettingToggle checked={settings.showServiceChargeLine} description="Show the stored service charge line on printed receipts." disabled={disabled} label="Show service charge line" onChange={(value) => update("showServiceChargeLine", value)} />
        <div className="flex min-h-14 items-center justify-between gap-4 rounded-xl border border-dashed border-input bg-stone-50 p-3 text-sm text-stone-500"><span><span className="flex items-center gap-2 font-black"><Usb aria-hidden="true" className="size-4" />Open cash drawer</span><span className="mt-0.5 block text-xs">Future placeholder — no device command is sent.</span></span><input aria-label="Open cash drawer (future placeholder)" checked={false} className="size-5" disabled type="checkbox" /></div>
      </div>
    </div>
    <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-muted-foreground">Select <strong>{settings.printerName || "Xprinter XP-80T"}</strong>, 80 mm paper, portrait orientation, and disable browser headers/footers in the macOS print dialog.</p>{canManage && <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-secondary px-5 text-sm font-black text-white focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60" disabled={pending} onClick={save} type="button">{pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Save aria-hidden="true" className="size-4" />}{pending ? "Saving…" : "Save receipt settings"}</button>}</div>
  </section>;
}
