import { PlanDetail } from "@/db/billing/plans";
import { BillingScheme, PlanStatus, Prisma } from "@/db/generated/prisma";

export const defaultPlanForm: Prisma.PlanUpdateInput = {
  id: "",
  code: "",
  status: PlanStatus.ACTIVE,
  billingScheme: BillingScheme.HYBRID,
  isPopular: false,
  validFrom: new Date(),
  validUntil: null,
  sortOrder: 0,
  translations: {
    create: [],
  },
  planFeatures: {
    create: [],
  },
  planPeriods: {
    create: [],
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const convertToUpadteData = (data: PlanDetail): Prisma.PlanUpdateInput => {
  if (!data) {
    return defaultPlanForm;
  }

  return {
    ...data,
    translations: {
      update: data.translations.map((translation) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { planId, ...translationWithoutPlanId } = translation;
        return {
          where: { id: translation.id },
          data: {
            ...translationWithoutPlanId,
          },
        };
      }),
      delete: [],
      create: [],
    },
    planFeatures: {
      update: data.planFeatures.map((planFeature) => {
        return {
          where: { id: planFeature.id },
          data: {
            ...planFeature,
          },
        };
      }),
      delete: [],
      create: [],
    },
    planPeriods: {
      update: data.planPeriods.map((planPeriod) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { planId, ...planPeriodWithoutPlanId } = planPeriod;
        return {
          where: { id: planPeriod.id },
          data: {
            ...planPeriodWithoutPlanId,
            featureAllocations: {
              update: planPeriod.featureAllocations.map((featureAllocation) => ({
                where: { id: featureAllocation.id },
                data: {
                  ...featureAllocation,
                },
              })),
              delete: [],
              create: [],
            },
          },
        };
      }),
      delete: [],
      create: [],
    },
  };
};
