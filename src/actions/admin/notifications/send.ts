"use server";

import { isAdmin } from "@/lib/auth/utils";
import { sendNotification } from "@/services/notifications/send";
import { SendNotificationBody } from "@/types/notifications/index";
export async function sendNotificationToUsers(
  messageId: string,
  body: SendNotificationBody
): Promise<{ success: true; message: string }> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await sendNotification(body, messageId);

    return {
      success: true,
      message: `Notification sent to ${result.length} users`,
    };
  } catch (error) {
    console.error("[NOTIFICATIONS_SEND]", error);
    throw new Error("Failed to send notification");
  }
}
