import { PlanStatus, Prisma } from "@/db/generated/prisma";
import { defaultLocale, type Locale } from "@/i18n/locales";
import { createTransactionRunner } from "@/lib/prisma";

async function handleGetPlans(
  {
    locale,
    includeInactive,
    withDefaultLocale = false,
  }: { locale?: Locale; includeInactive?: boolean; withDefaultLocale?: boolean },
  tx: Prisma.TransactionClient
) {
  const whereClause = includeInactive ? {} : { status: PlanStatus.ACTIVE };

  const translationsWhere = locale
    ? {
        where: { locale: withDefaultLocale ? { in: [locale, defaultLocale] } : { equals: locale } },
      }
    : {};
  const plans = await tx.plan.findMany({
    where: whereClause,
    orderBy: {
      sortOrder: "asc",
    },
    include: {
      translations: translationsWhere,
      planFeatures: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      planPeriods: {
        where: {
          isActive: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
        include: {
          featureAllocations: true,
        },
      },
    },
  });
  return plans;
}

export const getPlans = createTransactionRunner(handleGetPlans, "getPlans");

async function handleGetPlan(param: Prisma.PlanFindUniqueArgs, tx: Prisma.TransactionClient) {
  return tx.plan.findUnique(param);
}

export const getPlan = createTransactionRunner(handleGetPlan, "getPlan");
export type PlanDetail = Awaited<ReturnType<typeof getPlanDetail>>;
async function handleGetPlanDetail(
  { planId, locale }: { planId: string; locale?: Locale },
  tx: Prisma.TransactionClient
) {
  const translationsWhere = locale ? { where: { locale } } : {};
  const plan = await tx.plan.findUnique({
    where: {
      id: planId,
    },
    include: {
      translations: translationsWhere,
      planFeatures: {
        orderBy: {
          sortOrder: "asc",
        },
        select: {
          featureId: true,
          isIncluded: true,
          isPrimary: true,
          limit: true,
          id: true,
        },
      },
      planPeriods: {
        where: {
          isActive: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
        include: {
          featureAllocations: {
            select: {
              featureId: true,
              quantity: true,
              id: true,
            },
          },
        },
      },
    },
  });
  return plan;
}

export const getPlanDetail = createTransactionRunner(handleGetPlanDetail, "getPlanDetail");

async function handleUpdatePlan(data: Prisma.PlanUpdateInput, tx: Prisma.TransactionClient) {
  return tx.plan.update({
    where: {
      id: data.id as string,
    },
    data,
  });
}

export const updatePlan = createTransactionRunner(handleUpdatePlan, "updatePlan");
