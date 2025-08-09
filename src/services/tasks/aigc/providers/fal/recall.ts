import { TaskType } from "@/lib/constants";
import { JsonObject } from "@/types/json";
import { fal } from "@fal-ai/client";
import { getModelInfo } from "../../utils/get-model-info";
import { handleFalWebhook, WebhookResponse } from "./webhook-handler";

export interface FalRecallResult {
  success: boolean;
  data?: JsonObject;
  error?: string;
}

export interface RecallFalTaskParams {
  taskType: TaskType;
  metadata: JsonObject;
  systemRequest: JsonObject;
  request: JsonObject;
  taskId: string;
  subTaskId: string;
  userId: string;
  subTask: {
    id: string;
    response: JsonObject | null;
    [key: string]: unknown;
  };
}

export async function recallFalTask(params: RecallFalTaskParams): Promise<FalRecallResult> {
  const { metadata, subTask, taskId, subTaskId } = params;

  try {
    // Get model information
    const { getModelCategory } = await import("../../utils/get-model-category");
    const { getModelsFromRequest } = await import("../../utils/get-models-from-request");

    const modelCodes = getModelsFromRequest({
      request: params.request,
      systemRequest: params.systemRequest,
      metadata,
    });
    if (modelCodes.length !== 1) {
      return {
        success: false,
        error: "Multiple models not supported for recall",
      };
    }

    const modelCode = modelCodes[0];
    const modelCategory = getModelCategory({
      metadata,
      request: params.request,
      systemRequest: params.systemRequest,
    });
    if (!modelCategory) {
      return {
        success: false,
        error: "Model category not found",
      };
    }

    const modelInfo = getModelInfo(modelCategory, modelCode);
    if (!modelInfo) {
      return {
        success: false,
        error: "Model information not found",
      };
    }

    const falModel = modelInfo.providerModel;

    // Get request_id from subtask response (stored during run task)
    const subTaskResponse = subTask.response;
    if (!subTaskResponse) {
      return {
        success: false,
        error: "No response found in subtask. Task may not have been submitted properly.",
      };
    }

    const requestId = subTaskResponse.request_id as string;
    if (!requestId) {
      return {
        success: false,
        error:
          "Request ID not found in subtask response. Task may not have been submitted properly.",
      };
    }

    // Query FAL task result
    const result = await retrieveFalTaskResult(falModel, requestId);

    if (!result.success) {
      return result;
    }

    // Simulate webhook processing to save result to database
    // Transform FAL recall response to match webhook format
    const falData = result.data as JsonObject;
    const webhookPayload = falData?.data ? {
      images: (falData.data as JsonObject)?.images,
      video: (falData.data as JsonObject)?.video,
      seed: (falData.data as JsonObject)?.seed,
    } : falData;

    const webhookData = {
      request_id: requestId,
      gateway_request_id: requestId,
      status: "OK" as const,
      payload: webhookPayload,
    };

    // Use existing webhook handler to process result
    await handleFalWebhook({
      body: webhookData as unknown as WebhookResponse,
      taskId,
      subTaskId,
      resultType: modelInfo.resultType,
    });

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Failed to recall FAL task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function retrieveFalTaskResult(
  falModel: string,
  requestId: string
): Promise<FalRecallResult> {
  fal.config({
    credentials: process.env.FAL_API_KEY as string,
  });

  try {
    const result = await fal.queue.result(falModel, {
      requestId: requestId,
    });
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getFalTaskStatus(
  falModel: string,
  requestId: string
): Promise<FalRecallResult> {
  fal.config({
    credentials: process.env.FAL_API_KEY as string,
  });

  try {
    const status = await fal.queue.status(falModel, {
      requestId: requestId,
      logs: true,
    });
    return {
      success: true,
      data: status as unknown as JsonObject,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
