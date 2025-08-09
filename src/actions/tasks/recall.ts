"use server";

import { getUser } from "@/lib/auth/utils";
import { recallTask } from "@/services/tasks/recall";

export async function recallTaskAction(taskId: string) {
  try {
    // Get current user information
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (!taskId) {
      return { success: false, error: "Task ID is required" };
    }

    // Call unified recall service
    const result = await recallTask({ taskId, userId: user.id });

    return result;
  } catch (error) {
    console.error("Error recalling task result:", error);
    return { success: false, error: "Internal server error" };
  }
}
