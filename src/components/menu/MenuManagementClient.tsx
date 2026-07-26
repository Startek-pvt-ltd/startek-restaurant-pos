"use client";

import {
  ChefHat,
  Clock3,
  Grid2X2,
  Layers3,
  List,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteMenuItemAction,
  toggleMenuItemAction,
} from "@/features/menu/actions/menu-item-actions";
import type { CategoryRecord, MenuItemRecord } from "@/features/menu/types";
import { cn } from "@/lib/utils";

import { ConfirmDialog } from "./ConfirmDialog";
import { MenuItemFormDialog } from "./MenuItemFormDialog";
import { StatusBadge } from "./StatusBadge";
import { ToggleSwitch } from "./ToggleSwitch";

interface MenuManagementClientProps {
  canManage: boolean;
  categories: CategoryRecord[];
  initialCreateOpen?: boolean;
  items: MenuItemRecord[];
}

type AvailabilityFilter = "all" | "available" | "unavailable";
type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "category" | "newest";
type ViewMode = "cards" | "table";

export function formatLkr(value: string | number) {
  return `Rs. ${Number(value).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function MenuImage({ image, name }: { image: string | null; name: string }) {
  const safeImage = image?.startsWith("/menu-items/") || /^https?:\/\//i.test(image ?? "") ? image : null;

  if (!safeImage) {
    return (
      <div
        aria-label={`${name} food image placeholder`}
        className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_right,#fff1c7,#f4b400_180%)] text-secondary"
        role="img"
      >
        <span className="flex size-16 items-center justify-center rounded-2xl bg-white/75 shadow-sm">
          <Utensils aria-hidden="true" className="size-8" />
        </span>
      </div>
    );
  }

  return (
    // Menu images may use manager-provided URLs that cannot be enumerated in next.config.ts.
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={name} className="h-full w-full object-cover" loading="lazy" src={safeImage} />
  );
}

export function MenuManagementClient({
  canManage,
  categories,
  initialCreateOpen = false,
  items,
}: MenuManagementClientProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all");
  const [sort, setSort] = useState<SortOption>("name-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [formOpen, setFormOpen] = useState(initialCreateOpen);
  const [editingItem, setEditingItem] = useState<MenuItemRecord | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItemRecord | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    const result = items.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.name.toLocaleLowerCase().includes(normalizedSearch) ||
        item.categoryName.toLocaleLowerCase().includes(normalizedSearch) ||
        item.description?.toLocaleLowerCase().includes(normalizedSearch);
      const matchesCategory = categoryFilter === "all" || item.categoryId === categoryFilter;
      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" ? item.available : !item.available);

      return matchesSearch && matchesCategory && matchesAvailability;
    });

    return result.sort((a, b) => {
      switch (sort) {
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return Number(a.price) - Number(b.price);
        case "price-desc":
          return Number(b.price) - Number(a.price);
        case "category":
          return a.categoryName.localeCompare(b.categoryName) || a.name.localeCompare(b.name);
        case "newest":
          return Date.parse(b.createdAt) - Date.parse(a.createdAt);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [availabilityFilter, categoryFilter, items, search, sort]);

  const availableCount = items.filter((item) => item.available).length;
  const unavailableCount = items.length - availableCount;

  const toggleAvailability = (item: MenuItemRecord, available: boolean) => {
    setPendingItemId(item.id);
    startTransition(async () => {
      const result = await toggleMenuItemAction(item.id, available);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      setPendingItemId(null);
    });
  };

  const confirmDelete = () => {
    if (!deletingItem) return;
    setPendingItemId(deletingItem.id);
    startTransition(async () => {
      const result = await deleteMenuItemAction(deletingItem.id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      if (result.success) setDeletingItem(null);
      setPendingItemId(null);
    });
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const openEdit = (item: MenuItemRecord) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6 pb-8">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Restaurant catalogue</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-secondary sm:text-3xl">Menu Management</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Keep dishes, pricing, preparation time, and sale availability accurate for the POS team.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-bold text-secondary shadow-sm transition hover:border-primary hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            href="/menu/categories"
          >
            <Layers3 aria-hidden="true" className="size-4" />
            Manage Categories
          </Link>
          {canManage && (
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-[0_8px_22px_rgba(244,180,0,0.2)] transition hover:bg-amber-500 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              onClick={openCreate}
              type="button"
            >
              <Plus aria-hidden="true" className="size-4" />
              Add Menu Item
            </button>
          )}
        </div>
      </section>

      {!canManage && (
        <p className="rounded-2xl border border-primary/35 bg-primary/10 px-4 py-3 text-sm font-medium text-secondary" role="status">
          You have view-only menu access. Owners, managers, and super admins can make changes.
        </p>
      )}

      <section aria-label="Menu summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total Items", value: items.length, icon: ChefHat, tone: "bg-primary/12 text-amber-700" },
          { label: "Categories", value: categories.length, icon: Layers3, tone: "bg-secondary/8 text-secondary" },
          { label: "Available", value: availableCount, icon: Utensils, tone: "bg-success/10 text-green-700" },
          { label: "Unavailable", value: unavailableCount, icon: Clock3, tone: "bg-destructive/8 text-red-700" },
        ].map(({ icon: Icon, label, tone, value }) => (
          <div key={label} className="dashboard-card flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <span className={cn("flex size-10 items-center justify-center rounded-xl", tone)}>
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-xl font-black text-secondary">{value}</p>
              <p className="text-xs font-semibold text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </section>

      <section aria-label="Menu filters" className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_minmax(160px,0.45fr)_minmax(150px,0.4fr)_minmax(160px,0.45fr)_auto]">
          <label className="relative">
            <span className="sr-only">Search menu items</span>
            <Search aria-hidden="true" className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-11 w-full rounded-xl border border-input bg-background/40 pl-10 pr-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, category, description…"
              type="search"
              value={search}
            />
          </label>
          <label>
            <span className="sr-only">Filter by category</span>
            <select className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" onChange={(event) => setCategoryFilter(event.target.value)} value={categoryFilter}>
              <option value="all">All categories</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by availability</span>
            <select className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" onChange={(event) => setAvailabilityFilter(event.target.value as AvailabilityFilter)} value={availabilityFilter}>
              <option value="all">All availability</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </label>
          <label className="relative">
            <span className="sr-only">Sort menu items</span>
            <SlidersHorizontal aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <select className="h-11 w-full rounded-xl border border-input bg-white pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" onChange={(event) => setSort(event.target.value as SortOption)} value={sort}>
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
              <option value="price-asc">Price low–high</option>
              <option value="price-desc">Price high–low</option>
              <option value="category">Category</option>
              <option value="newest">Newest first</option>
            </select>
          </label>
          <div className="flex h-11 rounded-xl border border-input bg-background/40 p-1" role="group" aria-label="Menu view">
            {(["cards", "table"] as const).map((mode) => {
              const Icon = mode === "cards" ? Grid2X2 : List;
              return (
                <button
                  aria-label={`${mode} view`}
                  aria-pressed={viewMode === mode}
                  className={cn("flex size-9 items-center justify-center rounded-lg transition focus-visible:ring-2 focus-visible:ring-primary", viewMode === mode ? "bg-secondary text-white" : "text-muted-foreground hover:bg-muted")}
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  type="button"
                >
                  <Icon aria-hidden="true" className="size-4" />
                </button>
              );
            })}
          </div>
        </div>
        <p className="mt-3 text-xs font-medium text-muted-foreground" aria-live="polite">
          Showing {filteredItems.length} of {items.length} menu items
        </p>
      </section>

      {filteredItems.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-input bg-card px-6 py-16 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-secondary"><Utensils aria-hidden="true" className="size-6" /></span>
          <h2 className="mt-4 text-lg font-bold text-secondary">No menu items found</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {items.length === 0 ? "Create the first menu item to start building the restaurant catalogue." : "Try changing the search or filter options."}
          </p>
          {canManage && items.length === 0 && <button className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-secondary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" onClick={openCreate} type="button">Add first item</button>}
        </section>
      ) : viewMode === "cards" ? (
        <section aria-label="Menu item cards" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredItems.map((item) => (
            <article className={cn("dashboard-card overflow-hidden rounded-3xl border border-border bg-card", !item.available && "opacity-80")} key={item.id}>
              <div className="relative h-44 overflow-hidden bg-muted">
                <MenuImage image={item.image} name={item.name} />
                <span className="absolute left-3 top-3 rounded-full bg-secondary/90 px-2.5 py-1 text-[0.68rem] font-bold text-white backdrop-blur">{item.categoryName}</span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-black text-secondary">{item.name}</h2>
                    <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">{item.description || "No description added."}</p>
                  </div>
                  <StatusBadge active={item.available} activeLabel="Available" inactiveLabel="Unavailable" />
                </div>
                <div className="mt-4 flex items-end justify-between gap-3 border-t border-border pt-4">
                  <div>
                    <p className="text-lg font-black text-secondary">{formatLkr(item.price)}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-muted-foreground"><Clock3 aria-hidden="true" className="size-3.5" /> {item.preparationTime} min</p>
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-1.5">
                      <ToggleSwitch checked={item.available} disabled={isPending && pendingItemId === item.id} label={`Mark ${item.name} ${item.available ? "unavailable" : "available"}`} onChange={(checked) => toggleAvailability(item, checked)} />
                      <button aria-label={`Edit ${item.name}`} className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-secondary focus-visible:ring-2 focus-visible:ring-primary" onClick={() => openEdit(item)} type="button"><Pencil aria-hidden="true" className="size-4" /></button>
                      <button aria-label={`Delete ${item.name}`} className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive" onClick={() => setDeletingItem(item)} type="button"><Trash2 aria-hidden="true" className="size-4" /></button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm" aria-label="Menu item table">
          <div className="overflow-x-auto dashboard-scrollbar">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-secondary text-xs uppercase tracking-wide text-white/75">
                <tr><th className="px-5 py-3.5">Item</th><th className="px-4 py-3.5">Category</th><th className="px-4 py-3.5">Price</th><th className="px-4 py-3.5">Prep time</th><th className="px-4 py-3.5">Status</th>{canManage && <th className="px-5 py-3.5 text-right">Actions</th>}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item) => (
                  <tr className="transition hover:bg-background/60" key={item.id}>
                    <td className="px-5 py-4"><p className="font-bold text-secondary">{item.name}</p><p className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">{item.description || "No description"}</p></td>
                    <td className="px-4 py-4 font-medium">{item.categoryName}</td>
                    <td className="px-4 py-4 font-bold text-secondary">{formatLkr(item.price)}</td>
                    <td className="px-4 py-4">{item.preparationTime} min</td>
                    <td className="px-4 py-4"><StatusBadge active={item.available} activeLabel="Available" inactiveLabel="Unavailable" /></td>
                    {canManage && <td className="px-5 py-4"><div className="flex items-center justify-end gap-2"><ToggleSwitch checked={item.available} disabled={isPending && pendingItemId === item.id} label={`Toggle ${item.name} availability`} onChange={(checked) => toggleAvailability(item, checked)} /><button aria-label={`Edit ${item.name}`} className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-secondary focus-visible:ring-2 focus-visible:ring-primary" onClick={() => openEdit(item)} type="button"><Pencil aria-hidden="true" className="size-4" /></button><button aria-label={`Delete ${item.name}`} className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:border-destructive/30 hover:bg-destructive/8 hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive" onClick={() => setDeletingItem(item)} type="button"><Trash2 aria-hidden="true" className="size-4" /></button></div></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {canManage && (
        <>
          <MenuItemFormDialog categories={categories} item={editingItem} onClose={() => setFormOpen(false)} open={formOpen} />
          <ConfirmDialog description={`Delete ${deletingItem?.name ?? "this menu item"}? This cannot be undone. Items referenced by completed orders should be marked unavailable instead.`} onCancel={() => setDeletingItem(null)} onConfirm={confirmDelete} open={Boolean(deletingItem)} pending={isPending && pendingItemId === deletingItem?.id} title="Delete menu item" />
        </>
      )}
    </div>
  );
}
