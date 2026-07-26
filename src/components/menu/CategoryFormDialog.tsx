"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createCategoryAction,
  updateCategoryAction,
} from "@/features/menu/actions/category-actions";
import type { CategoryRecord } from "@/features/menu/types";
import {
  categorySchema,
  type CategoryInput,
} from "@/features/menu/validations/category";

import { Modal } from "./Modal";

interface CategoryFormDialogProps {
  category: CategoryRecord | null;
  onClose: () => void;
  open: boolean;
}

const defaults: CategoryInput = {
  name: "",
  description: "",
  displayOrder: 0,
  active: true,
};

export function CategoryFormDialog({ category, onClose, open }: CategoryFormDialogProps) {
  const router = useRouter();
  const [formMessage, setFormMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<CategoryInput>({ resolver: zodResolver(categorySchema), defaultValues: defaults });

  useEffect(() => {
    reset(
      category
        ? {
            name: category.name,
            description: category.description ?? "",
            displayOrder: category.displayOrder,
            active: category.active,
          }
        : defaults,
    );
  }, [category, open, reset]);

  const closeDialog = () => {
    setFormMessage("");
    onClose();
  };

  const submit = handleSubmit((values) => {
    setFormMessage("");
    startTransition(async () => {
      const result = category
        ? await updateCategoryAction(category.id, values)
        : await createCategoryAction(values);

      if (!result.success) {
        setFormMessage(result.message);
        Object.entries(result.fieldErrors ?? {}).forEach(([field, messages]) => {
          const message = messages?.[0];
          if (message) setError(field as keyof CategoryInput, { message });
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
    "h-11 w-full rounded-xl border border-input bg-white px-3.5 text-sm text-secondary outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10";

  return (
    <Modal
      description="Organize items and control how categories appear in the menu."
      onClose={closeDialog}
      open={open}
      title={category ? "Edit category" : "Add category"}
    >
      <form className="space-y-5 p-5 sm:p-6" noValidate onSubmit={submit}>
        {formMessage && (
          <p className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm font-medium text-red-700" role="alert">
            {formMessage}
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_10rem]">
          <label className="space-y-2 text-sm font-bold text-secondary">
            Category name <span className="text-destructive">*</span>
            <input autoFocus className={inputClass} placeholder="e.g. Kottu" {...register("name")} />
            {errors.name && <span className="block text-xs font-medium text-destructive">{errors.name.message}</span>}
          </label>
          <label className="space-y-2 text-sm font-bold text-secondary">
            Display order <span className="text-destructive">*</span>
            <input
              className={inputClass}
              min={0}
              step={1}
              type="number"
              {...register("displayOrder", { valueAsNumber: true })}
            />
            {errors.displayOrder && (
              <span className="block text-xs font-medium text-destructive">{errors.displayOrder.message}</span>
            )}
          </label>
        </div>

        <label className="space-y-2 text-sm font-bold text-secondary">
          Description
          <textarea
            className="min-h-28 w-full resize-y rounded-xl border border-input bg-white px-3.5 py-3 text-sm font-normal text-secondary outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
            placeholder="Optional category description"
            {...register("description")}
          />
          {errors.description && (
            <span className="block text-xs font-medium text-destructive">{errors.description.message}</span>
          )}
        </label>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/50 p-4 text-sm font-bold text-secondary">
          <input className="size-4 accent-primary" type="checkbox" {...register("active")} />
          Category is active and visible
        </label>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <button
            className="h-11 rounded-xl border border-border px-5 text-sm font-bold text-secondary transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
            disabled={isPending}
            onClick={closeDialog}
            type="button"
          >
            Cancel
          </button>
          <button
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-amber-500 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            {isPending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
            {isPending ? "Saving…" : category ? "Save changes" : "Create category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
