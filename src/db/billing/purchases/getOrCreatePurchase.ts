import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

const handleGetOrCreatePurchase = async (
  purchase: Prisma.PurchaseCreateInput,
  tx: Prisma.TransactionClient
) => {
  return tx.purchase.upsert({
    where: {
      providerOrderId: purchase.providerOrderId,
    },
    create: purchase,
    update: purchase,
  });
};

export const getOrCreatePurchase = createTransactionRunner(
  handleGetOrCreatePurchase,
  "getOrCreatePurchase"
);
