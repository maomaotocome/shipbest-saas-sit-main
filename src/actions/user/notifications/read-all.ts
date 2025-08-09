"use server";

import { NotificationReadStatus, NotificationType } from "@/db/generated/prisma"; // Import enums
import { getUser, isAuthenticated } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";

export async function markAllNotificationsAsRead() {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();

  try {
    // 1. Update existing UNREAD statuses to READ
    await prisma.notificationMessageUserStatus.updateMany({
      where: {
        userId: user.id,
        status: NotificationReadStatus.UNREAD,
      },
      data: {
        status: NotificationReadStatus.READ,
      },
    });

    // 2. Find all currently active SYSTEM message IDs
    const activeSystemMessages = await prisma.notificationMessage.findMany({
      where: {
        type: NotificationType.SYSTEM,
        OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }],
        AND: [
          {
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        ],
      },
      select: {
        id: true,
      },
    });
    const activeSystemMessageIds = activeSystemMessages.map((msg) => msg.id);

    if (activeSystemMessageIds.length === 0) {
      return { success: true }; // Nothing more to do if no active system messages
    }

    // 3. Find existing statuses for these system messages for the user
    const existingStatuses = await prisma.notificationMessageUserStatus.findMany({
      where: {
        userId: user.id,
        messageId: {
          in: activeSystemMessageIds,
        },
      },
      select: {
        messageId: true,
      },
    });
    const existingStatusMessageIds = new Set(existingStatuses.map((status) => status.messageId));

    // 4. Determine which active system messages need a status record created
    const messageIdsToCreateStatusFor = activeSystemMessageIds.filter(
      (id) => !existingStatusMessageIds.has(id)
    );

    // 5. Create new READ status records for these messages
    if (messageIdsToCreateStatusFor.length > 0) {
      await prisma.notificationMessageUserStatus.createMany({
        data: messageIdsToCreateStatusFor.map((messageId) => ({
          userId: user.id,
          messageId: messageId,
          status: NotificationReadStatus.READ,
        })),
        skipDuplicates: true, // Important to avoid errors if a race condition occurs
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    // Optionally rethrow or return a specific error response
    throw new Error("Failed to mark all notifications as read");
  }
}
