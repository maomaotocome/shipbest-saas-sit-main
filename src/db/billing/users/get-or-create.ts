import { BillingUser, Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

async function handlerGetOrCreateBillingUserByUserId(
  params: { userId: string },
  tx: Prisma.TransactionClient
): Promise<BillingUser> {
  const { userId } = params;
  return tx.billingUser.upsert({
    where: {
      userId,
    },
    update: {},
    create: {
      userId,
    },
  });
}

export const getOrCreateBillingUserByUserId = createTransactionRunner(
  handlerGetOrCreateBillingUserByUserId,
  "get or create BillingUser"
);
