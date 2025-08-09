"use server";

import { getExploreItem } from "@/db/explore/items";
import { ExploreItem } from "@/db/generated/prisma";
import { isAdmin } from "@/lib/auth/utils";

export async function getExploreItemAction(id: string): Promise<ExploreItem | null> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await getExploreItem(id);
    return result;
  } catch (error) {
    console.error("Error fetching explore item:", error);
    throw new Error("Failed to fetch explore item");
  }
}