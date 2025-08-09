"use server";

import { getPlanDetail, updatePlan } from "@/db/billing/plans";
import { Prisma } from "@/db/generated/prisma";
import { type Locale } from "@/i18n/locales";
import { isAdmin } from "@/lib/auth/utils";

export async function getPlan(planId: string, locale?: Locale) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const plan = await getPlanDetail({ planId, locale });

    if (!plan) {
      throw new Error("Plan not found");
    }

    return plan;
  } catch (error) {
    console.error("Error fetching plan details:", error);
    throw new Error("Failed to fetch plan details");
  }
}

export async function updatePlanAction(data: Prisma.PlanUpdateInput) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    return updatePlan(data);
  } catch (error) {
    console.error("Error updating plan:", error);
    throw new Error("Failed to update plan");
  }
}
