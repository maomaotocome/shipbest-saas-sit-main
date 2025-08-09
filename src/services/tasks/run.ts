import { TaskStatus } from "@/db/generated/prisma";
import { TaskType } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

import { Provider } from "@/conifg/aigc/types";
import { JsonObject } from "@/types/json";
import { runFalTask } from "./aigc/providers/fal";
import { runKieAiTask } from "./aigc/providers/kie_ai";
import { runOpenAINextTask } from "./aigc/providers/openai-next";
import { getTaskProvider } from "./aigc/utils/get-task-provider";
import type { TaskCreationResult } from "./create";
import { checkSubTasksAndUpdateTaskStatus } from "./utils/checkSubTasksAndUpdateTaskStatus";

export async function runTask(task: TaskCreationResult): Promise<void> {
  try {
    await prisma.task.update({
      where: {
        id: task.id,
      },
      data: {
        status: TaskStatus.PROCESSING,
        response: {
          startedAt: new Date().toISOString(),
        },
      },
    });
    switch (task.taskType as TaskType) {
      case TaskType.ModelDirectInvocation:
        await runTaskByProvider(task);
        break;
      case TaskType.Template:
        await runTaskByProvider(task);
        break;
      default:
        throw new Error(`Unsupported task type: ${task.taskType}`);
    }
  } catch (error) {
    console.error("Failed to run task:", error);
    throw error;
  }
}

async function runTaskByProvider(task: TaskCreationResult): Promise<void> {
  const subTasks = task.subTasks;
  let updatedSubTask = null;
  for (const subTask of subTasks) {
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
      let res = null;
      updatedSubTask = await prisma.subTask.update({
        where: {
          id: subTask.id,
        },
        data: {
          status: TaskStatus.PROCESSING,
          response: {
            startedAt: new Date(),
          },
        },
      });
      switch (provider) {
        case Provider.fal:
          res = await runFalTask({
            taskType: task.taskType as TaskType,
            metadata,
            systemRequest,
            request,
            taskId: task.id,
            subTaskId: subTask.id,
            userId: task.userId!,
          });
          break;

        case Provider.kie_ai:
          res = await runKieAiTask({
            taskType: task.taskType as TaskType,
            metadata,
            systemRequest,
            request,
            taskId: task.id,
            subTaskId: subTask.id,
            userId: task.userId!,
          });
          break;

        case Provider.openai_next:
          res = await runOpenAINextTask({
            taskType: task.taskType as TaskType,
            metadata,
            systemRequest,
            request,
            taskId: task.id,
            subTaskId: subTask.id,
            userId: task.userId!,
          });
          break;

        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      if (res) {
        updatedSubTask = await prisma.subTask.update({
          where: {
            id: subTask.id,
          },
          data: {
            status: TaskStatus.PROCESSING,
            response: {
              ...(updatedSubTask?.response as JsonObject),
              ...(res as JsonObject),
              submittedAt: new Date(),
            },
          },
        });
      }
    } catch (error) {
      console.error(`Failed to run ${task.taskType} subTask:`, error);
      // Update subtask status to failed
      await prisma.subTask.update({
        where: {
          id: subTask.id,
        },
        data: {
          status: TaskStatus.FAILED,
          response: {
            ...(updatedSubTask?.response as JsonObject),
            failedAt: new Date(),
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      });
      await checkSubTasksAndUpdateTaskStatus(task.id);
      throw error;
    }
  }
}
