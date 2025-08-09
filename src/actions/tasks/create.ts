"use server";

import { getUser } from "@/lib/auth/utils";
import { createAndRunTask } from "@/services/tasks/create";
import type { JsonObject } from "@/types/json";

export async function createAndRunTaskAction(params: {
  taskType: string;
  request: JsonObject;
  isPublic: boolean;
  metadata: JsonObject;
}) {
  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }

  try {
    const result = await createAndRunTask({
      taskType: params.taskType,
      userId: user.id,
      request: params.request,
      isPublic: params.isPublic,
      metadata: params.metadata,
    });

    return result;
  } catch (error) {
    console.error("Failed to create task:", error);
    throw error;
  }
}
