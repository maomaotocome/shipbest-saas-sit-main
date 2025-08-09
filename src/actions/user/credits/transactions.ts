"use server";

import { getOrCreateBillingUserByUserId } from "@/db/billing/users";
import { CreditGrant, CreditTransaction, Prisma } from "@/db/generated/prisma";
import { getUser, isAuthenticated } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { paginatePrismaQuery } from "@/lib/utils";
import { ModelDelegate, PaginatedResponse, PaginationParams } from "@/types/pagination";

// Define the detailed transaction type
interface CreditTransactionWithDetails extends CreditTransaction {
  details: {
    grant: CreditGrant;
    amount: number;
  }[];
}

// Define the parameters for the action, extending PaginationParams
interface GetTransactionsParams extends PaginationParams {
  from?: string; // Make from optional
  to?: string; // Make to optional
}

export async function getTransactions(
  params: GetTransactionsParams
): Promise<PaginatedResponse<CreditTransactionWithDetails>> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const { from, to, page, pageSize } = params;

  let fromDate: Date | undefined;
  let toDate: Date | undefined;

  // Validate and parse dates only if provided
  if (from) {
    fromDate = new Date(from);
    if (isNaN(fromDate.getTime())) {
      throw new Error("Invalid 'from' date format");
    }
  }
  if (to) {
    toDate = new Date(to);
    if (isNaN(toDate.getTime())) {
      throw new Error("Invalid 'to' date format");
    }
  }

  // Validate date range only if both dates are provided
  if (fromDate && toDate) {
    // Optional: Keep date range validation if desired
    // const maxRange = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
    // if (toDate.getTime() - fromDate.getTime() > maxRange) {
    //   throw new Error("Date range cannot exceed 90 days");
    // }
    if (fromDate > toDate) {
      throw new Error("'from' date cannot be after 'to' date");
    }
  }

  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }

  const billingUser = await getOrCreateBillingUserByUserId({
    userId: user.id,
  });

  // Build the where clause conditionally
  const whereClause: Prisma.CreditTransactionWhereInput = {
    details: {
      some: {
        grant: {
          billingUserId: billingUser.id,
        },
      },
    },
  };

  // Add date filtering only if dates are provided
  if (fromDate || toDate) {
    whereClause.createdAt = {};
    if (fromDate) {
      whereClause.createdAt.gte = fromDate;
    }
    if (toDate) {
      // Adjust to include the whole 'to' day if needed, e.g., set hours to 23:59:59.999
      // Or ensure the frontend sends the 'to' date as the start of the next day
      whereClause.createdAt.lte = toDate;
    }
  }

  const prismaArgs: Omit<Prisma.CreditTransactionFindManyArgs, "skip" | "take"> = {
    where: whereClause, // Use the conditionally built where clause
    include: {
      details: {
        include: {
          grant: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  };

  // Call the utility function, providing explicit types
  return paginatePrismaQuery<
    CreditTransactionWithDetails, // The desired item type
    Prisma.CreditTransactionCountArgs, // Type for count arguments
    Prisma.CreditTransactionFindManyArgs // Type for findMany arguments
  >(
    prisma.creditTransaction as unknown as ModelDelegate<
      Prisma.CreditTransactionCountArgs,
      Prisma.CreditTransactionFindManyArgs,
      CreditTransactionWithDetails
    >, // Cast the model delegate
    { page, pageSize }, // Pagination params
    prismaArgs // The query arguments
  );
}
