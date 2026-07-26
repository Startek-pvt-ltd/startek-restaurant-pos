"use client";

import { ArrowLeft, Layers3, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteCategoryAction,
  toggleCategoryAction,
} from "@/features/menu/actions/category-actions";
import type { CategoryRecord } from "@/features/menu/types";

import { CategoryFormDialog } from "./CategoryFormDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { StatusBadge } from "./StatusBadge";
import { StatusSwitch } from "./StatusSwitch";

interface CategoryManagementClientProps {
  canManage: boolean;
  categories: CategoryRecord[];
}

type CategorySort = "order" | "name-asc" | "name-desc" | "newest";

export function CategoryManagementClient({ canManage, categories }: CategoryManagementClientProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<CategorySort>("order");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryRecord | null>(null);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return categories
      .filter((category) => !query || category.name.toLocaleLowerCase().includes(query) || category.description?.toLocaleLowerCase().includes(query))
      .sort((a, b) => {
        if (sort === "name-asc") return a.name.localeCompare(b.name);
        if (sort === "name-desc") return b.name.localeCompare(a.name);
        if (sort === "newest") return Date.parse(b.createdAt) - Date.parse(a.createdAt);
        return a.displayOrder - b.displayOrder || a.name.localeCompare(b.name);
      });
  }, [categories, search, sort]);

  const toggleActive = async (category: CategoryRecord, active: boolean) => {
    const result = await toggleCategoryAction(category.id, active);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    return result.success;
  };

  const confirmDelete = () => {
    if (!deletingCategory) return;
    setPendingCategoryId(deletingCategory.id);
    startTransition(async () => {
      const result = await deleteCategoryAction(deletingCategory.id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      if (result.success) setDeletingCategory(null);
      setPendingCategoryId(null);
    });
  };

  return (
    <div className="space-y-6 pb-8">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Link className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground transition hover:text-secondary focus-visible:rounded focus-visible:ring-2 focus-visible:ring-primary" href="/menu"><ArrowLeft aria-hidden="true" className="size-4" /> Back to menu items</Link>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-secondary sm:text-3xl">Category Management</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Organize the menu into clear sections and control their display order.</p>
        </div>
        {canManage && <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-secondary shadow-sm transition hover:bg-amber-500 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" onClick={() => { setEditingCategory(null); setFormOpen(true); }} type="button"><Plus aria-hidden="true" className="size-4" /> Add Category</button>}
      </section>

      {!canManage && <p className="rounded-2xl border border-primary/35 bg-primary/10 px-4 py-3 text-sm font-medium text-secondary" role="status">You have view-only category access. Owners, managers, and super admins can make changes.</p>}

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm" aria-label="Category filters">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_13rem]">
          <label className="relative"><span className="sr-only">Search categories</span><Search aria-hidden="true" className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input className="h-11 w-full rounded-xl border border-input bg-background/40 pl-10 pr-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10" onChange={(event) => setSearch(event.target.value)} placeholder="Search categories…" type="search" value={search} /></label>
          <label><span className="sr-only">Sort categories</span><select className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" onChange={(event) => setSort(event.target.value as CategorySort)} value={sort}><option value="order">Display order</option><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option><option value="newest">Newest first</option></select></label>
        </div>
        <p className="mt-3 text-xs font-medium text-muted-foreground" aria-live="polite">Showing {filteredCategories.length} of {categories.length} categories</p>
      </section>

      {filteredCategories.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-input bg-card px-6 py-16 text-center"><span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-secondary"><Layers3 aria-hidden="true" className="size-6" /></span><h2 className="mt-4 text-lg font-bold text-secondary">No categories found</h2><p className="mt-2 text-sm text-muted-foreground">{categories.length === 0 ? "Create the first category to organize your menu." : "Try a different search."}</p></section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm" aria-label="Categories table">
          <div className="overflow-x-auto dashboard-scrollbar">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-secondary text-xs uppercase tracking-wide text-white/75"><tr><th className="px-5 py-3.5">Category</th><th className="px-4 py-3.5">Display order</th><th className="px-4 py-3.5">Items</th><th className="px-4 py-3.5">Status</th>{canManage && <th className="px-5 py-3.5 text-right">Actions</th>}</tr></thead>
              <tbody className="divide-y divide-border">
                {filteredCategories.map((category) => (
                  <tr className="transition hover:bg-background/60" key={category.id}>
                    <td className="px-5 py-4"><p className="font-bold text-secondary">{category.name}</p><p className="mt-0.5 max-w-md truncate text-xs text-muted-foreground">{category.description || "No description"}</p></td>
                    <td className="px-4 py-4"><span className="inline-flex min-w-8 justify-center rounded-lg bg-muted px-2 py-1 text-xs font-black text-secondary">{category.displayOrder}</span></td>
                    <td className="px-4 py-4 font-semibold">{category.itemCount}</td>
                    <td className="px-4 py-4"><StatusBadge active={category.active} /></td>
                    {canManage && <td className="px-5 py-4"><div className="flex items-center justify-end gap-2"><StatusSwitch checked={category.active} disabled={isPending && pendingCategoryId === category.id} label={`${category.active ? "Deactivate" : "Activate"} ${category.name}`} onCheckedChange={(active) => toggleActive(category, active)} /><button aria-label={`Edit ${category.name}`} className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-muted hover:text-secondary focus-visible:ring-2 focus-visible:ring-primary" onClick={() => { setEditingCategory(category); setFormOpen(true); }} type="button"><Pencil aria-hidden="true" className="size-4" /></button><button aria-label={`Delete ${category.name}`} className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:border-destructive/30 hover:bg-destructive/8 hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive disabled:cursor-not-allowed disabled:opacity-45" disabled={category.itemCount > 0} onClick={() => setDeletingCategory(category)} title={category.itemCount > 0 ? "Remove all menu items before deleting this category" : "Delete category"} type="button"><Trash2 aria-hidden="true" className="size-4" /></button></div></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {canManage && <><CategoryFormDialog category={editingCategory} onClose={() => setFormOpen(false)} open={formOpen} /><ConfirmDialog description={`Delete ${deletingCategory?.name ?? "this category"}? This action cannot be undone. Categories containing menu items cannot be deleted.`} onCancel={() => setDeletingCategory(null)} onConfirm={confirmDelete} open={Boolean(deletingCategory)} pending={isPending && pendingCategoryId === deletingCategory?.id} title="Delete category" /></>}
    </div>
  );
}
