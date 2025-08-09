"use server";

import { getOrCreateBillingUserByUserId } from "@/db/billing/users";
import { getUser, isAuthenticated } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";

export async function getCreditSummary() {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }

  const billingUser = await getOrCreateBillingUserByUserId({
    userId: user.id,
  });

  const now = new Date();

  const [availableCredits, pendingCredits] = await Promise.all([
    prisma.creditGrant.aggregate({
      where: {
        billingUserId: billingUser.id,
        validFrom: { lte: now },
        OR: [{ validUntil: { gt: now } }, { validUntil: { equals: null } }],
        remainingAmount: { gt: 0 },
      },
      _sum: {
        availableAmount: true,
      },
    }),
    prisma.creditGrant.aggregate({
      where: {
        billingUserId: billingUser.id,
        validFrom: { gt: now },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  return {
    availableAmount: availableCredits._sum.availableAmount || 0,
    pendingAmount: pendingCredits._sum.amount || 0,
  };
}
