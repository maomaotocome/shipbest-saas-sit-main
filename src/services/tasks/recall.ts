import { Provider } from "@/conifg/aigc/types";
import { TaskStatus } from "@/db/generated/prisma";
import { TaskType } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { JsonObject } from "@/types/json";
import { recallFalTask } from "./aigc/providers/fal/recall";
import { recallKieAiTask } from "./aigc/providers/kie_ai/recall";
import { getTaskProvider } from "./aigc/utils/get-task-provider";
import type { TaskCreationResult } from "./create";
import { checkSubTasksAndUpdateTaskStatus } from "./utils/checkSubTasksAndUpdateTaskStatus";

export interface TaskRecallResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface RecallTaskParams {
  taskId: string;
  userId: string;
}

export async function recallTask(params: RecallTaskParams): Promise<TaskRecallResult> {
  const { taskId, userId } = params;

  try {
    // Get task and its subtasks
    const task = await prisma.task.findUnique({
      where: { id: taskId, userId },
      include: {
        subTasks: true,
      },
    });

    if (!task) {
      return {
        success: false,
        message: "Task not found",
        error: "Task not found",
      };
    }

    // Check if task status allows recall
    if (task.status === TaskStatus.COMPLETED) {
      return {
        success: false,
        message: "Task already completed",
        error: "Task is already completed",
      };
    }

    // Check if there are pending subtasks
    const pendingSubTasks = task.subTasks.filter(
      (subTask) => subTask.status === TaskStatus.PROCESSING || subTask.status === TaskStatus.PENDING
    );

    if (pendingSubTasks.length === 0) {
      return {
        success: false,
        message: "No pending subtasks to recall",
        error: "All subtasks are already completed or failed",
      };
    }

    // Start recall process
    await recallTaskByProvider(task);

    return {
      success: true,
      message: "Task recall initiated successfully",
    };
  } catch (error) {
    console.error("Failed to recall task:", error);
    return {
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

async function recallTaskByProvider(task: TaskCreationResult): Promise<void> {
  const subTasks = task.subTasks;

  for (const subTask of subTasks) {
    // Only process pending subtasks
    if (subTask.status !== TaskStatus.PROCESSING && subTask.status !== TaskStatus.PENDING) {
      continue;
    }

    const request = subTask.request as JsonObject;
    const metadata = task.metadata as JsonObject;
    const systemRequest = task.systemRequest as JsonObject;

    const provider = await getTaskProvider({
      metadata,
      taskType: task.taskType as TaskType,
      request,
      systemRequest,
    });

    try {
      let recallResult = null;

      switch (provider) {
        case Provider.fal:
          recallResult = await recallFalTask({
            taskType: task.taskType as TaskType,
            metadata,
            systemRequest,
            request,
            taskId: task.id,
            subTaskId: subTask.id,
            userId: task.userId!,
            subTask: {
              id: subTask.id,
              response: subTask.response as JsonObject | null,
            },
          });
          break;

        case Provider.kie_ai:
          recallResult = await recallKieAiTask({
            taskType: task.taskType as TaskType,
            metadata,
            systemRequest,
            request,
            taskId: task.id,
            subTaskId: subTask.id,
            userId: task.userId!,
            subTask: {
              id: subTask.id,
              response: subTask.response as JsonObject | null,
            },
          });
          break;

        default:
          console.warn(`Recall not supported for provider: ${provider}`);
          continue;
      }

      console.log(`Recall result for subTask ${subTask.id}:`, recallResult);
    } catch (error) {
      console.error(`Failed to recall ${task.taskType} subTask ${subTask.id}:`, error);
      // Don't update subtask status on recall failure, keep original status
    }
  }

  // Check and update task status
  await checkSubTasksAndUpdateTaskStatus(task.id);
}
