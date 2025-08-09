"use server";

import { isAdmin } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { NotificationMessageDetail } from "@/types/notifications/index";

export async function getNotificationDetail(id: string): Promise<NotificationMessageDetail> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  const notification = await prisma.notificationMessage.findUnique({
    where: {
      id,
    },
    include: {
      translations: true,
      userStatuses: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  return notification;
}
