import {
  calculateModelCredits as calculateImageToImageCredits,
  ImageToImageModelCode,
} from "@/conifg/aigc/model-direct-invocation/image-to-image";
import {
  calculateModelCredits as calculateImageToVideoCredits,
  ImageToVideoModelCode,
} from "@/conifg/aigc/model-direct-invocation/image-to-video";
import {
  calculateModelCredits as calculateTextToImageCredits,
  TextToImageModelCode,
} from "@/conifg/aigc/model-direct-invocation/text-to-image";
import {
  calculateModelCredits as calculateTextToVideoCredits,
  TextToVideoModelCode,
} from "@/conifg/aigc/model-direct-invocation/text-to-video";
import {
  calculateModelCredits as calculateTextToMusicCredits,
  TextToMusicModelCode,
} from "@/conifg/aigc/model-direct-invocation/text-to-music";
import { calculateTemplateCredits as calculateTemplateCreditsFromTemplate } from "@/conifg/aigc/template";
import { TaskStatus } from "@/db/generated/prisma";
import { ModelCategory, TaskType, TemplateType } from "@/lib/constants";
import { JsonObject } from "@/types/json";
import { TaskListItem } from "@/types/tasks";
import { getModelsFromRequest } from "../aigc/utils/get-models-from-request";
import { getSystemRequest } from "../aigc/utils/get-system-request";

export interface CreditCalculationResult {
  totalCredits: number;
  breakdown: {
    model: string;
    quantity: number;
    credits: number;
  }[];
}

export async function calculateTaskCredits({
  taskType,
  metadata,
  request,
  systemRequest,
}: {
  taskType: TaskType;
  request: JsonObject;
  metadata: JsonObject;
  systemRequest?: JsonObject;
}): Promise<CreditCalculationResult> {
  switch (taskType) {
    case TaskType.ModelDirectInvocation:
      const modelCategory = metadata.model_category as ModelCategory;
      const credits = await calculateModelDirectInvocationCredits(modelCategory, request, metadata);
      return {
        totalCredits: credits,
        breakdown: [],
      };
    case TaskType.Template:
      const sysReq = systemRequest || (await getSystemRequest({ taskType, metadata }));
      const templateType = metadata.template_type as TemplateType;
      return {
        totalCredits: calculateTemplateCreditsFromTemplate(templateType, request, sysReq),
        breakdown: [],
      };
    default:
      throw new Error(`Unsupported task type: ${taskType}`);
  }
}

export async function calculateModelDirectInvocationCredits(
  modelCategory: ModelCategory,
  request: JsonObject,
  metadata: JsonObject
): Promise<number> {
  const modelCodes = getModelsFromRequest({
    request,
    metadata,
  });
  const credits = modelCodes.reduce((acc: number, modelCode: string) => {
    return acc + calculateModelCredits(modelCategory, modelCode, request);
  }, 0);
  return credits;
}

function calculateModelCredits(
  modelCategory: ModelCategory,
  modelCode: string,
  request: JsonObject
): number {
  switch (modelCategory) {
    case ModelCategory.TextToImage:
      return calculateTextToImageCredits(modelCode as TextToImageModelCode, request);
    case ModelCategory.ImageToImage:
      return calculateImageToImageCredits(modelCode as ImageToImageModelCode, request);
    case ModelCategory.TextToVideo:
      return calculateTextToVideoCredits(modelCode as TextToVideoModelCode, request);
    case ModelCategory.ImageToVideo:
      return calculateImageToVideoCredits(modelCode as ImageToVideoModelCode, request);
    case ModelCategory.TextToMusic:
      return calculateTextToMusicCredits(modelCode as TextToMusicModelCode, request);
    default:
      throw new Error(`Unsupported model category: ${modelCategory}`);
  }
}

/**
 * calculate refund credits
 * based on the status and credits of the sub-tasks, calculate the total amount of credits to be refunded
 *
 * @param task - the task object containing sub-tasks
 * @returns the amount of credits to be refunded
 */
export function calculateRefundCredits(task: TaskListItem): number {
  if (!task.subTasks || task.subTasks.length === 0) {
    // if there are no sub-tasks, determine whether to refund the full amount based on the task status
    if (
      task.status === TaskStatus.FAILED ||
      task.status === TaskStatus.CANCELLED ||
      task.status === TaskStatus.ABORTED
    ) {
      return task.credits || 0;
    }
    return 0;
  }

  // calculate the total amount of credits to be refunded based on the status and credits of the sub-tasks
  const refundCredits = task.subTasks.reduce((total, subTask) => {
    const subTaskCredits = subTask.credits || 0;

    // determine whether to refund based on the status of the sub-task
    if (
      subTask.status === TaskStatus.FAILED ||
      subTask.status === TaskStatus.CANCELLED ||
      subTask.status === TaskStatus.ABORTED
    ) {
      return total + subTaskCredits;
    }

    // for PENDING status sub-tasks, if the main task has been cancelled or failed, the sub-task should also be refunded
    if (
      subTask.status === TaskStatus.PENDING &&
      (task.status === TaskStatus.CANCELLED ||
        task.status === TaskStatus.FAILED ||
        task.status === TaskStatus.ABORTED)
    ) {
      return total + subTaskCredits;
    }

    return total;
  }, 0);

  return refundCredits;
}
