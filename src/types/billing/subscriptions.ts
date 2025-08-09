import { Prisma } from "@/db/generated/prisma";

export const SubscriptionWithDetailInclude = {
  include: {
    periods: true,
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
};

export type SubscriptionWithDetail = Prisma.SubscriptionGetPayload<
  typeof SubscriptionWithDetailInclude
>;
