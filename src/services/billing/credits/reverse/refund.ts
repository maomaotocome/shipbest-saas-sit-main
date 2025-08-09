import {
  CreditGrant,
  CreditTransactionStatus,
  CreditTransactionType,
  Prisma,
} from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

const updateCreditGrantForRefund = (
  creditGrant: CreditGrant,
  refundAmount: number
): {
  updatedCreditGrant: CreditGrant;
  actualRefundAmount: number;
} => {
  // Calculate the maximum amount that can be refunded to this grant
  // Cannot exceed the original amount, nor can it exceed the used amount
  const maxRefundable = creditGrant.usedAmount;
  const actualRefundAmount = Math.min(refundAmount, maxRefundable);

  const newUsedAmount = creditGrant.usedAmount - actualRefundAmount;
  const newRemainingAmount = creditGrant.remainingAmount + actualRefundAmount;
  const newAvailableAmount = newRemainingAmount - creditGrant.reservedAmount;

  return {
    updatedCreditGrant: {
      ...creditGrant,
      usedAmount: newUsedAmount,
      remainingAmount: newRemainingAmount,
      availableAmount: newAvailableAmount,
    },
    actualRefundAmount,
  };
};

/**
 * Refund credits to the original transaction record
 * @param originalTransactionId Original transaction ID
 * @param refundAmount Amount of credits to refund
 * @param description Refund description (optional)
 * @returns Updated original transaction record, including new refund transaction details
 */
const handleRefundCredit = async (
  {
    originalTransactionId,
    refundAmount,
    description,
  }: {
    originalTransactionId: string;
    refundAmount: number;
    description?: string;
  },
  tx: Prisma.TransactionClient
) => {
  // Get the original transaction record
  const originalTransaction = await tx.creditTransaction.findUnique({
    where: { id: originalTransactionId },
    include: {
      details: {
        include: {
          grant: true,
        },
      },
    },
  });

  if (!originalTransaction) {
    throw new Error("Original transaction record not found");
  }

  if (originalTransaction.type !== CreditTransactionType.DEDUCT) {
    throw new Error("Can only refund confirmed deduction transactions");
  }

  if (originalTransaction.status !== CreditTransactionStatus.CONFIRMED) {
    throw new Error("Can only refund confirmed transactions");
  }

  if (refundAmount <= 0) {
    throw new Error("Refund amount must be greater than 0");
  }

  if (refundAmount > originalTransaction.totalAmount) {
    throw new Error("Refund amount cannot exceed the original transaction amount");
  }

  // Get all grants involved in the original transaction, sorted in user-friendly order
  // Prioritize refunding to grants with later expiration times, giving users more time to use these credits
  const grantsToRefund = originalTransaction.details
    .map((detail) => ({
      ...detail,
      grant: detail.grant,
    }))
    .sort((a, b) => {
      // Never-expiring grants take priority over those with expiration times
      if (!a.grant.validUntil && b.grant.validUntil) {
        return -1;
      }
      if (a.grant.validUntil && !b.grant.validUntil) {
        return 1;
      }
      // For grants with expiration times, sort by expiration time, with later expiration times taking priority
      if (a.grant.validUntil && b.grant.validUntil) {
        return b.grant.validUntil.getTime() - a.grant.validUntil.getTime();
      }
      // For never-expiring grants, sort by creation time in descending order (newer ones take priority)
      return b.grant.createdAt.getTime() - a.grant.createdAt.getTime();
    });

  let remainingRefund = refundAmount;
  const grantUpdates: {
    id: string;
    data: {
      usedAmount: number;
      remainingAmount: number;
      availableAmount: number;
    };
  }[] = [];
  const transactionDetails: {
    grantId: string;
    amount: number;
    balanceAfter: number;
  }[] = [];

  // Process refund for each grant in order
  for (const grantDetail of grantsToRefund) {
    if (remainingRefund <= 0) break;

    // Get the latest grant state
    const currentGrant = await tx.creditGrant.findUnique({
      where: { id: grantDetail.grantId },
    });

    if (!currentGrant) {
      throw new Error(`Credit grant ${grantDetail.grantId} not found`);
    }

    const { updatedCreditGrant, actualRefundAmount } = updateCreditGrantForRefund(
      currentGrant,
      remainingRefund
    );

    if (actualRefundAmount > 0) {
      grantUpdates.push({
        id: currentGrant.id,
        data: {
          usedAmount: updatedCreditGrant.usedAmount,
          remainingAmount: updatedCreditGrant.remainingAmount,
          availableAmount: updatedCreditGrant.availableAmount,
        },
      });

      transactionDetails.push({
        grantId: currentGrant.id,
        amount: actualRefundAmount,
        balanceAfter: updatedCreditGrant.remainingAmount,
      });

      remainingRefund -= actualRefundAmount;
    }
  }

  // If there is still unrefunded amount, it indicates a problem with the original transaction data
  if (remainingRefund > 0) {
    throw new Error(
      `Unable to fully refund credits, still have ${remainingRefund} credits that cannot be refunded`
    );
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
    if (update.data.remainingAmount + update.data.usedAmount !== currentGrant.amount) {
      throw new Error(`Grant ${update.id}: remainingAmount + usedAmount must equal amount`);
    }

    if (update.data.availableAmount !== update.data.remainingAmount - currentGrant.reservedAmount) {
      throw new Error(
        `Grant ${update.id}: availableAmount must equal remainingAmount - reservedAmount`
      );
    }

    await tx.creditGrant.update({
      where: { id: update.id },
      data: update.data,
    });
  }

  // Update the refund amount in the original transaction record
  const currentRefundAmount = originalTransaction.refundAmount || 0;
  const newRefundAmount = currentRefundAmount + refundAmount;

  // Process metadata to ensure type safety
  const existingMetadata = (originalTransaction.metadata as Record<string, unknown>) || {};
  const existingRefundHistory =
    (existingMetadata.refundHistory as Array<{
      amount: number;
      timestamp: string;
      description: string;
    }>) || [];

  await tx.creditTransaction.update({
    where: { id: originalTransactionId },
    data: {
      refundAmount: newRefundAmount,
      metadata: {
        ...existingMetadata,
        refundHistory: [
          ...existingRefundHistory,
          {
            amount: refundAmount,
            timestamp: new Date().toISOString(),
            description: description || `Refund credits ${refundAmount}`,
          },
        ],
      },
    },
  });

  // Create refund transaction detail records under the original transaction record
  for (const detail of transactionDetails) {
    await tx.creditTransactionDetail.create({
      data: {
        transactionId: originalTransactionId,
        grantId: detail.grantId,
        amount: -detail.amount, // Use negative number to indicate refund
        balanceAfter: detail.balanceAfter,
      },
    });
  }

  // Return the updated transaction record
  const updatedTransaction = await tx.creditTransaction.findUnique({
    where: { id: originalTransactionId },
    include: {
      details: {
        include: {
          grant: true,
        },
      },
    },
  });

  if (originalTransaction.metadata) {
    await tx.task.update({
      where: { id: (originalTransaction.metadata as { taskId: string }).taskId },
      data: {
        actualCredits: originalTransaction.totalAmount - newRefundAmount,
      },
    });
  }

  return updatedTransaction;
};

export const refundCredit = createTransactionRunner(handleRefundCredit);
