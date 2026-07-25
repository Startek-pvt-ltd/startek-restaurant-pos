"use client";

import { CheckCircle2, Eye, LoaderCircle, Printer, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Modal } from "@/components/menu/Modal";
import { cancelOrderAction, completeOrderStatusAction } from "@/features/orders/actions/order-actions";

interface OrderActionControlsProps {
  canCancel: boolean;
  orderId: string;
  orderNumber: string;
  showView?: boolean;
  status: string;
}

export function OrderActionControls({ canCancel, orderId, orderNumber, showView = true, status }: OrderActionControlsProps) {
  const router = useRouter();
  const [dialog, setDialog] = useState<"complete" | "cancel" | null>(null);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  const runComplete = () => startTransition(async () => {
    const result = await completeOrderStatusAction(orderId);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    if (result.success) { setDialog(null); router.refresh(); }
  });

  const runCancel = () => startTransition(async () => {
    const result = await cancelOrderAction({ orderId, reason });
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    if (result.success) { setDialog(null); setReason(""); router.refresh(); }
  });

  const buttonClass = "flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-primary hover:bg-muted hover:text-secondary focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-45";

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        {showView && <Link aria-label={`View ${orderNumber}`} className={buttonClass} href={`/orders/${orderId}`} title="View order"><Eye aria-hidden="true" className="size-4" /></Link>}
        {status === "PENDING" && <button aria-label={`Complete ${orderNumber}`} className={buttonClass} onClick={() => setDialog("complete")} title="Mark completed" type="button"><CheckCircle2 aria-hidden="true" className="size-4" /></button>}
        {canCancel && status !== "CANCELLED" && <button aria-label={`Cancel ${orderNumber}`} className={`${buttonClass} hover:border-destructive hover:bg-destructive/5 hover:text-destructive`} onClick={() => setDialog("cancel")} title="Cancel order" type="button"><XCircle aria-hidden="true" className="size-4" /></button>}
        <Link aria-label={`Reprint ${orderNumber}`} className={buttonClass} href={`/orders/${orderId}/receipt`} target="_blank" title="Open 80 mm receipt"><Printer aria-hidden="true" className="size-4" /></Link>
      </div>

      <Modal onClose={() => !pending && setDialog(null)} open={dialog === "complete"} size="sm" title="Complete pending order?">
        <div className="p-5 sm:p-6">
          <p className="text-sm leading-6 text-muted-foreground">Mark <strong className="text-secondary">{orderNumber}</strong> as completed? This updates its order history.</p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button className="h-11 rounded-xl border border-border px-5 text-sm font-black focus-visible:ring-2 focus-visible:ring-primary" disabled={pending} onClick={() => setDialog(null)} type="button">Keep pending</button>
            <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-success px-5 text-sm font-black text-white focus-visible:ring-2 focus-visible:ring-success disabled:opacity-60" disabled={pending} onClick={runComplete} type="button">{pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}Mark completed</button>
          </div>
        </div>
      </Modal>

      <Modal description="The order remains in history and the reason is stored in its audit record." onClose={() => !pending && setDialog(null)} open={dialog === "cancel"} size="sm" title="Cancel order">
        <div className="p-5 sm:p-6">
          <label className="block text-sm font-black text-secondary" htmlFor={`reason-${orderId}`}>Cancellation reason</label>
          <textarea autoFocus className="mt-2 min-h-28 w-full resize-y rounded-xl border border-input bg-background/40 p-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" id={`reason-${orderId}`} maxLength={300} onChange={(event) => setReason(event.target.value)} placeholder="Explain why this order is being cancelled…" value={reason} />
          <p className="mt-1 text-right text-xs text-muted-foreground">{reason.length}/300</p>
          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button className="h-11 rounded-xl border border-border px-5 text-sm font-black focus-visible:ring-2 focus-visible:ring-primary" disabled={pending} onClick={() => setDialog(null)} type="button">Keep order</button>
            <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-destructive px-5 text-sm font-black text-white focus-visible:ring-2 focus-visible:ring-destructive disabled:opacity-60" disabled={pending || reason.trim().length < 3} onClick={runCancel} type="button">{pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}Confirm cancellation</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
