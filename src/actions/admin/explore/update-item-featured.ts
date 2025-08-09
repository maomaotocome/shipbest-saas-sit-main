"use server";

import { updateExploreItemFeatured } from "@/db/explore/items";
import { ExploreItem } from "@/db/generated/prisma";
import { isAdmin } from "@/lib/auth/utils";

export async function updateExploreItemFeaturedAction(
  id: string,
  featured: boolean
): Promise<ExploreItem> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await updateExploreItemFeatured(id, featured);
    return result;
  } catch (error) {
    console.error("Error updating explore item featured status:", error);
    throw new Error("Failed to update explore item featured status");
  }
}