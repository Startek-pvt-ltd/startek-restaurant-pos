import "server-only";

import type { Session } from "next-auth";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/auth";
import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type AllowedRoles = UserRole | readonly UserRole[];
const APPLICATION_ROLES: readonly UserRole[] = ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER"];

export function hasRole(userRole: UserRole, allowedRoles: AllowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return roles.includes(userRole);
}

export const requireAuth = cache(async (): Promise<Session> => {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true },
  });
  if (!user || user.status !== "ACTIVE" || !APPLICATION_ROLES.includes(user.role)) {
    redirect("/login?error=access-disabled");
  }

  session.user.role = user.role;

  return session;
});

export async function requireRole(allowedRoles: AllowedRoles): Promise<Session> {
  const session = await requireAuth();

  if (!hasRole(session.user.role, allowedRoles)) {
    redirect("/dashboard?error=forbidden");
  }

  return session;
}
