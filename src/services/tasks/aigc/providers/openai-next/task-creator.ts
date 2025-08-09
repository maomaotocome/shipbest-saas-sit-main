import { ImageToImageModelCode } from "@/conifg/aigc/model-direct-invocation/image-to-image";
import { Prisma } from "@/db/generated/prisma";
import { ModelCategory, TaskType } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { calculateTaskCredits } from "@/services/tasks/credit";
import { JsonObject } from "@/types/json";
import { getModelCategory } from "../../utils/get-model-category";
import { getModelsFromRequest } from "../../utils/get-models-from-request";

export type TaskCreationResult = Prisma.TaskGetPayload<{
  include: {
    subTasks: true;
  };
}>;

/**
 * Create task with OpenAI Next provider
 */
export async function createOpenAINextTask({
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
  const subTasks = await generateOpenAINextSubTasks({
    taskType,
    metadata,
    request,
    systemRequest,
  });
  const totalCredits = subTasks.reduce((sum, subTask) => sum + (subTask.credits || 0), 0);

  const task = await prisma.task.create({
    data: {
      taskType,
      request: request as unknown as Prisma.InputJsonValue,
      systemRequest: systemRequest as unknown as Prisma.InputJsonValue,
      metadata: metadata as unknown as Prisma.InputJsonValue,
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
 * Generate sub-tasks for OpenAI Next provider based on task type and request
 */
async function generateOpenAINextSubTasks({
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
  const modelCodes = getModelsFromRequest({ request, systemRequest, metadata });
  if (modelCodes.length === 0) {
    throw new Error("No model specified in task parameters");
  }
  const modelCode = modelCodes[0];
  const modelCategory = getModelCategory({ metadata, request, systemRequest });
  if (!modelCategory) {
    throw new Error("model_category is required");
  }
  const subTasks: Prisma.SubTaskCreateManyTaskInput[] = [];
  switch (modelCategory) {
    case ModelCategory.TextToImage:
    case ModelCategory.ImageToImage:
      // For image-to-image with gpt4o, create multiple sub-tasks for each image
      if (modelCode === ImageToImageModelCode.gpt4o) {
        const numImages = (request.num_images as number) || 1;
        for (let i = 0; i < numImages; i++) {
          subTasks.push({
            request: {
              ...request,
              model: modelCode,
              models: undefined, // Remove models array to avoid confusion
              num_images: 1,
            } as unknown as Prisma.InputJsonValue,
            status: "PENDING",
            credits: Math.round(
              (await calculateOpenAINextTaskCredits(taskType, metadata, request, systemRequest))
                .totalCredits / numImages
            ),
          });
        }
      } else {
        subTasks.push({
          request: {
            ...request,
            model: modelCode,
            models: undefined, // Remove models array to avoid confusion
          } as unknown as Prisma.InputJsonValue,
          status: "PENDING",
          credits: (
            await calculateOpenAINextTaskCredits(
              TaskType.ModelDirectInvocation,
              metadata,
              request,
              systemRequest
            )
          ).totalCredits,
        });
      }
      break;

    default:
      throw new Error(`Unsupported model category: ${modelCategory}`);
  }

  return subTasks;
}

async function calculateOpenAINextTaskCredits(
  taskType: TaskType,
  metadata: JsonObject,
  request: JsonObject,
  systemRequest: JsonObject
) {
  return await calculateTaskCredits({
    taskType,
    metadata,
    request,
    systemRequest,
  });
}
