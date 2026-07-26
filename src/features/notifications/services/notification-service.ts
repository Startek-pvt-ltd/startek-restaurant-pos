import "server-only";

import type { NotificationType, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type NotificationDatabase = Prisma.TransactionClient | typeof prisma;

export type NotificationEvent = {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
};

export async function notifyActiveUsers(db: NotificationDatabase, event: NotificationEvent) {
  const users = await db.user.findMany({
    where: {
      status: "ACTIVE",
      role: { in: ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER"] },
    },
    select: { id: true },
  });
  if (!users.length) return;
  await db.notification.createMany({
    data: users.map(({ id }) => ({ ...event, link: event.link ?? null, userId: id })),
  });
}

export async function getUserNotifications(userId: string, take = 20) {
  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        link: true,
        read: true,
        createdAt: true,
      },
    }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);
  return {
    unreadCount,
    items: items.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
  };
}

export async function markUserNotificationRead(userId: string, id: string) {
  await prisma.notification.updateMany({
    where: { id, userId, read: false },
    data: { read: true, readAt: new Date() },
  });
}

export async function markAllUserNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true, readAt: new Date() },
  });
}
