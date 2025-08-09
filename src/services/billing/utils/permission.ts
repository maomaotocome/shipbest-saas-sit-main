import { getOrCreateBillingUserByUserId } from "@/db/billing/users";
import { prisma } from "@/lib/prisma";

export async function hasValidPrivateTaskPermission(userId: string): Promise<boolean> {
  const billingUser = await getOrCreateBillingUserByUserId({ userId });
  const now = new Date();

  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      billingUserId: billingUser.id,
      status: "ACTIVE",
      startDate: {
        lte: now,
      },
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    },
    include: {
      planPeriod: {
        include: {
          plan: {
            select: {
              allowPrivateTasks: true,
            },
          },
        },
      },
    },
  });

  if (activeSubscription?.planPeriod?.plan?.allowPrivateTasks) {
    return true;
  }

  const validPurchase = await prisma.purchase.findFirst({
    where: {
      billingUserId: billingUser.id,
      status: "COMPLETED",
    },
    include: {
      planPeriod: {
        include: {
          plan: {
            select: {
              allowPrivateTasks: true,
            },
          },
        },
      },
    },
  });

  if (validPurchase?.planPeriod?.plan?.allowPrivateTasks) {
    return true;
  }

  return false;
}
