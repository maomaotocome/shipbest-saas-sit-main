import { CreditTransactionStatus, CreditTransactionType, Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

const handleCancelCreditReverse = async (
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

  // Update credit grants - release reserved credits
  for (const detail of creditTransaction.details) {
    // First get the current grant state to ensure data consistency
    const currentGrant = await tx.creditGrant.findUnique({
      where: { id: detail.grantId },
    });

    if (!currentGrant) {
      throw new Error(`Credit grant ${detail.grantId} not found`);
    }

    // Calculate new field values to ensure mathematical relationships are correct
    const newReservedAmount = currentGrant.reservedAmount - detail.amount;
    const newAvailableAmount = currentGrant.remainingAmount - newReservedAmount;

    // Validate data consistency
    if (newReservedAmount < 0) {
      throw new Error(`Grant ${detail.grantId}: reservedAmount cannot be negative`);
    }
    if (newAvailableAmount < 0) {
      throw new Error(`Grant ${detail.grantId}: availableAmount cannot be negative`);
    }

    // Validate mathematical relationships
    if (newAvailableAmount !== currentGrant.remainingAmount - newReservedAmount) {
      throw new Error(
        `Grant ${detail.grantId}: availableAmount must equal remainingAmount - reservedAmount`
      );
    }

    await tx.creditGrant.update({
      where: { id: detail.grantId },
      data: {
        reservedAmount: newReservedAmount,
        availableAmount: newAvailableAmount,
      },
    });
  }

  // Update credit transaction status to cancelled
  await tx.creditTransaction.update({
    where: { id: creditTransactionId },
    data: {
      status: CreditTransactionStatus.CANCELLED,
      cancelledAt: new Date(),
      expireAt: null,
    },
  });
};

export const cancelCreditReverse = createTransactionRunner(handleCancelCreditReverse);
