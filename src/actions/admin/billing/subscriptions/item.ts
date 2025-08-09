"use server";

import { isAdmin } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import { cancel as cancelSubscription } from "@/services/billing/payment/cancel";
import { refund as refundPeriod } from "@/services/billing/payment/refund";

export async function getSubscriptionDetail(subscriptionId: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  return prisma.subscription.findUnique({
    where: {
      id: subscriptionId,
    },
    include: {
      periods: true,
    },
  });
}

export async function cancelSubscriptionAction(subscriptionId: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  const subscription = await prisma.subscription.findUnique({
    where: {
      id: subscriptionId,
    },
    include: {
      billingUser: true,
    },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  await cancelSubscription({
    userId: subscription.billingUser.userId,
    subscriptionId: subscription.id,
  });

  return { success: true };
}

export async function refundPeriodAction(subscriptionId: string, periodId: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  const subscription = await prisma.subscription.findUnique({
    where: {
      id: subscriptionId,
    },
    include: {
      periods: true,
      billingUser: true,
    },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  const period = subscription.periods.find((p) => p.id === periodId);
  if (!period) {
    throw new Error("Period not found");
  }

  await refundPeriod({
    userId: subscription.billingUser.userId,
    subscriptionInfo: {
      id: subscription.id,
      periodId: period.id,
    },
  });

  return { success: true };
}
