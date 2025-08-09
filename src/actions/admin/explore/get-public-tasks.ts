"use server";

import { isAdmin } from "@/lib/auth/utils";
import { GetPublicTasksParams } from "@/services/explore";

export async function getPublicTasksForExploreAction(
  params: GetPublicTasksParams
): Promise<{ tasks: Record<string, unknown>[]; total: number }> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const { getPublicTasksForExplore } = await import("@/services/explore");
    const result = await getPublicTasksForExplore(params);
    return result;
  } catch (error) {
    console.error("Error fetching public tasks for explore:", error);
    throw new Error("Failed to fetch public tasks");
  }
}