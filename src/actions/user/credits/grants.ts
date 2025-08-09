"use server";

import { getOrCreateBillingUserByUserId } from "@/db/billing/users";
import { CreditGrant, Prisma } from "@/db/generated/prisma";
import { getUser, isAuthenticated } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { paginatePrismaQuery } from "@/lib/utils";
import { ModelDelegate, PaginatedResponse, PaginationParams } from "@/types/pagination";

interface CreditGrantWithDetails extends CreditGrant {
  transactionDetails: {
    transaction: { id: string; createdAt: Date };
    amount: number;
  }[];
}

export async function getGrants(
  params: PaginationParams
): Promise<PaginatedResponse<CreditGrantWithDetails>> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }

  const billingUser = await getOrCreateBillingUserByUserId({
    userId: user.id,
  });

  const prismaArgs: Omit<Prisma.CreditGrantFindManyArgs, "skip" | "take"> = {
    where: {
      billingUserId: billingUser.id,
    },
    include: {
      transactionDetails: {
        include: {
          transaction: {
            select: {
              id: true,
              createdAt: true,
            },
          },
        },
      },
    },
    orderBy: {
      validFrom: "asc",
    },
  };

  return paginatePrismaQuery<
    CreditGrantWithDetails,
    Prisma.CreditGrantCountArgs,
    Prisma.CreditGrantFindManyArgs
  >(
    prisma.creditGrant as unknown as ModelDelegate<
      Prisma.CreditGrantCountArgs,
      Prisma.CreditGrantFindManyArgs,
      CreditGrantWithDetails
    >,
    params,
    prismaArgs
  );
}
