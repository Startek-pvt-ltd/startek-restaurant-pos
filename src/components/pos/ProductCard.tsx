"use client";

import { ImageIcon, Plus, ShoppingBag } from "lucide-react";
import { memo } from "react";

import { formatMoney } from "@/features/pos/lib/format-money";
import type { PosProduct } from "@/features/pos/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  currency: string;
  onAdd: (product: PosProduct) => void;
  product: PosProduct;
}

function ProductImage({ product }: { product: PosProduct }) {
  const safeImage = product.image?.startsWith("/menu-items/") || /^https?:\/\//i.test(product.image ?? "") ? product.image : null;
  if (!safeImage) {
    return <div aria-label={`${product.name} image placeholder`} className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top_right,#fff4d5,#f4b400_170%)] text-secondary" role="img"><ImageIcon aria-hidden="true" className="size-9 opacity-55" /></div>;
  }

  return (
    // Managers may configure local paths or arbitrary trusted http(s) menu image hosts.
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={product.name} className="h-full w-full object-cover" loading="lazy" src={safeImage} />
  );
}

export const ProductCard = memo(function ProductCard({ currency, onAdd, product }: ProductCardProps) {
  const canAdd = product.available;

  return (
    <article className={cn("group overflow-hidden rounded-2xl border bg-card shadow-sm transition duration-200", canAdd ? "border-border hover:-translate-y-0.5 hover:border-primary hover:shadow-lg" : "border-stone-200 opacity-65")}>
      <div className="relative h-28 overflow-hidden sm:h-32">
        <ProductImage product={product} />
        <span className={cn("absolute right-2 top-2 rounded-full px-2 py-1 text-[0.62rem] font-black uppercase tracking-wide backdrop-blur", canAdd ? "bg-success/90 text-white" : "bg-secondary/85 text-white")}>
          {canAdd ? "Available" : "Unavailable"}
        </span>
      </div>
      <div className="p-3">
        <p className="truncate text-[0.68rem] font-bold uppercase tracking-wide text-muted-foreground">{product.categoryName}</p>
        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-black leading-5 text-secondary sm:text-base">{product.name}</h3>
        <div className="mt-1 space-y-0.5">
          {product.variants.length === 0
            ? <p className="text-sm font-black text-secondary">{formatMoney(product.price, currency)}</p>
            : product.variants.map((variant) => <p className="text-xs font-black text-secondary" key={variant.id}><span className="text-muted-foreground">{variant.name}:</span> {formatMoney(variant.price, currency)}</p>)}
        </div>
        <button
          className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-black text-secondary shadow-sm transition hover:bg-amber-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500"
          disabled={!canAdd}
          onClick={() => onAdd(product)}
          type="button"
        >
          {canAdd ? <Plus aria-hidden="true" className="size-5" /> : <ShoppingBag aria-hidden="true" className="size-4" />}
          {canAdd ? "Add" : "Unavailable"}
        </button>
      </div>
    </article>
  );
});
