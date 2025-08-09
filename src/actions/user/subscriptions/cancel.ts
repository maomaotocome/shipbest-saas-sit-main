"use server";

import { getUser, isAuthenticated } from "@/lib/auth/utils";
import { cancel } from "@/services/billing/payment/cancel";
export async function cancelSubscriptionAction(subscriptionId: string) {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }

  try {
    await cancel({
      userId: user.id,
      subscriptionId,
    });

    return { success: true };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw new Error("Failed to cancel subscription");
  }
}
