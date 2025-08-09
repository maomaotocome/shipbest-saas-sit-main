import { CreditTransactionStatus, CreditTransactionType, Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

const handleConfirmCreditReverse = async (
  { creditTransactionId }: { creditTransactionId: string },
  tx: Prisma.TransactionClient
) => {
  const creditTransaction = await tx.creditTransaction.findUnique({
    where: { id: creditTransactionId },
    include: {
      details: true,
    },
  });

  if (!creditTransaction) {
    throw new Error("Credit transaction not found");
  }

  if (creditTransaction.status !== CreditTransactionStatus.PENDING) {
    throw new Error("Credit transaction is not pending");
  }

  if (creditTransaction.type !== CreditTransactionType.RESERVE) {
    throw new Error("Credit transaction is not a reserve transaction");
  }

  // Update credit grants - confirm deduction, convert reserved credits to used
  for (const detail of creditTransaction.details) {
    // First get the current grant state to ensure data consistency
    const currentGrant = await tx.creditGrant.findUnique({
      where: { id: detail.grantId },
    });

    if (!currentGrant) {
      throw new Error(`Credit grant ${detail.grantId} not found`);
    }

    // Calculate new field values to ensure mathematical relationships are correct
    const newRemainingAmount = currentGrant.remainingAmount - detail.amount;
    const newReservedAmount = currentGrant.reservedAmount - detail.amount;
    const newUsedAmount = currentGrant.usedAmount + detail.amount;
    const newAvailableAmount = newRemainingAmount - newReservedAmount;

    // Validate data consistency
    if (newRemainingAmount < 0) {
      throw new Error(`Grant ${detail.grantId}: remainingAmount cannot be negative`);
    }
    if (newReservedAmount < 0) {
      throw new Error(`Grant ${detail.grantId}: reservedAmount cannot be negative`);
    }
    if (newAvailableAmount < 0) {
      throw new Error(`Grant ${detail.grantId}: availableAmount cannot be negative`);
    }

    // Validate mathematical relationships
    if (newRemainingAmount + newUsedAmount !== currentGrant.amount) {
      throw new Error(`Grant ${detail.grantId}: remainingAmount + usedAmount must equal amount`);
    }

    await tx.creditGrant.update({
      where: { id: detail.grantId },
      data: {
        remainingAmount: newRemainingAmount,
        reservedAmount: newReservedAmount,
        usedAmount: newUsedAmount,
        availableAmount: newAvailableAmount,
      },
    });
  }

  // Update credit transaction status to confirmed
  await tx.creditTransaction.update({
    where: { id: creditTransactionId },
    data: {
      status: CreditTransactionStatus.CONFIRMED,
      type: CreditTransactionType.DEDUCT,
      confirmedAt: new Date(),
      expireAt: null,
    },
  });
};

export const confirmCreditReverse = createTransactionRunner(handleConfirmCreditReverse);
