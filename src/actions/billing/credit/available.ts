"use server";

import { getOrCreateBillingUserByUserId } from "@/db/billing/users";
import { auth } from "@/lib/auth";
import { getAvailableCredits } from "@/services/billing/credits/available";

export async function getUserAvailableCredits() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const userId = session.user.id;
  const billingUser = await getOrCreateBillingUserByUserId({ userId });

  if (!billingUser) {
    return null;
  }

  try {
    const creditGrants = await getAvailableCredits({
      billingUserId: billingUser.id,
    });

    const totalCredits = creditGrants.reduce((sum, grant) => sum + grant.availableAmount, 0);

    return {
      totalCredits,
      grantsCount: creditGrants.length,
    };
  } catch (error) {
    console.error("Error fetching user credits:", error);
    return null;
  }
}
