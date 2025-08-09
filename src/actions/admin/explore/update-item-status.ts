"use server";

import { updateExploreItemStatus } from "@/db/explore/items";
import { ExploreItem, ExploreItemStatus } from "@/db/generated/prisma";
import { isAdmin } from "@/lib/auth/utils";

export async function updateExploreItemStatusAction(
  id: string,
  status: ExploreItemStatus,
  isVisible?: boolean
): Promise<ExploreItem> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await updateExploreItemStatus(id, status, isVisible);
    return result;
  } catch (error) {
    console.error("Error updating explore item status:", error);
    throw new Error("Failed to update explore item status");
  }
}