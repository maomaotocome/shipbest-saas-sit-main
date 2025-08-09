"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserSettings } from "./get";

export async function updateUserSettings(settings: Partial<UserSettings>): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    // 获取当前设置
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { settings: true },
    });

    const currentSettings = (currentUser?.settings as UserSettings) || {};

    // 合并设置
    const updatedSettings = {
      ...currentSettings,
      ...settings,
    };

    // 更新数据库
    await prisma.user.update({
      where: { id: session.user.id },
      data: { settings: updatedSettings },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update user settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}