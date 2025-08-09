"use server";

import { Prisma, PurchaseStatus } from "@/db/generated/prisma";
import { isAdmin } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { paginatePrismaQuery } from "@/lib/utils";
import { ModelDelegate, PaginatedResponse, PaginationParams } from "@/types/pagination";

type PurchaseListItem = Prisma.PurchaseGetPayload<{
  include: {
    billingUser: {
      include: {
        user: {
          select: {
            email: true;
            name: true;
          };
        };
      };
    };
    planPeriod: {
      include: {
        plan: {
          include: {
            translations: true;
          };
        };
      };
    };
  };
}>;

export async function getPurchases(
  params: PaginationParams & {
    status?: string;
    sort?: string;
    order?: "asc" | "desc";
  }
): Promise<PaginatedResponse<PurchaseListItem>> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const { page, pageSize, status = "all", sort = "purchaseDate", order = "desc" } = params;

    const where: Prisma.PurchaseWhereInput = {
      status: status === "all" ? undefined : (status as PurchaseStatus),
    };

    const orderBy: Prisma.PurchaseOrderByWithRelationInput = {
      [sort]: order,
    };

    const prismaArgs: Omit<Prisma.PurchaseFindManyArgs, "skip" | "take"> = {
      where,
      include: {
        billingUser: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
        planPeriod: {
          include: {
            plan: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
      orderBy,
    };

    return paginatePrismaQuery<
      PurchaseListItem,
      Prisma.PurchaseCountArgs,
      Prisma.PurchaseFindManyArgs
    >(
      prisma.purchase as unknown as ModelDelegate<
        Prisma.PurchaseCountArgs,
        Prisma.PurchaseFindManyArgs,
        PurchaseListItem
      >,
      { page, pageSize },
      prismaArgs
    );
  } catch (error) {
    console.error("Failed to fetch purchases:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch purchases: ${error.message}`);
    }
    throw new Error("Failed to fetch purchases due to an unknown error");
  }
}
