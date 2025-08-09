import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

const handleGetPurchase = async (
  data: Prisma.PurchaseFindUniqueArgs,
  tx: Prisma.TransactionClient
) => {
  return await tx.purchase.findUnique(data);
};

export const getPurchase = createTransactionRunner(handleGetPurchase, "getPurchase");
