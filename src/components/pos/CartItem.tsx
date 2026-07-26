"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { memo } from "react";

import { formatMoney } from "@/features/pos/lib/format-money";
import type { CartLine } from "@/features/pos/types";

interface CartItemProps {
  currency: string;
  item: CartLine;
  onDecrease: (cartKey: string) => void;
  onIncrease: (cartKey: string) => void;
  onRemove: (cartKey: string) => void;
}

export const CartItem = memo(function CartItem({ currency, item, onDecrease, onIncrease, onRemove }: CartItemProps) {
  const lineName = item.variantName ? `${item.name} - ${item.variantName}` : item.name;
  return (
    <li className="rounded-xl border border-border bg-background/35 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="truncate text-sm font-black text-secondary">{item.name}</p>{item.variantName && <p className="mt-0.5 text-xs font-bold text-primary">{item.variantName}</p>}<p className="mt-0.5 text-xs text-muted-foreground">{formatMoney(item.price, currency)} each</p></div>
        <button aria-label={`Remove ${lineName}`} className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive" onClick={() => onRemove(item.cartKey)} type="button"><Trash2 aria-hidden="true" className="size-4" /></button>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center rounded-xl border border-input bg-white p-1">
          <button aria-label={`Decrease ${lineName} quantity`} className="flex size-9 items-center justify-center rounded-lg text-secondary transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40" disabled={item.quantity <= 1} onClick={() => onDecrease(item.cartKey)} type="button"><Minus aria-hidden="true" className="size-4" /></button>
          <output aria-label={`${lineName} quantity`} className="min-w-9 text-center text-sm font-black text-secondary">{item.quantity}</output>
          <button aria-label={`Increase ${lineName} quantity`} className="flex size-9 items-center justify-center rounded-lg bg-primary text-secondary transition hover:bg-amber-500 focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40" disabled={item.quantity >= 99} onClick={() => onIncrease(item.cartKey)} type="button"><Plus aria-hidden="true" className="size-4" /></button>
        </div>
        <p className="text-sm font-black text-secondary">{formatMoney(item.price * item.quantity, currency)}</p>
      </div>
    </li>
  );
});
