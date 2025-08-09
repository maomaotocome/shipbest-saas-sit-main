"use server";

import { getOrCreateBillingUserByUserId } from "@/db/billing/users";
import { getUser, isAuthenticated } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";

export async function getTransactionItem(id: string) {
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

  const transaction = await prisma.creditTransaction.findFirst({
    where: {
      id,
      details: {
        some: {
          grant: {
            billingUserId: billingUser.id,
          },
        },
      },
    },
    include: {
      details: {
        include: {
          grant: true,
        },
      },
    },
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  return transaction;
}
