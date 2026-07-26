"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  createMenuItemAction,
  updateMenuItemAction,
} from "@/features/menu/actions/menu-item-actions";
import type { CategoryRecord, MenuItemRecord } from "@/features/menu/types";
import {
  menuItemSchema,
  type MenuItemInput,
} from "@/features/menu/validations/menu-item";

import { Modal } from "./Modal";

interface MenuItemFormDialogProps {
  categories: CategoryRecord[];
  item: MenuItemRecord | null;
  onClose: () => void;
  open: boolean;
}

const defaultVariant = (name = "Normal", active = true) => ({ name, price: 0, active });

const defaults: MenuItemInput = {
  name: "",
  description: "",
  categoryId: "",
  price: 0,
  hasVariants: false,
  variants: [],
  preparationTime: 0,
  image: "",
  available: true,
};

export function MenuItemFormDialog({ categories, item, onClose, open }: MenuItemFormDialogProps) {
  const router = useRouter();
  const [formMessage, setFormMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<MenuItemInput>({ resolver: zodResolver(menuItemSchema), defaultValues: defaults });
  const { append, fields, remove } = useFieldArray({ control, name: "variants" });
  const hasVariants = useWatch({ control, name: "hasVariants" });

  useEffect(() => {
    reset(
      item
        ? {
            name: item.name,
            description: item.description ?? "",
            categoryId: item.categoryId,
            price: Number(item.price),
            hasVariants: item.variants.length > 0,
            variants: item.variants.map((variant) => ({
              id: variant.id,
              name: variant.name,
              price: Number(variant.price),
              active: variant.active,
            })),
            preparationTime: item.preparationTime,
            image: item.image ?? "",
            available: item.available,
          }
        : { ...defaults, categoryId: categories.find((category) => category.active)?.id ?? "" },
    );
  }, [categories, item, open, reset]);

  const closeDialog = () => {
    setFormMessage("");
    onClose();
  };

  const submit = handleSubmit((values) => {
    setFormMessage("");
    startTransition(async () => {
      const result = item
        ? await updateMenuItemAction(item.id, values)
        : await createMenuItemAction(values);

      if (!result.success) {
        setFormMessage(result.message);
        Object.entries(result.fieldErrors ?? {}).forEach(([field, messages]) => {
          const message = messages?.[0];
          if (message) setError(field as keyof MenuItemInput, { message });
        });
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      closeDialog();
      router.refresh();
    });
  });

  const inputClass =
    "h-11 w-full rounded-xl border border-input bg-white px-3.5 text-sm font-normal text-secondary outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10";

  const addSuggestedVariant = () => {
    const nextName = fields.length === 0 ? "Normal" : fields.length === 1 ? "Full" : "";
    append(defaultVariant(nextName));
  };

  return (
    <Modal
      description="Add clear menu details for billing and daily operations."
      onClose={closeDialog}
      open={open}
      size="lg"
      title={item ? "Edit menu item" : "Add menu item"}
    >
      <form className="space-y-5 p-5 sm:p-6" noValidate onSubmit={submit}>
        {formMessage && (
          <p className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm font-medium text-red-700" role="alert">
            {formMessage}
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-bold text-secondary">
            Item name <span className="text-destructive">*</span>
            <input autoFocus className={inputClass} placeholder="e.g. Chicken Kottu" {...register("name")} />
            {errors.name && <span className="block text-xs font-medium text-destructive">{errors.name.message}</span>}
          </label>
          <label className="space-y-2 text-sm font-bold text-secondary">
            Category <span className="text-destructive">*</span>
            <select className={inputClass} {...register("categoryId")}>
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}{category.active ? "" : " (inactive)"}
                </option>
              ))}
            </select>
            {errors.categoryId && <span className="block text-xs font-medium text-destructive">{errors.categoryId.message}</span>}
          </label>
        </div>

        <label className="space-y-2 text-sm font-bold text-secondary">
          Description
          <textarea className="min-h-24 w-full resize-y rounded-xl border border-input bg-white px-3.5 py-3 text-sm font-normal text-secondary outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Optional item description" {...register("description")} />
          {errors.description && <span className="block text-xs font-medium text-destructive">{errors.description.message}</span>}
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-bold text-secondary">
            Base price (Rs.) <span className="text-destructive">*</span>
            <input className={inputClass} min="0.01" placeholder="0.00" step="0.01" type="number" {...register("price", { valueAsNumber: true })} />
            {errors.price && <span className="block text-xs font-medium text-destructive">{errors.price.message}</span>}
          </label>
          <label className="space-y-2 text-sm font-bold text-secondary">
            Preparation time (minutes) <span className="text-destructive">*</span>
            <input className={inputClass} min={0} step={1} type="number" {...register("preparationTime", { valueAsNumber: true })} />
            {errors.preparationTime && <span className="block text-xs font-medium text-destructive">{errors.preparationTime.message}</span>}
          </label>
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-background/50 p-4 text-sm font-bold text-secondary">
          <span>Has multiple sizes</span>
          <input className="size-4 accent-primary" type="checkbox" {...register("hasVariants")} />
        </label>

        {hasVariants && (
          <section className="space-y-3 rounded-2xl border border-border bg-background/35 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-secondary">Variants</h3>
                <p className="text-xs text-muted-foreground">Use names like Normal, Full, Small, Half, or Large.</p>
              </div>
              <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 text-xs font-black text-secondary transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary" onClick={addSuggestedVariant} type="button">
                <Plus aria-hidden="true" className="size-4" />
                Add
              </button>
            </div>
            {typeof errors.variants?.message === "string" && <p className="text-xs font-medium text-destructive">{errors.variants.message}</p>}
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div className="grid gap-3 rounded-xl border border-border bg-white p-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto_auto]" key={field.id}>
                  <label className="space-y-1 text-xs font-bold text-secondary">
                    Name
                    <input className={inputClass} placeholder="Normal" {...register(`variants.${index}.name`)} />
                    {errors.variants?.[index]?.name && <span className="block text-xs font-medium text-destructive">{errors.variants[index]?.name?.message}</span>}
                  </label>
                  <label className="space-y-1 text-xs font-bold text-secondary">
                    Price
                    <input className={inputClass} min="0.01" step="0.01" type="number" {...register(`variants.${index}.price`, { valueAsNumber: true })} />
                    {errors.variants?.[index]?.price && <span className="block text-xs font-medium text-destructive">{errors.variants[index]?.price?.message}</span>}
                  </label>
                  <label className="flex items-center gap-2 self-end pb-3 text-xs font-bold text-secondary">
                    <input className="size-4 accent-primary" type="checkbox" {...register(`variants.${index}.active`)} />
                    Active
                  </label>
                  <button aria-label="Remove variant" className="flex size-11 items-center justify-center self-end rounded-xl border border-border text-muted-foreground transition hover:border-destructive/30 hover:bg-destructive/8 hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive" onClick={() => remove(index)} type="button">
                    <Trash2 aria-hidden="true" className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <label className="space-y-2 text-sm font-bold text-secondary">
          Image URL or local path
          <input className={inputClass} placeholder="https://... or /menu-items/item.jpg" {...register("image")} />
          <span className="block text-xs font-normal leading-5 text-muted-foreground">Local files belong in public/menu-items. A food placeholder is shown when this is empty.</span>
          {errors.image && <span className="block text-xs font-medium text-destructive">{errors.image.message}</span>}
        </label>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/50 p-4 text-sm font-bold text-secondary">
          <input className="size-4 accent-primary" type="checkbox" {...register("available")} />
          Item is currently available for sale
        </label>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <button className="h-11 rounded-xl border border-border px-5 text-sm font-bold text-secondary transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60" disabled={isPending} onClick={closeDialog} type="button">
            Cancel
          </button>
          <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-amber-500 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60" disabled={isPending} type="submit">
            {isPending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
            {isPending ? "Saving..." : item ? "Save changes" : "Create menu item"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
