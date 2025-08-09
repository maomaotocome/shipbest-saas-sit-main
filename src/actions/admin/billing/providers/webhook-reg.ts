"use server";

import { isAdmin } from "@/lib/auth/utils";
import { registerWebhook } from "@/services/billing/payment/webhook/register-webhook";

export async function registerWebhookAction(providerAccountId: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await registerWebhook(providerAccountId);
    return { success: true, result };
  } catch (error) {
    console.error("Error registering webhook:", error);
    throw new Error("Failed to register webhook");
  }
}
