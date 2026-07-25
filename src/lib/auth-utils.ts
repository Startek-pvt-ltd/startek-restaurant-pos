import type { Session } from "next-auth";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { UserRole } from "@/generated/prisma/client";

type AllowedRoles = UserRole | readonly UserRole[];

export function hasRole(userRole: UserRole, allowedRoles: AllowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return roles.includes(userRole);
}

export async function requireAuth(): Promise<Session> {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  return session;
}

export async function requireRole(allowedRoles: AllowedRoles): Promise<Session> {
  const session = await requireAuth();

  if (!hasRole(session.user.role, allowedRoles)) {
    redirect("/dashboard?error=forbidden");
  }

  return session;
}
