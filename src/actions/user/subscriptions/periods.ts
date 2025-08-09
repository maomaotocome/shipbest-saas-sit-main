"use server";

import { getSubscriptionPeriods as getPeriods } from "@/db/billing/subscriptions/getSubscriptionPeriods";
import { getUser, isAuthenticated } from "@/lib/auth/utils";

export async function getSubscriptionPeriods(subscriptionId: string) {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }

  const result = await getPeriods({
    where: {
      subscriptionId,
    },
  });
  return result;
}
