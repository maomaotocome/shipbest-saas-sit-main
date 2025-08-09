"use server";

import { NotificationType, Prisma } from "@/db/generated/prisma";
import { getUser, isAuthenticated } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { paginatePrismaQuery } from "@/lib/utils";
import { ModelDelegate, PaginatedResponse, PaginationParams } from "@/types/pagination";

type NotificationListItem = Prisma.NotificationMessageUserStatusGetPayload<{
  include: {
    message: {
      include: {
        translations: true;
      };
    };
  };
}>;

interface GetNotificationsParams extends PaginationParams {
  type?: NotificationType;
}

export async function getNotifications(
  params: GetNotificationsParams
): Promise<PaginatedResponse<NotificationListItem>> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }

  const { page, pageSize, type } = params;
  const now = new Date();

  try {
    const where: Prisma.NotificationMessageUserStatusWhereInput = {
      userId: user.id,
      message: {
        OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }],
        ...(type && { type: type }),
      },
    };

    const prismaArgs: Omit<Prisma.NotificationMessageUserStatusFindManyArgs, "skip" | "take"> = {
      where,
      include: {
        message: {
          include: {
            translations: true,
          },
        },
      },
      orderBy: [
        { createdAt: "desc" }, // Secondary sort: createdAt descending
      ],
    };

    return paginatePrismaQuery<
      NotificationListItem,
      Prisma.NotificationMessageUserStatusCountArgs,
      Prisma.NotificationMessageUserStatusFindManyArgs
    >(
      prisma.notificationMessageUserStatus as unknown as ModelDelegate<
        Prisma.NotificationMessageUserStatusCountArgs,
        Prisma.NotificationMessageUserStatusFindManyArgs,
        NotificationListItem
      >,
      { page, pageSize },
      prismaArgs
    );
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    throw new Error("Failed to fetch notifications");
  }
}
