"use client";

import { KeyRound, LoaderCircle, Save, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { changeOwnPasswordAction, updateProfileAction } from "@/features/staff/actions/staff-actions";

const inputClass = "h-11 w-full rounded-xl border border-input bg-white px-3.5 text-sm text-secondary outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

interface ProfileValues { fullName: string; email: string; phone: string; avatar: string }
interface PasswordValues { currentPassword: string; newPassword: string; confirmPassword: string }

export function ProfileForms({ profile }: { profile: ProfileValues & { username: string; role: string } }) {
  const router = useRouter();
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [profilePending, startProfile] = useTransition();
  const [passwordPending, startPassword] = useTransition();
  const profileForm = useForm<ProfileValues>({ defaultValues: profile });
  const passwordForm = useForm<PasswordValues>({ defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } });

  const saveProfile = profileForm.handleSubmit((values) => startProfile(async () => {
    setProfileMessage("");
    const result = await updateProfileAction(values);
    if (!result.success) {
      setProfileMessage(result.message);
      Object.entries(result.fieldErrors ?? {}).forEach(([field, messages]) => { if (messages?.[0] && field in values) profileForm.setError(field as keyof ProfileValues, { message: messages[0] }); });
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    router.refresh();
  }));
  const changePassword = passwordForm.handleSubmit((values) => startPassword(async () => {
    setPasswordMessage("");
    const result = await changeOwnPasswordAction(values);
    if (!result.success) {
      setPasswordMessage(result.message);
      Object.entries(result.fieldErrors ?? {}).forEach(([field, messages]) => { if (messages?.[0] && field in values) passwordForm.setError(field as keyof PasswordValues, { message: messages[0] }); });
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    window.location.assign("/login?passwordChanged=1");
  }));

  return <div className="grid gap-5 xl:grid-cols-2"><section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="flex items-start gap-3 border-b border-border pb-5"><span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-secondary"><UserRound aria-hidden="true" className="size-5" /></span><div><h2 className="text-lg font-black text-secondary">Profile information</h2><p className="text-sm text-muted-foreground">Signed in as @{profile.username} · {profile.role.replaceAll("_", " ")}</p></div></div><form className="mt-5 space-y-5" noValidate onSubmit={saveProfile}>{profileMessage && <Alert>{profileMessage}</Alert>}<Input error={profileForm.formState.errors.fullName?.message} label="Full name" required><input autoFocus className={inputClass} maxLength={100} {...profileForm.register("fullName", { required: true })} /></Input><Input error={profileForm.formState.errors.email?.message} label="Email"><input className={inputClass} maxLength={254} type="email" {...profileForm.register("email")} /></Input><Input error={profileForm.formState.errors.phone?.message} label="Phone"><input className={inputClass} inputMode="tel" maxLength={30} {...profileForm.register("phone")} /></Input><Input error={profileForm.formState.errors.avatar?.message} label="Avatar URL"><input className={inputClass} maxLength={500} placeholder="Optional image URL or local path" {...profileForm.register("avatar")} /></Input><button className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-5 text-sm font-black text-white focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60 sm:w-auto" disabled={profilePending} type="submit">{profilePending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Save aria-hidden="true" className="size-4" />}{profilePending ? "Saving…" : "Save profile"}</button></form></section><section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="flex items-start gap-3 border-b border-border pb-5"><span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-secondary"><KeyRound aria-hidden="true" className="size-5" /></span><div><h2 className="text-lg font-black text-secondary">Change password</h2><p className="text-sm text-muted-foreground">Your current password is required. All sessions are revoked after changing it.</p></div></div><form className="mt-5 space-y-5" noValidate onSubmit={changePassword}>{passwordMessage && <Alert>{passwordMessage}</Alert>}<Input error={passwordForm.formState.errors.currentPassword?.message} label="Current password" required><input autoComplete="current-password" className={inputClass} maxLength={128} type="password" {...passwordForm.register("currentPassword", { required: true })} /></Input><Input error={passwordForm.formState.errors.newPassword?.message} label="New password" required><input autoComplete="new-password" className={inputClass} maxLength={128} minLength={8} type="password" {...passwordForm.register("newPassword", { required: true })} /></Input><Input error={passwordForm.formState.errors.confirmPassword?.message} label="Confirm new password" required><input autoComplete="new-password" className={inputClass} maxLength={128} minLength={8} type="password" {...passwordForm.register("confirmPassword", { required: true })} /></Input><p className="text-xs text-muted-foreground">Minimum 8 characters with uppercase, lowercase, and a number.</p><button className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-secondary focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60 sm:w-auto" disabled={passwordPending} type="submit">{passwordPending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}{passwordPending ? "Changing…" : "Change password"}</button></form></section></div>;
}

function Input({ children, error, label, required }: { children: React.ReactNode; error?: string; label: string; required?: boolean }) { return <label className="block space-y-2 text-sm font-bold text-secondary"><span>{label}{required && <span className="text-destructive"> *</span>}</span>{children}{error && <span className="block text-xs text-destructive">{error}</span>}</label>; }
function Alert({ children }: { children: React.ReactNode }) { return <p className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{children}</p>; }
