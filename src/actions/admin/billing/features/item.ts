"use server";

import { deleteFeature, getFeatureById, updateFeature } from "@/db/billing/features";
import { Prisma } from "@/db/generated/prisma";
import { type Locale } from "@/i18n/locales";
import { isAdmin } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";

export async function getFeatureAction(featureId: string, locale: Locale = "en") {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const feature = await getFeatureById(featureId, locale);

    if (!feature) {
      throw new Error("Feature not found");
    }

    return feature;
  } catch (error) {
    console.error("Error fetching feature details:", error);
    throw new Error("Failed to fetch feature details");
  }
}

export async function updateFeatureAction(data: Prisma.FeatureUpdateInput) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    return updateFeature(data);
  } catch (error) {
    console.error("Error updating feature:", error);
    throw new Error("Failed to update feature");
  }
}

export async function deleteFeatureAction(featureId: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await deleteFeature(featureId);

    if (!result.success) {
      throw new Error(result.error);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting feature:", error);
    throw new Error("Failed to delete feature");
  }
}

export async function manageFeatureAllocation(
  featureId: string,
  data: {
    action: string;
    planPeriodId?: string;
    quantity?: number;
  }
) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const { action, planPeriodId, quantity } = data;

    const existingFeature = await prisma.feature.findUnique({
      where: { id: featureId },
    });

    if (!existingFeature) {
      throw new Error("Feature not found");
    }

    switch (action) {
      case "setAllocation":
        if (!planPeriodId) {
          throw new Error("Plan period ID is required");
        }

        if (quantity === undefined || quantity < 0) {
          throw new Error("Valid quantity is required");
        }

        const planPeriod = await prisma.planPeriod.findUnique({
          where: { id: planPeriodId },
        });

        if (!planPeriod) {
          throw new Error("Plan period not found");
        }

        try {
          const allocation = await setFeatureAllocation(featureId, planPeriodId, quantity);
          return allocation;
        } catch (error) {
          throw error;
        }

      case "removeAllocation":
        if (!planPeriodId) {
          throw new Error("Plan period ID is required");
        }

        const allocationToDelete = await prisma.planPeriodFeatureAllocation.findUnique({
          where: {
            planPeriodId_featureId: {
              planPeriodId,
              featureId,
            },
          },
        });

        if (!allocationToDelete) {
          throw new Error("Allocation not found");
        }

        await removeFeatureAllocation(featureId, planPeriodId);
        return { success: true };

      default:
        throw new Error("Invalid action");
    }
  } catch (error) {
    console.error("Error managing feature allocation:", error);
    throw new Error("Failed to manage feature allocation");
  }
}

async function setFeatureAllocation(featureId: string, planPeriodId: string, quantity: number) {
  const existingAllocation = await prisma.planPeriodFeatureAllocation.findUnique({
    where: {
      planPeriodId_featureId: {
        planPeriodId,
        featureId,
      },
    },
  });

  if (existingAllocation) {
    return prisma.planPeriodFeatureAllocation.update({
      where: {
        planPeriodId_featureId: {
          planPeriodId,
          featureId,
        },
      },
      data: {
        quantity,
      },
    });
  } else {
    return prisma.planPeriodFeatureAllocation.create({
      data: {
        planPeriodId,
        featureId,
        quantity,
      },
    });
  }
}

async function removeFeatureAllocation(featureId: string, planPeriodId: string) {
  return prisma.planPeriodFeatureAllocation.delete({
    where: {
      planPeriodId_featureId: {
        planPeriodId,
        featureId,
      },
    },
  });
}
