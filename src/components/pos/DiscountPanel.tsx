"use client";

import { BadgePercent, CircleDollarSign } from "lucide-react";

import type { DiscountType } from "@/features/pos/types";
import { cn } from "@/lib/utils";

interface DiscountPanelProps { type: DiscountType; value: number; valid: boolean; onChange: (type: DiscountType, value: number) => void; }

export function DiscountPanel({ type, value, valid, onChange }: DiscountPanelProps) {
  return <fieldset><legend className="mb-2 text-xs font-black uppercase tracking-wide text-muted-foreground">Discount</legend><div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2"><div className="flex rounded-xl border border-input bg-background/50 p-1">{([{ value: "PERCENTAGE" as const, label: "%", icon: BadgePercent }, { value: "FIXED" as const, label: "Rs.", icon: CircleDollarSign }]).map(({ value: option, label, icon: Icon }) => <button aria-label={option === "PERCENTAGE" ? "Percentage discount" : "Fixed amount discount"} aria-pressed={type === option} className={cn("flex min-w-12 items-center justify-center gap-1 rounded-lg px-2 text-xs font-black transition focus-visible:ring-2 focus-visible:ring-primary", type === option ? "bg-secondary text-white" : "text-muted-foreground hover:bg-muted")} key={option} onClick={() => onChange(option, 0)} title={label} type="button"><Icon aria-hidden="true" className="size-4" /></button>)}</div><label><span className="sr-only">Discount value</span><input aria-invalid={!valid} className={cn("h-11 w-full rounded-xl border bg-white px-3 text-sm font-bold text-secondary outline-none transition focus:ring-4", valid ? "border-input focus:border-primary focus:ring-primary/10" : "border-destructive focus:ring-destructive/10")} min={0} onChange={(event) => onChange(type, Number(event.target.value))} placeholder="0.00" step={type === "PERCENTAGE" ? "1" : "0.01"} type="number" value={value || ""} /></label></div>{!valid && <p className="mt-2 text-xs font-bold text-destructive" role="alert">Discount cannot exceed the subtotal.</p>}</fieldset>;
}

