"use server";

import { NotificationReadStatus, NotificationType } from "@/db/generated/prisma";
import { getUser, isAuthenticated } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";

interface UnreadCounts {
  personalized: number;
  system: number;
  total: number;
}

export async function getUnreadNotificationCounts(): Promise<UnreadCounts> {
  console.log("--- getUnreadNotificationCounts ACTION CALLED ---");
  if (!(await isAuthenticated())) {
    // Return zero counts if not authenticated, or throw error based on desired behavior
    // throw new Error("Unauthorized");
    return { personalized: 0, system: 0, total: 0 };
  }

  const user = await getUser();
  if (!user) {
    // Return zero counts if user not found
    return { personalized: 0, system: 0, total: 0 };
  }

  const now = new Date();

  try {
    console.log("--- Executing count queries --- user:", user.id);
    // Count unread personalized notifications
    const personalizedUnreadPromise = prisma.notificationMessageUserStatus.count({
      where: {
        userId: user.id,
        status: NotificationReadStatus.UNREAD,
        message: {
          type: NotificationType.PERSONALIZED,
          OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }],
          // No expiration check for personalized
        },
      },
    });

    // Count total active system notifications
    const activeSystemMessagesPromise = prisma.notificationMessage.count({
      where: {
        type: NotificationType.SYSTEM,
        OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }],
        AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }],
      },
    });

    // Count system messages explicitly marked as READ by the user
    const readSystemStatusesPromise = prisma.notificationMessageUserStatus.count({
      where: {
        userId: user.id,
        status: NotificationReadStatus.READ,
        message: {
          type: NotificationType.SYSTEM,
        },
      },
    });

    // Run counts concurrently
    const [personalizedUnreadCount, activeSystemMessagesCount, readSystemStatusesCount] =
      await Promise.all([
        personalizedUnreadPromise,
        activeSystemMessagesPromise,
        readSystemStatusesPromise,
      ]);

    // Calculate system unread count
    const systemUnreadCount = Math.max(0, activeSystemMessagesCount - readSystemStatusesCount);

    // Calculate total count
    const totalUnreadCount = personalizedUnreadCount + systemUnreadCount;

    return {
      personalized: personalizedUnreadCount,
      system: systemUnreadCount,
      total: totalUnreadCount,
    };
  } catch (error) {
    console.error("--- ERROR in getUnreadNotificationCounts ---:", error);
    // Return zero counts on error
    return { personalized: 0, system: 0, total: 0 };
  }
}
