"use server";
import { NotificationType, Prisma } from "@/db/generated/prisma";
import { isAdmin } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { paginatePrismaQuery } from "@/lib/utils";
import { NotificationMessageDetail } from "@/types/notifications/index";
import { ModelDelegate, PaginatedResponse, PaginationParams } from "@/types/pagination";

export async function getNotificationsList(
  params: PaginationParams & {
    searchTitle?: string;
    type?: NotificationType;
  }
): Promise<PaginatedResponse<NotificationMessageDetail>> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const { page, pageSize, searchTitle = "", type } = params;

    const where: Prisma.NotificationMessageWhereInput = {
      ...(searchTitle && {
        translations: {
          some: {
            title: { contains: searchTitle, mode: Prisma.QueryMode.insensitive },
          },
        },
      }),
      ...(type && { type }),
    };

    const prismaArgs: Omit<Prisma.NotificationMessageFindManyArgs, "skip" | "take"> = {
      where,
      include: {
        translations: true,
        userStatuses: {
          include: {
            user: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    };

    return paginatePrismaQuery<
      NotificationMessageDetail,
      Prisma.NotificationMessageCountArgs,
      Prisma.NotificationMessageFindManyArgs
    >(
      prisma.notificationMessage as unknown as ModelDelegate<
        Prisma.NotificationMessageCountArgs,
        Prisma.NotificationMessageFindManyArgs,
        NotificationMessageDetail
      >,
      { page, pageSize },
      prismaArgs
    );
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
    throw new Error("Failed to fetch notifications due to an unknown error");
  }
}
