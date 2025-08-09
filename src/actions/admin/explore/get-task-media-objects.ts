"use server";

import { isAdmin } from "@/lib/auth/utils";

export async function getTaskMediaObjectsAction(taskId: string): Promise<{
  taskInfo: Record<string, unknown>;
  mediaObjects: Array<{
    subTaskId: string;
    objectId: string;
    type: "image" | "video";
    url: string;
    width?: number;
    height?: number;
    fileName?: string;
    alreadyInExplore: boolean;
  }>;
}> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const { getTaskMediaObjects } = await import("@/services/explore");
    const result = await getTaskMediaObjects(taskId);

    if (!result) {
      throw new Error("Task not found");
    }

    return result;
  } catch (error) {
    console.error("Error fetching task media objects:", error);
    throw new Error("Failed to fetch task media objects");
  }
}