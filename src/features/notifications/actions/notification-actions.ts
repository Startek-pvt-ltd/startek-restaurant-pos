"use server";

import { z } from "zod";

import {
  getUserNotifications,
  markAllUserNotificationsRead,
  markUserNotificationRead,
} from "@/features/notifications/services/notification-service";
import { requireAuth } from "@/lib/auth-utils";

const idSchema = z.uuid();

export async function getNotificationsAction() {
  const session = await requireAuth();
  return getUserNotifications(session.user.id);
}

export async function markNotificationReadAction(id: string) {
  const session = await requireAuth();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { success: false };
  await markUserNotificationRead(session.user.id, parsed.data);
  return { success: true };
}

export async function markAllNotificationsReadAction() {
  const session = await requireAuth();
  await markAllUserNotificationsRead(session.user.id);
  return { success: true };
}
