import { createCreditGrant, createCreditTransaction } from "@/db/billing/credits";
import {
  CreditSource,
  CreditTransactionStatus,
  CreditTransactionType,
  Prisma,
} from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

interface GrantCreditsParams {
  billingUserId: string;
  amount: number;
  validFrom: Date;
  validUntil?: Date;
  source: CreditSource;
  subscriptionPeriodId?: string;
  purchaseId?: string;
  description: string;
}

const grantCreditsHandler = async (
  params: GrantCreditsParams,
  tx: Prisma.TransactionClient
): Promise<void> => {
  const {
    billingUserId,
    amount,
    validFrom,
    validUntil,
    source,
    subscriptionPeriodId,
    purchaseId,
    description,
  } = params;

  // Validate input parameters
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  // Use the existing createCreditGrant function, passing tx to reuse the transaction
  const creditGrant = await createCreditGrant(
    {
      billingUser: {
        connect: {
          id: billingUserId,
        },
      },
      amount,
      remainingAmount: amount,
      availableAmount: amount,
      reservedAmount: 0, // Explicitly set to 0
      usedAmount: 0, // Explicitly set to 0
      validFrom,
      validUntil,
      source,
      ...(subscriptionPeriodId && {
        subscriptionPeriod: {
          connect: {
            id: subscriptionPeriodId,
          },
        },
      }),
      ...(purchaseId && {
        purchase: {
          connect: {
            id: purchaseId,
          },
        },
      }),
    },
    tx
  );

  // Use the existing createCreditTransaction function, passing tx to reuse the transaction
  await createCreditTransaction(
    {
      description,
      totalAmount: amount,
      type: CreditTransactionType.GRANT,
      status: CreditTransactionStatus.GRANTED,
      confirmedAt: new Date(), // GRANT operation is confirmed immediately
      details: {
        create: {
          amount,
          balanceAfter: amount, // remainingAmount after grant
          grant: {
            connect: {
              id: creditGrant.id,
            },
          },
        },
      },
    },
    tx
  );

  // Validate data consistency after creation
  const verifyGrant = await tx.creditGrant.findUnique({
    where: { id: creditGrant.id },
  });

  if (!verifyGrant) {
    throw new Error("Failed to create credit grant");
  }

  // Validate mathematical relationships
  if (verifyGrant.remainingAmount + verifyGrant.usedAmount !== verifyGrant.amount) {
    throw new Error("Grant creation failed: remainingAmount + usedAmount must equal amount");
  }

  if (verifyGrant.availableAmount !== verifyGrant.remainingAmount - verifyGrant.reservedAmount) {
    throw new Error(
      "Grant creation failed: availableAmount must equal remainingAmount - reservedAmount"
    );
  }
};

export const grantCredits = createTransactionRunner(grantCreditsHandler, "grantCredits");
