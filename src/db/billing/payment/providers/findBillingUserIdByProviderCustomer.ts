import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

type FindUserBillingIdByProviderCustomerParams = {
  providerAccountId: string;
  providerCustomerId: string;
};
export async function handleFindUserBillingIdByProviderCustomer(
  params: FindUserBillingIdByProviderCustomerParams,
  tx: Prisma.TransactionClient
): Promise<string | null> {
  const { providerAccountId, providerCustomerId } = params;
  const customerRecord = await tx.userPaymentProviderCustomer.findFirst({
    where: {
      providerAccountId,
      providerCustomerId,
    },
    select: {
      billingUserId: true,
    },
  });

  return customerRecord?.billingUserId ?? null;
}

export const findUserBillingIdByProviderCustomer = createTransactionRunner(
  handleFindUserBillingIdByProviderCustomer,
  "get or create BillingUser"
);
