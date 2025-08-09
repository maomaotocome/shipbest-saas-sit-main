"use server";

import { NotificationReadStatus, NotificationType, Prisma } from "@/db/generated/prisma";
import { getUser, isAuthenticated } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";

/**
 * Type for the simplified notification object returned by the action.
 */
export interface SystemToastNotification {
  id: string;
  title: string;
  content: string;
}

/**
 * Fetches the latest, active, unread system notification for the current user.
 * @returns The notification object {id, title, content} or null if none is found.
 */
export async function getLatestUnreadSystemToastAction(): Promise<SystemToastNotification | null> {
  if (!(await isAuthenticated())) {
    return null; // Not logged in, no notification
  }

  const user = await getUser();
  if (!user) {
    return null; // User not found
  }

  const userLocale = user.locale || "en"; // Default to 'en' if user locale is null
  const now = new Date();

  try {
    const latestMessage = await prisma.notificationMessage.findFirst({
      where: {
        type: NotificationType.SYSTEM,
        // Check activation/expiration dates
        OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }],
        AND: [
          { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
          // Ensure the user hasn't read this specific message
          {
            NOT: {
              userStatuses: {
                some: {
                  userId: user.id,
                  status: NotificationReadStatus.READ,
                },
              },
            },
          },
        ],
      },
      orderBy: [{ createdAt: "desc" }], // Get the most recent one first
      include: {
        translations: true, // Include translations to get title/content
      },
    });

    if (!latestMessage || latestMessage.translations.length === 0) {
      return null; // No matching message or no translations found
    }

    // Find the best translation (user locale > default 'en' > first available)
    let translation = latestMessage.translations.find((t) => t.locale === userLocale);
    if (!translation) {
      translation = latestMessage.translations.find((t) => t.locale === "en");
    }
    if (!translation) {
      translation = latestMessage.translations[0];
    }

    return {
      id: latestMessage.id,
      title: translation.title,
      content: translation.content,
    };
  } catch (error) {
    console.error("Error fetching latest system toast notification:", error);
    return null; // Return null on error
  }
}

/**
 * Marks a specific notification message as READ for the current user.
 * @param notificationId The ID of the NotificationMessage to mark as read.
 * @returns Object indicating success or throws an error.
 */
export async function markSystemNotificationAsReadAction(
  notificationId: string
): Promise<{ success: boolean }> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized: User not authenticated.");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized: User not found.");
  }

  if (!notificationId) {
    throw new Error("Notification ID is required.");
  }

  try {
    await prisma.notificationMessageUserStatus.upsert({
      where: {
        userId_messageId: {
          userId: user.id,
          messageId: notificationId,
        },
      },
      create: {
        userId: user.id,
        messageId: notificationId,
        status: NotificationReadStatus.READ,
      },
      update: {
        status: NotificationReadStatus.READ,
      },
    });
    return { success: true };
  } catch (error) {
    console.error(
      `Error marking notification ${notificationId} as read for user ${user.id}:`,
      error
    );
    // Check for specific Prisma errors if needed (e.g., foreign key constraint)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new Error(
        `Failed to mark notification as read. Notification ID ${notificationId} might not exist.`
      );
    }
    throw new Error("Failed to mark notification as read.");
  }
}
