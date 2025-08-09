"use server";

import { NotificationReadStatus } from "@/db/generated/prisma";
import { getUser, isAuthenticated } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";

export async function markNotificationAsRead(messageId: string) {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }

  const updatedStatus = await prisma.notificationMessageUserStatus.upsert({
    where: {
      userId_messageId: {
        userId: user.id,
        messageId: messageId,
      },
    },
    update: {
      status: NotificationReadStatus.READ,
    },
    create: {
      userId: user.id,
      messageId: messageId,
      status: NotificationReadStatus.READ,
    },
  });

  return updatedStatus;
}
