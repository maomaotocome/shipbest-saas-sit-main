import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";
export const handleGetAvailableCreditGrants = async (
  {
    billingUserId,
    teamId,
  }: {
    billingUserId?: string;
    teamId?: string;
  },
  tx: Prisma.TransactionClient
) => {
  if (!billingUserId && !teamId) {
    throw new Error("Either billingUserId or teamId must be provided");
  }

  const creditGrants = await tx.creditGrant.findMany({
    orderBy: {
      validUntil: "asc",
    },
    where: {
      AND: [
        {
          availableAmount: {
            gt: 0,
          },
        },
        {
          OR: [
            {
              billingUserId,
            },
            ...(teamId
              ? [
                  {
                    subscriptionPeriod: {
                      subscription: {
                        teamId,
                      },
                    },
                  },
                ]
              : []),
            ...(teamId
              ? [
                  {
                    purchase: {
                      teamId,
                    },
                  },
                ]
              : []),
          ],
        },
        {
          OR: [
            {
              validUntil: {
                gte: new Date(),
              },
            },
            {
              validUntil: null,
            },
          ],
        },
        {
          validFrom: {
            lte: new Date(),
          },
        },
      ],
    },
  });

  return creditGrants;
};

export const getAvailableCredits = createTransactionRunner(handleGetAvailableCreditGrants);
