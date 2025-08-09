"use server";

import { NotificationReadStatus, NotificationType, Prisma } from "@/db/generated/prisma";
import { getUser, isAuthenticated } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { paginatePrismaQuery } from "@/lib/utils";
import { ModelDelegate, PaginatedResponse, PaginationParams } from "@/types/pagination";

// Define the base message type fetched from NotificationMessage
type BaseSystemMessage = Prisma.NotificationMessageGetPayload<{
  include: {
    translations: true; // Fetch all translations
  };
}>;

// Define the final item type, adding the user-specific status
// Mimics NotificationListItem structure from get.ts but status is derived
type SystemNotificationListItem = BaseSystemMessage & {
  status: NotificationReadStatus;
  userStatusId: string | null; // ID of the status record if it exists
};

export async function getSystemNotifications(
  params: PaginationParams
): Promise<PaginatedResponse<SystemNotificationListItem>> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date(); // Get current time

  try {
    // 1. Paginate NotificationMessage for SYSTEM type
    const messageArgs: Omit<Prisma.NotificationMessageFindManyArgs, "skip" | "take"> = {
      where: {
        type: NotificationType.SYSTEM,
        // Add scheduling and expiration conditions
        OR: [
          // Condition for scheduling: either null or in the past/now
          {
            scheduledAt: null,
          },
          {
            scheduledAt: {
              lte: now,
            },
          },
        ],
        AND: [
          // Condition for expiration: either null or in the future
          {
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        ],
        // Note: Combining top-level OR for scheduling and top-level AND for expiration
        // Alternatively, structure might depend on exact Prisma version behavior
        // If the above doesn't work as expected, structure like:
        // AND: [
        //   { type: NotificationType.SYSTEM },
        //   { OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }] },
        //   { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        // ]
      },
      include: {
        translations: true,
      },
      orderBy: [
        { priority: "asc" }, // Primary sort: priority ascending (lower number = higher priority)
        { createdAt: "desc" }, // Secondary sort: createdAt descending
      ],
    };

    const paginatedMessages = await paginatePrismaQuery<
      BaseSystemMessage,
      Prisma.NotificationMessageCountArgs,
      Prisma.NotificationMessageFindManyArgs
    >(
      // Prisma doesn't have a direct delegate type that fits ModelDelegate perfectly here
      // We cast, understanding the required methods (count, findMany) exist
      prisma.notificationMessage as unknown as ModelDelegate<
        Prisma.NotificationMessageCountArgs,
        Prisma.NotificationMessageFindManyArgs,
        BaseSystemMessage
      >,
      params,
      messageArgs
    );

    // 2. Get message IDs from the current page
    const messageIds = paginatedMessages.items.map((msg) => msg.id);

    // 3. Find existing READ statuses for these messages for the current user
    const readStatuses = await prisma.notificationMessageUserStatus.findMany({
      where: {
        userId: user.id,
        messageId: {
          in: messageIds,
        },
        status: NotificationReadStatus.READ, // We only care if it's marked READ
      },
      select: {
        id: true, // Get the status ID
        messageId: true,
      },
    });

    // Create a Set or Map for efficient lookup of read message IDs
    const readMessageIds = new Map(readStatuses.map((status) => [status.messageId, status.id]));

    // 4. Combine message data with derived status
    const itemsWithStatus: SystemNotificationListItem[] = paginatedMessages.items.map((message) => {
      const userStatusId = readMessageIds.get(message.id) ?? null;
      return {
        ...message,
        status: userStatusId ? NotificationReadStatus.READ : NotificationReadStatus.UNREAD,
        userStatusId: userStatusId,
      };
    });

    // 5. Return the final paginated response
    return {
      ...paginatedMessages,
      items: itemsWithStatus,
    };
  } catch (error) {
    console.error("Failed to fetch system notifications:", error);
    throw new Error("Failed to fetch system notifications");
  }
}
