"use client";

import { Plus, ShieldCheck, UserCheck, UserRoundX, UsersRound } from "lucide-react";
import { useState } from "react";

import { canCreateStaff } from "@/features/staff/permissions/staff-permissions";
import type { StaffRecord } from "@/features/staff/types";
import type { UserRole } from "@/generated/prisma/client";

import { ResetPasswordDialog } from "./reset-password-dialog";
import { StaffForm } from "./staff-form";
import { StaffStatusDialog } from "./staff-status-dialog";
import { StaffTable } from "./staff-table";

export function StaffManagementClient({ active, actorId, actorRole, children, inactive, staff, total }: { active: number; actorId: string; actorRole: UserRole; children: React.ReactNode; inactive: number; staff: StaffRecord[]; total: number }) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<StaffRecord | null>(null);
  const [resetting, setResetting] = useState<StaffRecord | null>(null);
  const [statusTarget, setStatusTarget] = useState<StaffRecord | null>(null);
  return <><header className="flex flex-col gap-4 rounded-3xl bg-secondary p-5 text-white shadow-[0_16px_40px_rgba(74,35,16,0.16)] sm:p-7 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary"><ShieldCheck aria-hidden="true" className="size-4" />Secure administration</div><h1 className="mt-2 text-2xl font-black sm:text-3xl">Staff Management</h1><p className="mt-1 max-w-2xl text-sm text-white/65">Manage approved restaurant roles, account access, and password security without exposing credentials.</p></div>{canCreateStaff(actorRole) && <button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-secondary transition hover:scale-[1.02] hover:bg-amber-400 focus-visible:ring-2 focus-visible:ring-white" onClick={() => setCreating(true)} type="button"><Plus aria-hidden="true" className="size-5" />Add Staff</button>}</header><section aria-label="Staff statistics" className="grid gap-3 sm:grid-cols-3"><Summary icon={UsersRound} label="Total staff" value={total} /><Summary icon={UserCheck} label="Active" value={active} /><Summary icon={UserRoundX} label="Inactive" value={inactive} /></section>{children}<StaffTable actorId={actorId} actorRole={actorRole} onEdit={setEditing} onReset={setResetting} onStatus={setStatusTarget} staff={staff} /><StaffForm actorId={actorId} actorRole={actorRole} onClose={() => setCreating(false)} open={creating} staff={null} /><StaffForm actorId={actorId} actorRole={actorRole} onClose={() => setEditing(null)} open={Boolean(editing)} staff={editing} /><ResetPasswordDialog onClose={() => setResetting(null)} staff={resetting} /><StaffStatusDialog onClose={() => setStatusTarget(null)} staff={statusTarget} /></>;
}

function Summary({ icon: Icon, label, value }: { icon: typeof UsersRound; label: string; value: number }) {
  return <article className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"><span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-secondary"><Icon aria-hidden="true" className="size-5" /></span><div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p><p className="text-2xl font-black text-secondary">{value}</p></div></article>;
}
