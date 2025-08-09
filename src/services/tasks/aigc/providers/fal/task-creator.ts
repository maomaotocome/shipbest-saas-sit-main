import { Prisma } from "@/db/generated/prisma";
import { ModelCategory, TaskType } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { calculateTaskCredits } from "@/services/tasks/credit";
import { JsonObject } from "@/types/json";
import { getModelCategory } from "../../utils/get-model-category";
import { getModelInfo } from "../../utils/get-model-info";
import { getModelsFromRequest } from "../../utils/get-models-from-request";

export type TaskCreationResult = Prisma.TaskGetPayload<{
  include: {
    subTasks: true;
  };
}>;

/**
 * Create task with FAL provider
 */
export async function createFalTask({
  taskType,
  request,
  userId,
  isPublic = false,
  metadata,
  systemRequest,
}: {
  taskType: TaskType;
  request: JsonObject;
  userId: string;
  isPublic: boolean;
  metadata: JsonObject;
  systemRequest: JsonObject;
}): Promise<TaskCreationResult> {
  const modelCategory = getModelCategory({ metadata, request, systemRequest });
  if (!modelCategory) {
    throw new Error("model_category is required");
  }
  const subTasks = await generateFalSubTasks({
    taskType,
    metadata,
    request,
    systemRequest,
  });
  const totalCredits = subTasks.reduce((sum, subTask) => sum + (subTask.credits || 0), 0);
  const task = await prisma.task.create({
    data: {
      taskType,
      metadata: metadata as unknown as Prisma.InputJsonValue,
      request: request as unknown as Prisma.InputJsonValue,
      systemRequest: systemRequest as unknown as Prisma.InputJsonValue,
      userId,
      isPublic,
      subTasks: {
        createMany: {
          data: subTasks,
        },
      },
      credits: totalCredits,
    },
    include: {
      subTasks: true,
    },
  });

  return task;
}

/**
 * Generate sub-tasks for FAL provider based on task type and request
 */
async function generateFalSubTasks({
  taskType,
  metadata,
  request,
  systemRequest,
}: {
  taskType: TaskType;
  metadata: JsonObject;
  request: JsonObject;
  systemRequest: JsonObject;
}): Promise<Prisma.SubTaskCreateManyTaskInput[]> {
  switch (taskType) {
    case TaskType.ModelDirectInvocation:
      return generateFalSubTasksForModelDirectInvocation({
        taskType,
        metadata,
        request,
        systemRequest,
      });
    case TaskType.Template:
      return generateFalSubTasksForTemplate({ taskType, metadata, request, systemRequest });
    default:
      throw new Error(`Unsupported task type: ${taskType}`);
  }
}

async function generateFalSubTasksForModelDirectInvocation({
  taskType,
  metadata,
  request,
  systemRequest,
}: {
  taskType: TaskType;
  metadata: JsonObject;
  request: JsonObject;
  systemRequest: JsonObject;
}): Promise<Prisma.SubTaskCreateManyTaskInput[]> {
  const modelCategory = getModelCategory({ metadata, request, systemRequest });

  // Extract model codes and process requests
  const modelCodes = getModelsFromRequest({ request, systemRequest, metadata });
  if (modelCodes.length === 0) {
    throw new Error("No model specified in task parameters");
  }
  const subTasks: Prisma.SubTaskCreateManyTaskInput[] = [];

  switch (modelCategory) {
    case ModelCategory.TextToImage:
    case ModelCategory.TextToVideo:
    case ModelCategory.ImageToImage:
    case ModelCategory.ImageToVideo:
      for (const modelCode of modelCodes) {
        const modelInfo = getModelInfo(modelCategory, modelCode);
        if (!modelInfo) {
          throw new Error(`Model not found: ${modelCode}`);
        }

        subTasks.push({
          systemRequest: systemRequest as unknown as Prisma.InputJsonValue,
          request: request as unknown as Prisma.InputJsonValue,
          status: "PENDING",
          credits: (
            await calculateTaskCredits({
              taskType,
              request,
              systemRequest,
              metadata,
            })
          ).totalCredits,
        });
      }
      break;

    default:
      throw new Error(`Unsupported model category: ${modelCategory}`);
  }

  return subTasks;
}

async function generateFalSubTasksForTemplate({
  taskType,
  metadata,
  request,
  systemRequest,
}: {
  taskType: TaskType;
  metadata: JsonObject;
  request: JsonObject;
  systemRequest: JsonObject;
}): Promise<Prisma.SubTaskCreateManyTaskInput[]> {
  return generateFalSubTasksForModelDirectInvocation({
    taskType,
    metadata: {
      ...metadata,
      model_category: request.model_category || systemRequest.model_category,
    },
    request,
    systemRequest,
  });
}
