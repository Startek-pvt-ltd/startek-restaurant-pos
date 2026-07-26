"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Modal } from "@/components/menu/Modal";
import { createStaffAction, updateStaffAction } from "@/features/staff/actions/staff-actions";
import { manageableRoles } from "@/features/staff/permissions/staff-permissions";
import type { StaffRecord } from "@/features/staff/types";
import type { UserRole, UserStatus } from "@/generated/prisma/client";

interface StaffFormValues {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  password: string;
  confirmPassword: string;
}

const inputClass = "h-11 w-full rounded-xl border border-input bg-white px-3.5 text-sm text-secondary outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-muted disabled:text-muted-foreground";

function defaults(role: UserRole): StaffFormValues {
  return { fullName: "", username: "", email: "", phone: "", avatar: "", role, status: "ACTIVE", password: "", confirmPassword: "" };
}

export function StaffForm({ actorId, actorRole, onClose, open, staff }: { actorId: string; actorRole: UserRole; onClose: () => void; open: boolean; staff: StaffRecord | null }) {
  const router = useRouter();
  const roles = useMemo(() => manageableRoles(actorRole), [actorRole]);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const { formState: { errors }, handleSubmit, register, reset, setError } = useForm<StaffFormValues>({ defaultValues: defaults(roles[0] ?? "CASHIER") });
  const self = staff?.id === actorId;

  useEffect(() => {
    reset(staff ? { fullName: staff.fullName, username: staff.username, email: staff.email ?? "", phone: staff.phone ?? "", avatar: staff.avatar ?? "", role: staff.role, status: staff.status, password: "", confirmPassword: "" } : defaults(roles[0] ?? "CASHIER"));
  }, [open, reset, roles, staff]);

  const close = () => {
    if (pending) return;
    setMessage("");
    onClose();
  };

  const submit = handleSubmit((values) => startTransition(async () => {
    setMessage("");
    const result = staff ? await updateStaffAction(staff.id, values) : await createStaffAction(values);
    if (!result.success) {
      setMessage(result.message);
      Object.entries(result.fieldErrors ?? {}).forEach(([field, messages]) => {
        if (messages?.[0]) setError(field as keyof StaffFormValues, { message: messages[0] });
      });
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setMessage("");
    onClose();
    router.refresh();
  }));

  return <Modal description={staff ? "Update approved account fields. Passwords are managed separately." : "Create a secure account using an approved role."} onClose={close} open={open} size="lg" title={staff ? `Edit ${staff.fullName}` : "Add staff account"}><form className="space-y-5 p-5 sm:p-6" noValidate onSubmit={submit}>
    {message && <p className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{message}</p>}
    <div className="grid gap-5 sm:grid-cols-2">
      <Field error={errors.fullName?.message} label="Full name" required><input autoFocus className={inputClass} maxLength={100} {...register("fullName", { required: true })} /></Field>
      <Field error={errors.username?.message} label="Username" required><input autoCapitalize="none" autoComplete="off" className={inputClass} maxLength={50} {...register("username", { required: true })} /></Field>
      <Field error={errors.email?.message} label="Email"><input autoCapitalize="none" className={inputClass} maxLength={254} type="email" {...register("email")} /></Field>
      <Field error={errors.phone?.message} label="Phone"><input className={inputClass} inputMode="tel" maxLength={30} {...register("phone")} /></Field>
      <Field error={errors.role?.message} label="Role" required><select className={inputClass} disabled={self} {...register("role")}>{roles.map((role) => <option key={role} value={role}>{role.replaceAll("_", " ")}</option>)}</select>{self && <input type="hidden" value={staff?.role} {...register("role")} />}</Field>
      <Field error={errors.status?.message} label="Status" required><select className={inputClass} disabled={self} {...register("status")}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>{self && <input type="hidden" value="ACTIVE" {...register("status")} />}</Field>
    </div>
    <Field error={errors.avatar?.message} label="Avatar URL"><input className={inputClass} maxLength={500} placeholder="Optional image URL or local path" {...register("avatar")} /></Field>
    {!staff && <div className="grid gap-5 border-t border-border pt-5 sm:grid-cols-2"><Field error={errors.password?.message} label="Password" required><input autoComplete="new-password" className={inputClass} maxLength={128} minLength={8} type="password" {...register("password", { required: true })} /></Field><Field error={errors.confirmPassword?.message} label="Confirm password" required><input autoComplete="new-password" className={inputClass} maxLength={128} minLength={8} type="password" {...register("confirmPassword", { required: true })} /></Field><p className="text-xs text-muted-foreground sm:col-span-2">Use at least 8 characters with uppercase, lowercase, and a number.</p></div>}
    <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end"><button className="h-11 rounded-xl border border-border px-5 text-sm font-bold text-secondary transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary" disabled={pending} onClick={close} type="button">Cancel</button><button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-secondary transition hover:bg-amber-500 focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60" disabled={pending} type="submit">{pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}{pending ? "Saving…" : staff ? "Save changes" : "Create staff"}</button></div>
  </form></Modal>;
}

function Field({ children, error, label, required }: { children: React.ReactNode; error?: string; label: string; required?: boolean }) {
  return <label className="space-y-2 text-sm font-bold text-secondary"><span>{label}{required && <span className="text-destructive"> *</span>}</span>{children}{error && <span className="block text-xs font-medium text-destructive">{error}</span>}</label>;
}
