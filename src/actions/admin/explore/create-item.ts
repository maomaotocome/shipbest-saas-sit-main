"use server";

import { ExploreItem } from "@/db/generated/prisma";
import { isAdmin } from "@/lib/auth/utils";
import { createExploreItemFromTask } from "@/services/explore";

export async function createExploreItemAction(
  taskId: string,
  subTaskId: string,
  index: number
): Promise<ExploreItem> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await createExploreItemFromTask(taskId, subTaskId, index);
    return result;
  } catch (error) {
    console.error("Error creating explore item:", error);
    throw new Error("Failed to create explore item");
  }
}