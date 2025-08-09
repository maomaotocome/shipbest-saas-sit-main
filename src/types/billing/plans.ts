import { Prisma } from "@/db/generated/prisma";

export const PlanPeriodInclude = {
  include: {
    featureAllocations: true,
  },
};

export type PlanPeriodGetPayload = Prisma.PlanPeriodGetPayload<typeof PlanPeriodInclude>;

export const PlanInclude = {
  include: {
    planFeatures: true,
    planPeriods: {
      include: {
        featureAllocations: true,
      },
    },
    translations: true,
  },
};

export type PlanGetPayloadWithDetail = Prisma.PlanGetPayload<typeof PlanInclude>;

export const PlanWithPeriodsAndProviderPriceConfigsInclude = {
  include: {
    planPeriods: {
      include: {
        providerPriceConfigs: true,
      },
    },
  },
};

export type PlanGetPayloadWithPeriodsAndProviderPriceConfigs = Prisma.PlanGetPayload<
  typeof PlanWithPeriodsAndProviderPriceConfigsInclude
>;
