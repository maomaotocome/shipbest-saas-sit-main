"use server";

import { deleteExploreItem } from "@/db/explore/items";
import { isAdmin } from "@/lib/auth/utils";

export async function deleteExploreItemAction(id: string): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    await deleteExploreItem(id);
  } catch (error) {
    console.error("Error deleting explore item:", error);
    throw new Error("Failed to delete explore item");
  }
}