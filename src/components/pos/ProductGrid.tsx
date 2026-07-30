"use client";

import { SearchX } from "lucide-react";
import { memo } from "react";

import type { PosProduct } from "@/features/pos/types";

import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  currency: string;
  onAdd: (product: PosProduct) => void;
  products: PosProduct[];
}

export const ProductGrid = memo(function ProductGrid({ currency, onAdd, products }: ProductGridProps) {
  if (products.length === 0) {
    return <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-input bg-card p-8 text-center"><span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-secondary"><SearchX aria-hidden="true" className="size-6" /></span><h2 className="mt-4 font-black text-secondary">No menu items found</h2><p className="mt-1 text-sm text-muted-foreground">Try another category or search term.</p></div>;
  }

  return <section aria-label="Menu products" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">{products.map((product) => <ProductCard currency={currency} key={product.id} onAdd={onAdd} product={product} />)}</section>;
});
