"use server";

import { getUser, isAuthenticated } from "@/lib/auth/utils";
import { refund } from "@/services/billing/payment/refund";
export async function refundSubscriptionPeriod(subscriptionId: string, periodId: string) {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }

  try {
    const result = await refund({
      userId: user.id,
      subscriptionInfo: { id: subscriptionId, periodId },
    });
    return result;
  } catch (error) {
    console.error("Error processing refund:", error);
    throw new Error("Failed to process refund");
  }
}
