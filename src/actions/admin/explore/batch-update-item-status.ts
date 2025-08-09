"use server";

import { batchUpdateExploreItemStatus } from "@/db/explore/items";
import { ExploreItemStatus } from "@/db/generated/prisma";
import { isAdmin } from "@/lib/auth/utils";

export async function batchUpdateExploreItemStatusAction(
  ids: string[],
  status: ExploreItemStatus,
  isVisible?: boolean
): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    await batchUpdateExploreItemStatus(ids, status, isVisible);
  } catch (error) {
    console.error("Error batch updating explore item status:", error);
    throw new Error("Failed to batch update explore item status");
  }
}