import {
  CreditGrant,
  CreditTransactionStatus,
  CreditTransactionType,
  Prisma,
} from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";
import { getAvailableCredits } from "../available";

const updateCreditGrant = (
  creditGrant: CreditGrant,
  remainingCredit: number
): {
  updatedCreditGrant: CreditGrant;
  newRemainingCredit: number;
  actualDeductedAmount: number;
} => {
  const isAllCreditGrantReserved = remainingCredit > creditGrant.availableAmount;
  const actualDeductedAmount = isAllCreditGrantReserved
    ? creditGrant.availableAmount
    : remainingCredit;

  const reservedAmount = creditGrant.reservedAmount + actualDeductedAmount;
  const availableAmount = creditGrant.availableAmount - actualDeductedAmount;

  return {
    updatedCreditGrant: {
      ...creditGrant,
      reservedAmount,
      availableAmount,
    },
    newRemainingCredit: remainingCredit - actualDeductedAmount,
    actualDeductedAmount,
  };
};

const handleReverseCredit = async (
  {
    credit,
    billingUserId,
    teamId,
    taskId,
  }: { credit: number; billingUserId: string; teamId?: string; taskId?: string },
  tx: Prisma.TransactionClient
) => {
  const availableCredits = await getAvailableCredits(
    {
      billingUserId,
      teamId,
    },
    tx
  );

  let remainingCredit = credit;
  const grantUpdates: { id: string; data: { reservedAmount: number; availableAmount: number } }[] =
    [];
  const transactionDetails: {
    grantId: string;
    amount: number;
  }[] = [];

  // First process grants with expiration time (FIFO strategy)
  const expiringGrants = availableCredits.filter((creditGrant) => creditGrant.validUntil !== null);
  for (const creditGrant of expiringGrants) {
    if (remainingCredit <= 0) break;

    const { updatedCreditGrant, newRemainingCredit, actualDeductedAmount } = updateCreditGrant(
      creditGrant,
      remainingCredit
    );

    grantUpdates.push({
      id: creditGrant.id,
      data: {
        reservedAmount: updatedCreditGrant.reservedAmount,
        availableAmount: updatedCreditGrant.availableAmount,
      },
    });

    transactionDetails.push({
      grantId: creditGrant.id,
      amount: actualDeductedAmount,
    });

    remainingCredit = newRemainingCredit;
  }

  // If there are still remaining credits to deduct, process grants that never expire
  if (remainingCredit > 0) {
    const permanentGrants = availableCredits.filter(
      (creditGrant) => creditGrant.validUntil === null
    );
    for (const creditGrant of permanentGrants) {
      if (remainingCredit <= 0) break;

      const { updatedCreditGrant, newRemainingCredit, actualDeductedAmount } = updateCreditGrant(
        creditGrant,
        remainingCredit
      );

      grantUpdates.push({
        id: creditGrant.id,
        data: {
          reservedAmount: updatedCreditGrant.reservedAmount,
          availableAmount: updatedCreditGrant.availableAmount,
        },
      });

      transactionDetails.push({
        grantId: creditGrant.id,
        amount: actualDeductedAmount,
      });

      remainingCredit = newRemainingCredit;
    }
  }

  // If there are still remaining credits to deduct, throw an error
  if (remainingCredit > 0) {
    throw new Error(`Insufficient credits, still need ${remainingCredit} credits`);
  }

  // Batch update credit grants
  for (const update of grantUpdates) {
    // Validate data consistency after update
    const currentGrant = await tx.creditGrant.findUnique({
      where: { id: update.id },
    });

    if (!currentGrant) {
      throw new Error(`Credit grant ${update.id} not found`);
    }

    // Validate mathematical relationships
    if (update.data.availableAmount !== currentGrant.remainingAmount - update.data.reservedAmount) {
      throw new Error(
        `Grant ${update.id}: availableAmount must equal remainingAmount - reservedAmount`
      );
    }

    await tx.creditGrant.update({
      where: { id: update.id },
      data: update.data,
    });
  }

  // Create transaction record
  const creditTransaction = await tx.creditTransaction.create({
    data: {
      totalAmount: credit,
      expireAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
      type: CreditTransactionType.RESERVE,
      status: CreditTransactionStatus.PENDING,
      ...(taskId ? { metadata: { taskId } } : {}),
    },
  });

  // Create transaction detail record - balanceAfter records remainingAmount for consistency
  for (const detail of transactionDetails) {
    // Get the updated grant state
    const updatedGrant = await tx.creditGrant.findUnique({
      where: { id: detail.grantId },
    });

    if (!updatedGrant) {
      throw new Error(`Credit grant ${detail.grantId} not found`);
    }

    await tx.creditTransactionDetail.create({
      data: {
        transactionId: creditTransaction.id,
        grantId: detail.grantId,
        amount: detail.amount,
        balanceAfter: updatedGrant.remainingAmount, // Record remainingAmount for consistency
      },
    });
  }

  return creditTransaction;
};

export const reverseCredit = createTransactionRunner(handleReverseCredit);
