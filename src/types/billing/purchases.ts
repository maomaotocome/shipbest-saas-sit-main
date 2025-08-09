import { Prisma } from "@/db/generated/prisma";

export const PurchaseInclude = {
  include: {
    invoice: true,
    planPeriod: {
      include: {
        plan: {
          include: {
            translations: true,
          },
        },
      },
    },
    providerAccount: true,
  },
};

export type PurchaseWithDetail = Prisma.PurchaseGetPayload<typeof PurchaseInclude>;
