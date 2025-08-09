import { NotificationReadStatus } from "@/db/generated/prisma";
import { prisma } from "@/lib/prisma";
import { SendNotificationBody, SendNotificationMode } from "@/types/notifications/index";

export async function sendNotification(body: SendNotificationBody, messageId: string) {
  const { mode } = body;

  if (!mode || ![SendNotificationMode.ALL, SendNotificationMode.SPECIFIC].includes(mode)) {
    throw new Error("Invalid mode. Must be 'ALL' or 'SPECIFIC'");
  }

  try {
    // First get the notification message and check the type
    const notification = await prisma.notificationMessage.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        type: true,
        targetUserType: true,
        scheduledAt: true,
      },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    // If scheduled sending is set and the time has not arrived, do not process
    if (notification.scheduledAt && new Date(notification.scheduledAt) > new Date()) {
      console.log(`Notification ${messageId} is scheduled for later: ${notification.scheduledAt}`);
      return []; // Return an empty array, indicating no immediate sending
    }

    // Special handling for system notifications: first check if filtering by target user type is needed
    let users;
    if (notification.type === "SYSTEM" && notification.targetUserType !== "ALL") {
      // Get users who meet the criteria
      // Note: Add relevant conditions here according to the actual user table structure

      // Here assume that the user table has a createdAt field, to distinguish between new and existing users
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      users = await prisma.user.findMany({
        select: { id: true },
      });
    } else {
      // All users
      users = await prisma.user.findMany({
        select: { id: true },
      });
    }

    // For system notifications, user status records do not need to be created immediately
    // Change to create as needed to reduce database load
    if (notification.type === "SYSTEM") {
      // Only record that the notification has been sent, do not create user status records
      return users.map((user) => ({
        userId: user.id,
        messageId,
        status: NotificationReadStatus.UNREAD,
      }));
    }

    // For personalized notifications, or when explicitly required to create user status records
    // All users mode
    if (mode === SendNotificationMode.ALL) {
      const userStatuses = users.map((user) => ({
        userId: user.id,
        messageId,
        status: NotificationReadStatus.UNREAD,
      }));

      // Use skipDuplicates to skip existing records
      const result = await prisma.notificationMessageUserStatus.createMany({
        data: userStatuses,
        skipDuplicates: true,
      });

      console.log(`Created ${result.count} notification status records for ALL users`);
      return userStatuses;
    }
    // Specify user mode
    else {
      const { userIds } = body;
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        throw new Error("User IDs are required in SPECIFIC mode");
      }

      // Validate whether user IDs are valid
      const validUsers = await prisma.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
        select: {
          id: true,
        },
      });

      if (validUsers.length !== userIds.length) {
        throw new Error("Some user IDs are invalid");
      }

      // Use transaction to ensure data consistency
      return await prisma.$transaction(async (tx) => {
        // 1. Find all user status records currently associated with this message
        const existingStatuses = await tx.notificationMessageUserStatus.findMany({
          where: {
            messageId,
          },
          select: {
            userId: true,
          },
        });

        const existingUserIds = existingStatuses.map((status) => status.userId);

        // 2. Determine user IDs to be removed (existing but not in the new list)
        const userIdsToRemove = existingUserIds.filter((id) => !userIds.includes(id));

        // 3. If there are user statuses to be removed, perform deletion
        if (userIdsToRemove.length > 0) {
          await tx.notificationMessageUserStatus.deleteMany({
            where: {
              messageId,
              userId: {
                in: userIdsToRemove,
              },
            },
          });
          console.log(`Removed ${userIdsToRemove.length} users from notification ${messageId}`);
        }

        // 4. Create status records for new users (skip existing ones)
        const userStatuses = validUsers.map((user) => ({
          userId: user.id,
          messageId,
          status: NotificationReadStatus.UNREAD,
        }));

        const result = await tx.notificationMessageUserStatus.createMany({
          data: userStatuses,
          skipDuplicates: true,
        });

        console.log(`Created ${result.count} new notification status records for SPECIFIC users`);

        // 5. Return all user statuses currently associated with this message
        return userStatuses;
      });
    }
  } catch (error) {
    console.error("Failed to send notifications:", error);
    throw error;
  }
}
