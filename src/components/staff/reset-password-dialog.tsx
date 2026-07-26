"use client";

import { LoaderCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Modal } from "@/components/menu/Modal";
import { resetStaffPasswordAction } from "@/features/staff/actions/staff-actions";
import type { StaffRecord } from "@/features/staff/types";

const inputClass = "h-11 w-full rounded-xl border border-input bg-white px-3.5 text-sm text-secondary outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

export function ResetPasswordDialog({ onClose, staff }: { onClose: () => void; staff: StaffRecord | null }) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const { formState: { errors }, handleSubmit, register, reset, setError } = useForm<{ password: string; confirmPassword: string }>({ defaultValues: { password: "", confirmPassword: "" } });
  const close = () => { if (!pending) { reset(); setMessage(""); onClose(); } };
  const submit = handleSubmit((values) => {
    if (!staff) return;
    startTransition(async () => {
      const result = await resetStaffPasswordAction({ id: staff.id, ...values });
      if (!result.success) {
        setMessage(result.message);
        Object.entries(result.fieldErrors ?? {}).forEach(([field, messages]) => { if (messages?.[0] && (field === "password" || field === "confirmPassword")) setError(field, { message: messages[0] }); });
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      close();
    });
  });
  return <Modal description="Set a new password without displaying or emailing it. All existing sessions for this user will be revoked." onClose={close} open={Boolean(staff)} size="sm" title={`Reset password${staff ? ` — ${staff.fullName}` : ""}`}><form className="space-y-5 p-5 sm:p-6" noValidate onSubmit={submit}>{message && <p className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{message}</p>}<label className="block space-y-2 text-sm font-bold text-secondary">New password<input autoComplete="new-password" autoFocus className={inputClass} maxLength={128} minLength={8} type="password" {...register("password", { required: true })} />{errors.password && <span className="block text-xs text-destructive">{errors.password.message}</span>}</label><label className="block space-y-2 text-sm font-bold text-secondary">Confirm password<input autoComplete="new-password" className={inputClass} maxLength={128} minLength={8} type="password" {...register("confirmPassword", { required: true })} />{errors.confirmPassword && <span className="block text-xs text-destructive">{errors.confirmPassword.message}</span>}</label><p className="text-xs text-muted-foreground">Minimum 8 characters, including uppercase, lowercase, and a number.</p><div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end"><button className="h-11 rounded-xl border border-border px-5 text-sm font-bold text-secondary" disabled={pending} onClick={close} type="button">Cancel</button><button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-secondary disabled:opacity-60" disabled={pending} type="submit">{pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}{pending ? "Resetting…" : "Reset password"}</button></div></form></Modal>;
}
