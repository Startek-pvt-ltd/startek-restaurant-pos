"use client";

import { Banknote, CreditCard, QrCode } from "lucide-react";

import { calculateBalance } from "@/features/pos/lib/calculate-totals";
import { formatMoney } from "@/features/pos/lib/format-money";
import type { PosPaymentMethod } from "@/features/pos/types";
import { cn } from "@/lib/utils";

interface PaymentPanelProps { amountReceived: number; currency: string; grandTotal: number; method: PosPaymentMethod; onAmountChange: (value: number) => void; onMethodChange: (method: PosPaymentMethod) => void; }

const paymentOptions = [{ value: "CASH" as const, label: "Cash", icon: Banknote }, { value: "CARD" as const, label: "Card", icon: CreditCard }, { value: "QR" as const, label: "QR", icon: QrCode }];

export function PaymentPanel({ amountReceived, currency, grandTotal, method, onAmountChange, onMethodChange }: PaymentPanelProps) {
  const balance = calculateBalance(amountReceived, grandTotal);
  return <fieldset><legend className="mb-2 text-xs font-black uppercase tracking-wide text-muted-foreground">Payment</legend><div className="grid grid-cols-3 gap-2">{paymentOptions.map(({ value, label, icon: Icon }) => <button aria-pressed={method === value} className={cn("flex min-h-12 items-center justify-center gap-1.5 rounded-xl border text-xs font-black transition focus-visible:ring-2 focus-visible:ring-primary", method === value ? "border-secondary bg-secondary text-white" : "border-input bg-white text-muted-foreground hover:border-primary hover:text-secondary")} key={value} onClick={() => onMethodChange(value)} type="button"><Icon aria-hidden="true" className="size-4" />{label}</button>)}</div>{method === "CASH" && <div className="mt-3 rounded-xl border border-border bg-background/45 p-3"><div className="flex items-end gap-2"><label className="min-w-0 flex-1"><span className="mb-1.5 block text-xs font-bold text-muted-foreground">Amount received</span><input className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm font-black text-secondary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" min={0} onChange={(event) => onAmountChange(Number(event.target.value))} placeholder="0.00" step="0.01" type="number" value={amountReceived || ""} /></label><button className="h-11 shrink-0 rounded-xl border border-primary bg-primary/12 px-3 text-xs font-black text-secondary hover:bg-primary/25 focus-visible:ring-2 focus-visible:ring-primary" onClick={() => onAmountChange(grandTotal)} type="button">Exact</button></div><div className="mt-3 flex items-center justify-between"><span className="text-xs font-bold text-muted-foreground">Balance</span><output className={cn("text-base font-black", balance >= 0 ? "text-green-700" : "text-destructive")} aria-label="Cash balance">{formatMoney(balance, currency)}</output></div></div>}</fieldset>;
}

