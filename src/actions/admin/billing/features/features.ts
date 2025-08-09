"use server";

import { createFeature, getAllFeatures } from "@/db/billing/features";
import { Prisma } from "@/db/generated/prisma";
import { type Locale } from "@/i18n/locales";
import { isAdmin } from "@/lib/auth/utils";
export async function getFeaturesAction(locale: Locale) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    return getAllFeatures(locale);
  } catch (error) {
    console.error("Error fetching features:", error);
    throw new Error("Failed to fetch features");
  }
}

export async function createNewFeatureAction(data: Prisma.FeatureCreateInput) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    return createFeature(data);
  } catch (error) {
    console.error("Error creating feature:", error);
    throw new Error("Failed to create feature");
  }
}
