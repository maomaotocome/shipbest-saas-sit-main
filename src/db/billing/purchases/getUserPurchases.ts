import { Prisma } from "@/db/generated/prisma";
import { prisma } from "@/lib/prisma";
import { paginatePrismaQuery } from "@/lib/utils";
import { PurchaseInclude, PurchaseWithDetail } from "@/types/billing/purchases";
import { ModelDelegate, PaginatedResponse, PaginationParams } from "@/types/pagination";

export async function getUserPurchases(
  userId: string,
  params: PaginationParams
): Promise<PaginatedResponse<PurchaseWithDetail>> {
  const billingUser = await prisma.billingUser.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!billingUser) {
    return {
      items: [],
      total: 0,
      totalPages: 0,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  const prismaArgs: Omit<Prisma.PurchaseFindManyArgs, "skip" | "take"> = {
    where: {
      billingUserId: billingUser.id,
    },
    include: PurchaseInclude.include,
    orderBy: { purchaseDate: "desc" },
  };

  return paginatePrismaQuery<
    PurchaseWithDetail,
    Prisma.PurchaseCountArgs,
    Prisma.PurchaseFindManyArgs
  >(
    prisma.purchase as unknown as ModelDelegate<
      Prisma.PurchaseCountArgs,
      Prisma.PurchaseFindManyArgs,
      PurchaseWithDetail
    >,
    params,
    prismaArgs
  );
}
