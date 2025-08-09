import { createTransactionRunner, prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client/extension";

interface FindOrCreateUserProviderCustomerParams {
  accountId: string;
  billingUserId: string;
  providerCustomerId: string;
}

export async function handleFindOrCreateUserProviderCustomer(
  { accountId, billingUserId, providerCustomerId }: FindOrCreateUserProviderCustomerParams,
  tx: Prisma.TransactionClient
) {
  const existingCustomer = await tx.userPaymentProviderCustomer.findUnique({
    where: {
      BillingUserId_providerAccountId_providerCustomerId: {
        BillingUserId: billingUserId,
        providerAccountId: accountId,
        providerCustomerId: providerCustomerId,
      },
    },
  });

  // 3. If already exists, return directly
  if (existingCustomer) {
    return existingCustomer;
  }

  // 4. If not exists, create a new UserPaymentProviderCustomer
  return tx.userPaymentProviderCustomer.create({
    data: {
      BillingUserId: billingUserId,
      providerAccountId: accountId,
      providerCustomerId: providerCustomerId,
      isDefault: !(await prisma.userPaymentProviderCustomer.findFirst({
        where: { billingUserId },
      })),
    },
  });
}

export const findOrCreateUserProviderCustomer = createTransactionRunner(
  handleFindOrCreateUserProviderCustomer,
  "Find or create BillingUser"
);
