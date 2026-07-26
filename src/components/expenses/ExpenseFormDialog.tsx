"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Modal } from "@/components/menu/Modal";
import {
  createExpenseAction,
  updateExpenseAction,
} from "@/features/expenses/actions/expense-actions";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_PAYMENT_METHODS,
  type ExpenseRecord,
} from "@/features/expenses/types";
import {
  expenseSchema,
  todayInColombo,
  type ExpenseInput,
} from "@/features/expenses/validations/expense-schema";

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-white px-3.5 text-sm text-secondary outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10";

function defaults(): ExpenseInput {
  return {
    title: "",
    category: "INGREDIENTS",
    amount: "",
    paymentMethod: "CASH",
    expenseDate: todayInColombo(),
    referenceNumber: "",
    remarks: "",
  };
}

export function ExpenseFormDialog({
  expense,
  onClose,
  open,
}: {
  expense: ExpenseRecord | null;
  onClose: () => void;
  open: boolean;
}) {
  const router = useRouter();
  const [formMessage, setFormMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<ExpenseInput>({ resolver: zodResolver(expenseSchema), defaultValues: defaults() });

  useEffect(() => {
    reset(
      expense
        ? {
            title: expense.title,
            category: expense.category,
            amount: expense.amount,
            paymentMethod: expense.paymentMethod,
            expenseDate: expense.expenseDate,
            referenceNumber: expense.referenceNumber ?? "",
            remarks: expense.remarks ?? "",
          }
        : defaults(),
    );
  }, [expense, open, reset]);

  const close = () => {
    if (isPending) return;
    setFormMessage("");
    onClose();
  };

  const submit = handleSubmit((values) => {
    setFormMessage("");
    startTransition(async () => {
      const result = expense
        ? await updateExpenseAction(expense.id, expense.updatedAt, values)
        : await createExpenseAction(values);
      if (!result.success) {
        setFormMessage(result.message);
        Object.entries(result.fieldErrors ?? {}).forEach(([field, messages]) => {
          const message = messages?.[0];
          if (message) setError(field as keyof ExpenseInput, { message });
        });
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      onClose();
      router.refresh();
    });
  });

  return (
    <Modal
      description="Record accurate expense details. Future-dated entries are not accepted."
      onClose={close}
      open={open}
      title={expense ? "Edit expense" : "Add expense"}
    >
      <form className="space-y-5 p-5 sm:p-6" noValidate onSubmit={submit}>
        {formMessage && (
          <p className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm font-medium text-red-700" role="alert">
            {formMessage}
          </p>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-bold text-secondary">
            Title <span className="text-destructive">*</span>
            <input autoFocus className={inputClass} placeholder="e.g. Chicken purchase" {...register("title")} />
            {errors.title && <span className="block text-xs font-medium text-destructive">{errors.title.message}</span>}
          </label>
          <label className="space-y-2 text-sm font-bold text-secondary">
            Category <span className="text-destructive">*</span>
            <select className={inputClass} {...register("category")}>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>{EXPENSE_CATEGORY_LABELS[category]}</option>
              ))}
            </select>
            {errors.category && <span className="block text-xs font-medium text-destructive">{errors.category.message}</span>}
          </label>
          <label className="space-y-2 text-sm font-bold text-secondary">
            Amount (Rs.) <span className="text-destructive">*</span>
            <input className={inputClass} inputMode="decimal" min="0.01" placeholder="0.00" step="0.01" type="number" {...register("amount")} />
            {errors.amount && <span className="block text-xs font-medium text-destructive">{errors.amount.message}</span>}
          </label>
          <label className="space-y-2 text-sm font-bold text-secondary">
            Expense date <span className="text-destructive">*</span>
            <input className={inputClass} max={todayInColombo()} type="date" {...register("expenseDate")} />
            {errors.expenseDate && <span className="block text-xs font-medium text-destructive">{errors.expenseDate.message}</span>}
          </label>
          <label className="space-y-2 text-sm font-bold text-secondary">
            Payment method <span className="text-destructive">*</span>
            <select className={inputClass} {...register("paymentMethod")}>{EXPENSE_PAYMENT_METHODS.map((method) => <option key={method} value={method}>{method === "BANK" ? "Bank" : method.charAt(0) + method.slice(1).toLowerCase()}</option>)}</select>
            {errors.paymentMethod && <span className="block text-xs font-medium text-destructive">{errors.paymentMethod.message}</span>}
          </label>
        </div>
        <label className="space-y-2 text-sm font-bold text-secondary">
          Reference number
          <input className={inputClass} maxLength={100} placeholder="Optional invoice or voucher number" {...register("referenceNumber")} />
          {errors.referenceNumber && <span className="block text-xs font-medium text-destructive">{errors.referenceNumber.message}</span>}
        </label>
        <label className="space-y-2 text-sm font-bold text-secondary">
          Description
          <textarea className="min-h-28 w-full resize-y rounded-xl border border-input bg-white px-3.5 py-3 text-sm font-normal text-secondary outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" maxLength={1000} placeholder="Optional notes about this expense" {...register("remarks")} />
          {errors.remarks && <span className="block text-xs font-medium text-destructive">{errors.remarks.message}</span>}
        </label>
        <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <button className="h-11 rounded-xl border border-border px-5 text-sm font-bold text-secondary transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60" disabled={isPending} onClick={close} type="button">Cancel</button>
          <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-secondary shadow-sm transition hover:bg-amber-500 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60" disabled={isPending} type="submit">
            {isPending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
            {isPending ? "Saving…" : expense ? "Save changes" : "Create expense"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
