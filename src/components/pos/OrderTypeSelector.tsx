"use client";

import { Bike, ShoppingBag, Utensils } from "lucide-react";

import type { PosOrderType } from "@/features/pos/types";
import { cn } from "@/lib/utils";

interface OrderTypeSelectorProps { value: PosOrderType; onChange: (value: PosOrderType) => void; }

const options = [
  { value: "DINE_IN" as const, label: "Dine-In", icon: Utensils },
  { value: "TAKEAWAY" as const, label: "Takeaway", icon: ShoppingBag },
  { value: "DELIVERY" as const, label: "Delivery", icon: Bike },
];

export function OrderTypeSelector({ value, onChange }: OrderTypeSelectorProps) {
  return <fieldset><legend className="mb-2 text-xs font-black uppercase tracking-wide text-muted-foreground">Order type</legend><div className="grid grid-cols-3 gap-2">{options.map(({ value: optionValue, label, icon: Icon }) => <button aria-pressed={value === optionValue} className={cn("flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl border px-2 text-[0.68rem] font-black transition focus-visible:ring-2 focus-visible:ring-primary", value === optionValue ? "border-primary bg-primary text-secondary" : "border-input bg-white text-muted-foreground hover:border-primary/60 hover:text-secondary")} key={optionValue} onClick={() => onChange(optionValue)} type="button"><Icon aria-hidden="true" className="size-4" />{label}</button>)}</div></fieldset>;
}

