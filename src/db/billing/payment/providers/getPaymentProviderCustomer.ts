import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";
async function handleGetPaymentProviderCustomer(
  { billingUserId, providerAccountId }: { billingUserId: string; providerAccountId: string },
  tx: Prisma.TransactionClient
) {
  try {
    return await tx.userPaymentProviderCustomer.findFirst({
      where: {
        billingUserId,
        providerAccountId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        providerAccount: true,
        billingUser: true,
      },
    });
  } catch (error) {
    console.error("Error fetching payment provider customer:", error);
    throw error;
  }
}

export const getPaymentProviderCustomer = createTransactionRunner(
  handleGetPaymentProviderCustomer,
  "get payment provider customer"
);
