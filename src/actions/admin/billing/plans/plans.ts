"use server";

import { getPlans } from "@/db/billing/plans";
import { Prisma } from "@/db/generated/prisma";
import { type Locale } from "@/i18n/locales";
import { isAdmin } from "@/lib/auth/utils";

export async function getPlansList(locale: Locale = "en", includeInactive: boolean = false) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const plans = await getPlans({ locale, includeInactive });
    return plans;
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw new Error("Failed to fetch plans");
  }
}

export async function createPlan(data: Prisma.PlanCreateInput) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    return createPlan(data);
  } catch (error) {
    console.error("Error creating plan:", error);
    throw new Error("Failed to create plan");
  }
}
