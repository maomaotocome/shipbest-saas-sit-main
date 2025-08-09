"use server";

import { Prisma } from "@/db/generated/prisma";
import { isAdmin } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { paginatePrismaQuery } from "@/lib/utils";
import { ModelDelegate, PaginatedResponse, PaginationParams } from "@/types/pagination";
import { getLocale } from "next-intl/server";

type SubscriptionListItem = Prisma.SubscriptionGetPayload<{
  include: {
    billingUser: {
      include: {
        user: true;
      };
    };
    periods: true;
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

export async function getSubscriptionsList(
  params: PaginationParams
): Promise<PaginatedResponse<SubscriptionListItem>> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }
  const { page, pageSize } = params;
  const locale = await getLocale();

  try {
    const where: Prisma.SubscriptionWhereInput = {};
    // Example filter logic (add when needed):
    // if (params.email) {
    //   where.billingUser = { user: { email: { contains: params.email, mode: 'insensitive' } } };
    // }
    // if (params.status) {
    //   where.status = params.status;
    // }

    const prismaArgs: Omit<Prisma.SubscriptionFindManyArgs, "skip" | "take"> = {
      where,
      include: {
        billingUser: {
          include: {
            user: true,
          },
        },
        periods: true,
        planPeriod: {
          include: {
            plan: {
              include: {
                translations: {
                  where: {
                    locale,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    };

    return paginatePrismaQuery<
      SubscriptionListItem,
      Prisma.SubscriptionCountArgs,
      Prisma.SubscriptionFindManyArgs
    >(
      prisma.subscription as unknown as ModelDelegate<
        Prisma.SubscriptionCountArgs,
        Prisma.SubscriptionFindManyArgs,
        SubscriptionListItem
      >,
      { page, pageSize },
      prismaArgs
    );
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    throw new Error("Failed to fetch subscriptions");
  }
}
