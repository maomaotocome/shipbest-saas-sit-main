"use server";

import { getExploreItemStats } from "@/db/explore/items";
import { isAdmin } from "@/lib/auth/utils";

export async function getExploreItemStatsAction(): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  hidden: number;
  visible: number;
  featured: number;
}> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await getExploreItemStats();
    return result;
  } catch (error) {
    console.error("Error fetching explore item stats:", error);
    throw new Error("Failed to fetch explore item stats");
  }
}