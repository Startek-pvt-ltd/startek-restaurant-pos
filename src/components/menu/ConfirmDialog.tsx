"use client";

import { AlertTriangle, LoaderCircle } from "lucide-react";

import { Modal } from "./Modal";

interface ConfirmDialogProps {
  confirmLabel?: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  pending?: boolean;
  title: string;
}

export function ConfirmDialog({
  confirmLabel = "Delete",
  description,
  onCancel,
  onConfirm,
  open,
  pending = false,
  title,
}: ConfirmDialogProps) {
  return (
    <Modal onClose={pending ? () => undefined : onCancel} open={open} size="sm" title={title}>
      <div className="p-5 sm:p-6">
        <div className="flex gap-4 rounded-2xl bg-destructive/8 p-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/12 text-destructive">
            <AlertTriangle aria-hidden="true" className="size-5" />
          </span>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="h-11 rounded-xl border border-border px-5 text-sm font-bold text-secondary transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
            disabled={pending}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-destructive px-5 text-sm font-bold text-white transition hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 disabled:opacity-60"
            disabled={pending}
            onClick={onConfirm}
            type="button"
          >
            {pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
            {pending ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

