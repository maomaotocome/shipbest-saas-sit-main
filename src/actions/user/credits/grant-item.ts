"use server";

import { getOrCreateBillingUserByUserId } from "@/db/billing/users";
import { getUser, isAuthenticated } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";

export async function getGrantItem(id: string) {
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

  const grant = await prisma.creditGrant.findFirst({
    where: {
      id,
      billingUserId: billingUser.id,
    },
    include: {
      transactionDetails: {
        include: {
          transaction: true,
        },
      },
    },
  });

  if (!grant) {
    throw new Error("Grant not found");
  }

  return grant;
}
