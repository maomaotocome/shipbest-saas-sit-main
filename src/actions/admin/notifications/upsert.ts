"use server";

import { NotificationMessage, Prisma } from "@/db/generated/prisma";
import { isAdmin } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";

export async function upsertNotification(
  data: Prisma.NotificationMessageUpsertArgs
): Promise<NotificationMessage> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  return await prisma.notificationMessage.upsert(data);
}
