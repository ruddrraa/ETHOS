import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({ data: input });
}

export async function createBulkNotifications(
  userIds: string[],
  data: Omit<CreateNotificationInput, "userId">
) {
  return prisma.notification.createMany({
    data: userIds.map((userId) => ({ ...data, userId })),
  });
}

export async function getUserNotifications(userId: string, options?: { unreadOnly?: boolean }) {
  return prisma.notification.findMany({
    where: {
      userId,
      ...(options?.unreadOnly && { isRead: false }),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markNotificationRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}
