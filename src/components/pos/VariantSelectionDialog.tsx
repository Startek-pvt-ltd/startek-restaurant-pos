"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { formatMoney } from "@/features/pos/lib/format-money";
import type { PosProduct, PosProductVariant } from "@/features/pos/types";

interface VariantSelectionDialogProps {
  currency: string;
  onClose: () => void;
  onSelect: (variant: PosProductVariant) => void;
  product: PosProduct | null;
}

export function VariantSelectionDialog({ currency, onClose, onSelect, product }: VariantSelectionDialogProps) {
  const firstButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!product) return;
    firstButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, product]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/65 p-4 backdrop-blur-sm" role="presentation">
      <section aria-describedby="variant-dialog-description" aria-labelledby="variant-dialog-title" aria-modal="true" className="w-full max-w-md rounded-3xl border border-primary/25 bg-card p-5 shadow-2xl sm:p-6" role="dialog">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Choose size</p>
            <h2 className="mt-1 text-xl font-black text-secondary" id="variant-dialog-title">{product.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground" id="variant-dialog-description">Select a size to add this item to the cart.</p>
          </div>
          <button aria-label="Close size selection" className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-secondary focus-visible:ring-2 focus-visible:ring-primary" onClick={onClose} type="button"><X aria-hidden="true" className="size-5" /></button>
        </div>
        <div className="mt-5 grid gap-3">
          {product.variants.map((variant, index) => (
            <button
              className="flex min-h-16 items-center justify-between gap-4 rounded-2xl border-2 border-border bg-background/45 px-4 text-left transition hover:border-primary hover:bg-primary/10 active:scale-[0.99] focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20"
              key={variant.id}
              onClick={() => onSelect(variant)}
              ref={index === 0 ? firstButton : undefined}
              type="button"
            >
              <span className="font-black text-secondary">{variant.name}</span>
              <span className="text-base font-black text-secondary">{formatMoney(variant.price, currency)}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
