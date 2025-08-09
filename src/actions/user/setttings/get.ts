"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface UserSettings {
  isPublicDefault?: boolean;
  // 可以添加更多设置字段
}

export async function getUserSettings(): Promise<UserSettings | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { settings: true },
    });

    if (!user?.settings) {
      return null;
    }

    return user.settings as UserSettings;
  } catch (error) {
    console.error("Failed to get user settings:", error);
    return null;
  }
}
