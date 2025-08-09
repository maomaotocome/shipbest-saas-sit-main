"use server";
import { Prisma } from "@/db/generated/prisma";
import { isAdmin } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { paginatePrismaQuery } from "@/lib/utils";
import { ModelDelegate, PaginatedResponse, PaginationParams } from "@/types/pagination";

// Define the specific type inferred by Prisma GetPayload
type PrismaPayload = Prisma.InvoiceGetPayload<{
  include: {
    billingUser: {
      include: {
        user: {
          select: { email: true; name: true };
        };
      };
    };
    purchase: {
      select: {
        id: true;
        planPeriod: {
          include: {
            plan: {
              include: {
                translations: {
                  select: { nickname: true; locale: true };
                };
              };
            };
          };
        };
      };
    };
    subscriptionPeriod: {
      select: {
        id: true;
        periodNumber: true;
        subscription: {
          select: {
            id: true;
            planPeriod: {
              include: {
                plan: {
                  include: {
                    translations: {
                      select: { nickname: true; locale: true };
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
  };
}>;

// Extract the non-nullable object types from the inferred payload
export type PurchaseObject = NonNullable<PrismaPayload["purchase"]>;
export type SubscriptionPeriodObject = NonNullable<PrismaPayload["subscriptionPeriod"]>;

// Define the final payload type we want to return
export type FinalInvoicePayload = Omit<PrismaPayload, "purchase" | "subscriptionPeriod"> & {
  purchase: PurchaseObject | null;
  subscriptionPeriod: SubscriptionPeriodObject | null;
};

// Update parameters type to extend PaginationParams
interface GetInvoicesParams extends PaginationParams {
  email?: string;
  startDate?: string;
  endDate?: string;
}

// The main Server Action function - updated signature
export async function getInvoicesAction(
  params: GetInvoicesParams
): Promise<PaginatedResponse<FinalInvoicePayload>> {
  // 1. Check for admin privileges
  if (!(await isAdmin())) {
    throw new Error("Unauthorized: Admin privileges required.");
  }

  // 2. Sanitize and validate parameters
  const { page, pageSize, email: rawEmail, startDate: startDateStr, endDate: endDateStr } = params;
  const email = rawEmail?.trim() || undefined;

  let startDate: Date | undefined = undefined;
  if (startDateStr) {
    startDate = new Date(startDateStr);
    if (isNaN(startDate.getTime())) {
      console.warn("Invalid start date format provided:", startDateStr);
      startDate = undefined;
    }
  }

  let endDate: Date | undefined = undefined;
  if (endDateStr) {
    endDate = new Date(endDateStr);
    if (isNaN(endDate.getTime())) {
      console.warn("Invalid end date format provided:", endDateStr);
      endDate = undefined;
    } else {
      endDate.setHours(23, 59, 59, 999);
    }
  }

  // 3. Build Prisma where clause (keep existing logic)
  const where: Prisma.InvoiceWhereInput = {};
  if (email) {
    where.billingUser = {
      user: {
        email: {
          contains: email,
          mode: "insensitive",
        },
      },
    };
  }
  if (startDate || endDate) {
    where.issueDate = {};
    if (startDate) {
      where.issueDate.gte = startDate;
    }
    if (endDate) {
      where.issueDate.lte = endDate;
    }
  }

  // 4. Define Prisma arguments (excluding skip/take)
  const prismaArgs: Omit<Prisma.InvoiceFindManyArgs, "skip" | "take"> = {
    where,
    orderBy: {
      issueDate: "desc",
    },
    include: {
      billingUser: {
        include: {
          user: {
            select: { email: true, name: true },
          },
        },
      },
      purchase: {
        select: {
          id: true,
          planPeriod: {
            include: {
              plan: {
                include: {
                  translations: {
                    select: { nickname: true, locale: true },
                  },
                },
              },
            },
          },
        },
      },
      subscriptionPeriod: {
        select: {
          id: true,
          periodNumber: true,
          subscription: {
            select: {
              id: true,
              planPeriod: {
                include: {
                  plan: {
                    include: {
                      translations: {
                        select: { nickname: true, locale: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  // 5. Perform paginated query using the helper
  try {
    const paginatedResult = await paginatePrismaQuery<
      PrismaPayload, // Use the raw Prisma type here
      Prisma.InvoiceCountArgs,
      Prisma.InvoiceFindManyArgs
    >(
      prisma.invoice as unknown as ModelDelegate<
        Prisma.InvoiceCountArgs,
        Prisma.InvoiceFindManyArgs,
        PrismaPayload
      >,
      { page, pageSize }, // Pass pagination params
      prismaArgs // Pass Prisma query args
    );

    // 6. Transform the items from the paginated result
    const transformedItems: FinalInvoicePayload[] = paginatedResult.items.map((invoice) => {
      const purchaseAsUnknown = invoice.purchase as unknown;
      const finalPurchase = Array.isArray(purchaseAsUnknown)
        ? ((purchaseAsUnknown[0] as PurchaseObject) ?? null)
        : (invoice.purchase as PurchaseObject | null);

      const subscriptionPeriodAsUnknown = invoice.subscriptionPeriod as unknown;
      const finalSubscriptionPeriod = Array.isArray(subscriptionPeriodAsUnknown)
        ? ((subscriptionPeriodAsUnknown[0] as SubscriptionPeriodObject) ?? null)
        : (invoice.subscriptionPeriod as SubscriptionPeriodObject | null);

      return {
        ...(invoice as Omit<PrismaPayload, "purchase" | "subscriptionPeriod">),
        purchase: finalPurchase,
        subscriptionPeriod: finalSubscriptionPeriod,
      };
    });

    // 7. Return the final PaginatedResponse with transformed items
    return {
      ...paginatedResult,
      items: transformedItems, // Overwrite items with transformed data
    };
  } catch (error) {
    console.error("Error fetching detailed invoices:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma Error Code:", error.code);
      console.error("Prisma Error Meta:", error.meta);
    }
    throw new Error("Failed to fetch detailed invoices.");
  }
}
