import type { UserRole } from "@/generated/prisma/client";

import type { ApprovedStaffRole } from "../types";

export function manageableRoles(role: UserRole): readonly ApprovedStaffRole[] {
  if (role === "SUPER_ADMIN") return ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER"];
  if (role === "OWNER") return ["MANAGER", "CASHIER"];
  if (role === "MANAGER") return ["CASHIER"];
  return [];
}

export function canManageRole(actorRole: UserRole, targetRole: UserRole) {
  return manageableRoles(actorRole).includes(targetRole as ApprovedStaffRole);
}

export function canCreateStaff(actorRole: UserRole) {
  return manageableRoles(actorRole).length > 0;
}

export function canManageStaff(actorRole: UserRole, targetRole: UserRole) {
  return canManageRole(actorRole, targetRole);
}
