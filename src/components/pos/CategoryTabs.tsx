"use client";

import { LayoutGrid, Utensils } from "lucide-react";
import { memo } from "react";

import type { PosCategory } from "@/features/pos/types";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: PosCategory[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const CategoryTabs = memo(function CategoryTabs({
  categories,
  selectedId,
  onSelect,
}: CategoryTabsProps) {
  const options = [{ id: "all", name: "All Items", itemCount: categories.reduce((sum, category) => sum + category.itemCount, 0) }, ...categories];

  return (
    <nav aria-label="Menu categories" className="min-w-0 rounded-2xl border border-border bg-card p-2.5 shadow-sm">
      <div className="flex gap-2 overflow-x-auto pb-0.5 dashboard-scrollbar">
        {options.map((category, index) => {
          const active = selectedId === category.id;
          const Icon = index === 0 ? LayoutGrid : Utensils;
          return (
            <button
              aria-pressed={active}
              className={cn(
                "group flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-left text-sm font-bold transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                active
                  ? "border-primary bg-primary text-secondary shadow-[0_6px_18px_rgba(244,180,0,0.2)]"
                  : "border-border bg-white text-secondary hover:border-primary/60 hover:bg-muted",
              )}
              key={category.id}
              onClick={() => onSelect(category.id)}
              type="button"
            >
              <Icon aria-hidden="true" className={cn("size-4 shrink-0", active ? "text-secondary" : "text-muted-foreground group-hover:text-secondary")} />
              <span className="whitespace-nowrap">{category.name}</span>
              <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[0.65rem]", active ? "bg-secondary/12" : "bg-muted text-muted-foreground")}>{category.itemCount}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});
