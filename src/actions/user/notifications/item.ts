"use server";

import { type Locale } from "@/i18n/locales";
import { getUser, isAuthenticated } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";

export async function getNotificationItem(id: string) {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }

  const locale = (await getLocale()) as Locale;

  const notification = await prisma.notificationMessageUserStatus.findUnique({
    where: {
      userId_messageId: {
        userId: user.id,
        messageId: id,
      },
    },
    include: {
      message: {
        include: {
          translations: {
            where: {
              locale,
            },
          },
        },
      },
    },
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  return notification;
}
