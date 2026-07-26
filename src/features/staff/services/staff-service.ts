import "server-only";

import bcrypt from "bcryptjs";

import { Prisma, type UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { notifyActiveUsers } from "@/features/notifications/services/notification-service";

import { canManageRole } from "../permissions/staff-permissions";
import { APPROVED_STAFF_ROLES, STAFF_ACCESS_ROLES, type ApprovedStaffRole, type StaffFilters, type StaffRecord } from "../types";
import type { ChangePasswordInput, CreateStaffInput, EditStaffInput, ProfileInput, ResetStaffPasswordInput } from "../validations/staff-schema";

const publicStaffSelect = {
  id: true,
  fullName: true,
  username: true,
  email: true,
  phone: true,
  avatar: true,
  role: true,
  status: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

function staffRecord(user: Prisma.UserGetPayload<{ select: typeof publicStaffSelect }>): StaffRecord {
  return {
    ...user,
    role: user.role as ApprovedStaffRole,
    lastLogin: user.lastLogin?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function staffWhere(filters: StaffFilters): Prisma.UserWhereInput {
  return {
    role: filters.role ?? { in: [...APPROVED_STAFF_ROLES] },
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.query ? {
      OR: [
        { fullName: { contains: filters.query, mode: "insensitive" } },
        { username: { contains: filters.query, mode: "insensitive" } },
        { email: { contains: filters.query, mode: "insensitive" } },
        { phone: { contains: filters.query, mode: "insensitive" } },
      ],
    } : {}),
  };
}

function staffOrderBy(sort: StaffFilters["sort"]): Prisma.UserOrderByWithRelationInput[] {
  if (sort === "role") return [{ role: "asc" }, { fullName: "asc" }];
  if (sort === "newest") return [{ createdAt: "desc" }, { fullName: "asc" }];
  if (sort === "oldest") return [{ createdAt: "asc" }, { fullName: "asc" }];
  if (sort === "last-login") return [{ lastLogin: { sort: "desc", nulls: "last" } }, { fullName: "asc" }];
  return [{ fullName: "asc" }, { username: "asc" }];
}

export async function getStaffPage(filters: StaffFilters) {
  const where = staffWhere(filters);
  const total = await prisma.user.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(filters.page, totalPages);
  const users = await prisma.user.findMany({
    where,
    select: publicStaffSelect,
    orderBy: staffOrderBy(filters.sort),
    skip: (page - 1) * filters.pageSize,
    take: filters.pageSize,
  });
  const groups = await prisma.user.groupBy({
    by: ["status"],
    where: { role: { in: [...APPROVED_STAFF_ROLES] } },
    _count: { _all: true },
  });
  return {
    staff: users.map(staffRecord),
    page,
    total,
    totalPages,
    active: groups.find((group) => group.status === "ACTIVE")?._count._all ?? 0,
    inactive: groups.find((group) => group.status === "INACTIVE")?._count._all ?? 0,
  };
}

export async function getStaffDetails(id: string) {
  const [user, sales] = await Promise.all([
    prisma.user.findFirst({
      where: { id, role: { in: [...APPROVED_STAFF_ROLES] } },
      select: {
        ...publicStaffSelect,
        _count: { select: { orders: true, expenses: true } },
      },
    }),
    prisma.order.aggregate({
      where: { cashierId: id, status: "COMPLETED" },
      _sum: { grandTotal: true },
      _count: { _all: true },
    }),
  ]);
  if (!user) return null;
  const activities = await prisma.activityLog.findMany({
    where: { OR: [{ userId: id }, { action: { contains: `| ${id} |` } }] },
    select: { id: true, action: true, createdAt: true, user: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" },
    take: 12,
  });
  return {
    staff: staffRecord(user),
    orderCount: user._count.orders,
    completedOrderCount: sales._count._all,
    salesProcessed: sales._sum.grandTotal?.toFixed(2) ?? "0.00",
    expenseCount: user._count.expenses,
    activities: activities.map((activity) => ({
      id: activity.id,
      action: activity.action,
      actor: activity.user?.fullName ?? "System",
      createdAt: activity.createdAt.toISOString(),
    })),
  };
}

export async function getCurrentProfile(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, fullName: true, username: true, email: true, phone: true, avatar: true, role: true, status: true, lastLogin: true, createdAt: true },
  });
}

async function activeActor(tx: Prisma.TransactionClient, actorId: string) {
  const actor = await tx.user.findUnique({ where: { id: actorId }, select: { role: true, status: true } });
  if (!actor || actor.status !== "ACTIVE" || !STAFF_ACCESS_ROLES.includes(actor.role as (typeof STAFF_ACCESS_ROLES)[number])) {
    throw new Error("STAFF_ACCESS_DENIED");
  }
  return actor;
}

async function assertUniqueIdentity(tx: Prisma.TransactionClient, username: string, email: string, excludeId?: string) {
  const duplicate = await tx.user.findFirst({
    where: {
      ...(excludeId ? { id: { not: excludeId } } : {}),
      OR: [
        { username: { equals: username, mode: "insensitive" } },
        ...(email ? [{ email: { equals: email, mode: "insensitive" as const } }] : []),
      ],
    },
    select: { username: true, email: true },
  });
  if (!duplicate) return;
  if (duplicate.username.toLowerCase() === username.toLowerCase()) throw new Error("STAFF_USERNAME_EXISTS");
  throw new Error("STAFF_EMAIL_EXISTS");
}

function safeName(value: string) {
  return value.replaceAll("|", "-").slice(0, 100);
}

function activity(action: string, targetId: string, targetName: string) {
  return `${action} | ${targetId} | ${safeName(targetName)}`;
}

export function assertPrivilegedDeactivationCount(role: UserRole, active: number) {
  if (role !== "SUPER_ADMIN" && role !== "OWNER") return;
  if (active <= 1) throw new Error(role === "SUPER_ADMIN" ? "STAFF_LAST_SUPER_ADMIN" : "STAFF_LAST_OWNER");
}

async function protectLastPrivilegedAccount(tx: Prisma.TransactionClient, role: UserRole) {
  if (role !== "SUPER_ADMIN" && role !== "OWNER") return;
  const active = await tx.user.count({ where: { role, status: "ACTIVE" } });
  assertPrivilegedDeactivationCount(role, active);
}

export async function createStaff(input: CreateStaffInput, actorId: string) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  return prisma.$transaction(async (tx) => {
    const actor = await activeActor(tx, actorId);
    if (!canManageRole(actor.role, input.role)) throw new Error("STAFF_ROLE_DENIED");
    await assertUniqueIdentity(tx, input.username, input.email);
    const user = await tx.user.create({
      data: {
        fullName: input.fullName,
        username: input.username,
        email: input.email || null,
        phone: input.phone || null,
        avatar: input.avatar || null,
        role: input.role,
        status: input.status,
        password: passwordHash,
      },
      select: { id: true, fullName: true },
    });
    await tx.activityLog.create({ data: { userId: actorId, action: activity("STAFF_CREATED", user.id, user.fullName) } });
    await notifyActiveUsers(tx, { title: "Staff account created", message: `${user.fullName} was added to staff.`, type: "STAFF_CREATED", link: "/staff" });
    return user;
  }, { isolationLevel: "Serializable" });
}

export async function updateStaff(id: string, input: EditStaffInput, actorId: string) {
  return prisma.$transaction(async (tx) => {
    const actor = await activeActor(tx, actorId);
    const target = await tx.user.findFirst({ where: { id, role: { in: [...APPROVED_STAFF_ROLES] } }, select: { fullName: true, role: true, status: true } });
    if (!target) throw new Error("STAFF_NOT_FOUND");
    if (id === actorId && (input.role !== target.role || input.status !== "ACTIVE")) throw new Error("STAFF_SELF_RESTRICTION");
    if (!canManageRole(actor.role, target.role) || !canManageRole(actor.role, input.role)) throw new Error("STAFF_ROLE_DENIED");
    if (target.status === "ACTIVE" && (input.status === "INACTIVE" || input.role !== target.role)) await protectLastPrivilegedAccount(tx, target.role);
    await assertUniqueIdentity(tx, input.username, input.email, id);
    const statusChanged = target.status !== input.status;
    await tx.user.update({
      where: { id },
      data: {
        fullName: input.fullName,
        username: input.username,
        email: input.email || null,
        phone: input.phone || null,
        avatar: input.avatar || null,
        role: input.role,
        status: input.status,
        ...(statusChanged ? { sessionVersion: { increment: 1 } } : {}),
      },
    });
    await tx.activityLog.create({ data: { userId: actorId, action: activity("STAFF_UPDATED", id, input.fullName) } });
    if (statusChanged) {
      await tx.activityLog.create({ data: { userId: actorId, action: activity(input.status === "ACTIVE" ? "STAFF_ACTIVATED" : "STAFF_DEACTIVATED", id, input.fullName) } });
      if (input.status === "INACTIVE") await notifyActiveUsers(tx, { title: "Staff account deactivated", message: `${input.fullName} was deactivated.`, type: "STAFF_DEACTIVATED", link: "/staff" });
    }
    return { id };
  }, { isolationLevel: "Serializable" });
}

export async function changeStaffStatus(id: string, status: "ACTIVE" | "INACTIVE", actorId: string) {
  return prisma.$transaction(async (tx) => {
    const actor = await activeActor(tx, actorId);
    const target = await tx.user.findFirst({ where: { id, role: { in: [...APPROVED_STAFF_ROLES] } }, select: { fullName: true, role: true, status: true } });
    if (!target) throw new Error("STAFF_NOT_FOUND");
    if (id === actorId && status === "INACTIVE") throw new Error("STAFF_SELF_RESTRICTION");
    if (!canManageRole(actor.role, target.role)) throw new Error("STAFF_ROLE_DENIED");
    if (target.status === status) return { id };
    if (status === "INACTIVE") await protectLastPrivilegedAccount(tx, target.role);
    await tx.user.update({ where: { id }, data: { status, sessionVersion: { increment: 1 } } });
    await tx.activityLog.create({ data: { userId: actorId, action: activity(status === "ACTIVE" ? "STAFF_ACTIVATED" : "STAFF_DEACTIVATED", id, target.fullName) } });
    if (status === "INACTIVE") await notifyActiveUsers(tx, { title: "Staff account deactivated", message: `${target.fullName} was deactivated.`, type: "STAFF_DEACTIVATED", link: "/staff" });
    return { id };
  }, { isolationLevel: "Serializable" });
}

export async function resetStaffPassword(input: ResetStaffPasswordInput, actorId: string) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  return prisma.$transaction(async (tx) => {
    const actor = await activeActor(tx, actorId);
    const target = await tx.user.findFirst({ where: { id: input.id, role: { in: [...APPROVED_STAFF_ROLES] } }, select: { fullName: true, role: true } });
    if (!target) throw new Error("STAFF_NOT_FOUND");
    if (!canManageRole(actor.role, target.role)) throw new Error("STAFF_ROLE_DENIED");
    await tx.user.update({ where: { id: input.id }, data: { password: passwordHash, sessionVersion: { increment: 1 } } });
    await tx.activityLog.create({ data: { userId: actorId, action: activity("STAFF_PASSWORD_RESET", input.id, target.fullName) } });
    return { id: input.id };
  });
}

export async function updateProfile(input: ProfileInput, userId: string) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { username: true, status: true } });
    if (!user || user.status !== "ACTIVE") throw new Error("PROFILE_ACCESS_DENIED");
    await assertUniqueIdentity(tx, user.username, input.email, userId);
    await tx.user.update({ where: { id: userId }, data: { fullName: input.fullName, email: input.email || null, phone: input.phone || null, avatar: input.avatar || null } });
    await tx.activityLog.create({ data: { userId, action: activity("PROFILE_UPDATED", userId, input.fullName) } });
    return { id: userId };
  });
}

export async function changeOwnPassword(input: ChangePasswordInput, userId: string) {
  const current = await prisma.user.findUnique({ where: { id: userId }, select: { password: true, fullName: true, status: true } });
  if (!current || current.status !== "ACTIVE") throw new Error("PROFILE_ACCESS_DENIED");
  if (!await bcrypt.compare(input.currentPassword, current.password)) throw new Error("PROFILE_CURRENT_PASSWORD_INVALID");
  const passwordHash = await bcrypt.hash(input.newPassword, 12);
  return prisma.$transaction(async (tx) => {
    const updated = await tx.user.updateMany({ where: { id: userId, password: current.password, status: "ACTIVE" }, data: { password: passwordHash, sessionVersion: { increment: 1 } } });
    if (updated.count !== 1) throw new Error("PROFILE_PASSWORD_CONFLICT");
    await tx.activityLog.create({ data: { userId, action: activity("PASSWORD_CHANGED", userId, current.fullName) } });
    return { id: userId };
  });
}
