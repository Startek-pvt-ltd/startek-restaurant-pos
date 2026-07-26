import type { UserRole, UserStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

export function StaffRoleBadge({ role }: { role: UserRole }) {
  const style = role === "SUPER_ADMIN" ? "bg-purple-100 text-purple-800" : role === "OWNER" ? "bg-amber-100 text-amber-900" : role === "MANAGER" ? "bg-blue-100 text-blue-800" : "bg-stone-100 text-stone-700";
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-wide", style)}>{role.replaceAll("_", " ")}</span>;
}

export function StaffStatusBadge({ status }: { status: UserStatus }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-wide", status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}><span aria-hidden="true" className={cn("size-1.5 rounded-full", status === "ACTIVE" ? "bg-green-500" : "bg-red-500")} />{status}</span>;
}
