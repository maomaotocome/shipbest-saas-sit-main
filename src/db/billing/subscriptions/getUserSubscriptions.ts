import { Prisma } from "@/db/generated/prisma";
import { prisma } from "@/lib/prisma";
import { paginatePrismaQuery } from "@/lib/utils";
import {
  SubscriptionWithDetail,
  SubscriptionWithDetailInclude,
} from "@/types/billing/subscriptions";
import { ModelDelegate, PaginatedResponse, PaginationParams } from "@/types/pagination";

export async function getUserSubscriptions(
  userId: string,
  params: PaginationParams
): Promise<PaginatedResponse<SubscriptionWithDetail>> {
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

  const prismaArgs: Omit<Prisma.SubscriptionFindManyArgs, "skip" | "take"> = {
    where: { billingUserId: billingUser.id },
    include: {
      ...SubscriptionWithDetailInclude.include,
      periods: {
        orderBy: { periodNumber: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  };

  return paginatePrismaQuery<
    SubscriptionWithDetail,
    Prisma.SubscriptionCountArgs,
    Prisma.SubscriptionFindManyArgs
  >(
    prisma.subscription as unknown as ModelDelegate<
      Prisma.SubscriptionCountArgs,
      Prisma.SubscriptionFindManyArgs,
      SubscriptionWithDetail
    >,
    params,
    prismaArgs
  );
}
