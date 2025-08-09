import { JsonObject } from "@/types/json";
import { TaskType } from "@/lib/constants";
import { getModelInfo } from "../../utils/get-model-info";
import { handleKieAiWebhook, KieAiWebhookData } from "./webhook-handler";

const KIE_AI_BASE_URL = "https://api.kie.ai";

export interface KieAiRecallResult {
  success: boolean;
  data?: JsonObject;
  error?: string;
}

export interface RecallKieAiTaskParams {
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

export async function recallKieAiTask(params: RecallKieAiTaskParams): Promise<KieAiRecallResult> {
  const { metadata, subTask, taskId, subTaskId } = params;

  try {
    // Get model information
    const { getModelCategory } = await import("../../utils/get-model-category");
    const { getModelsFromRequest } = await import("../../utils/get-models-from-request");
    
    const modelCodes = getModelsFromRequest({ request: params.request, systemRequest: params.systemRequest, metadata });
    if (modelCodes.length !== 1) {
      return {
        success: false,
        error: "Multiple models not supported for recall",
      };
    }
    
    const modelCode = modelCodes[0];
    const modelCategory = getModelCategory({ metadata, request: params.request, systemRequest: params.systemRequest });
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

    // Get kie_ai_task_id from subtask response (stored during run task)
    const subTaskResponse = subTask.response;
    if (!subTaskResponse) {
      return {
        success: false,
        error: "No response found in subtask. Task may not have been submitted properly.",
      };
    }

    const kieAiTaskId = subTaskResponse.kie_ai_task_id as string;
    if (!kieAiTaskId) {
      return {
        success: false,
        error: "KIE AI Task ID not found in subtask response. Task may not have been submitted properly.",
      };
    }

    // Determine query endpoint
    const providerModel = modelInfo.providerModel;
    let queryEndpoint: string;
    
    if (providerModel === "veo3") {
      queryEndpoint = "/api/v1/veo/record-info";
    } else if (providerModel === "suno") {
      queryEndpoint = "/api/v1/generate/record-info";
    } else {
      return {
        success: false,
        error: `Unsupported KIE AI model for recall: ${providerModel}`,
      };
    }

    // Query KIE.AI task result
    const result = await retrieveKieAiTaskResult(kieAiTaskId, queryEndpoint);
    
    if (!result.success) {
      return result;
    }

    // Check task status and process result if completed
    const taskData = result.data;
    if (!taskData || typeof taskData !== 'object') {
      return {
        success: false,
        error: "Invalid response data from KIE.AI",
      };
    }

    const taskDataObj = taskData as JsonObject;
    const innerData = taskDataObj.data as JsonObject;
    
    // KIE.AI uses 'successFlag' field to indicate task status
    // successFlag: 1 = completed successfully, 0 = failed, undefined/null = still processing
    const successFlag = innerData?.successFlag;
    const responseCode = taskDataObj.code;

    if (responseCode === 200 && successFlag === 1) {
      // Use existing webhook handler to process result
      await handleKieAiWebhook({
        webhookData: taskDataObj as unknown as KieAiWebhookData,
        taskId,
        subTaskId,
        resultType: modelInfo.resultType,
      });

      return {
        success: true,
        data: taskData,
      };
    } else if (responseCode === 200 && successFlag === 0) {
      // Task failed, update subtask status
      await handleKieAiWebhook({
        webhookData: taskDataObj as unknown as KieAiWebhookData,
        taskId,
        subTaskId,
        resultType: modelInfo.resultType,
      });

      return {
        success: false,
        error: "Task failed on provider side",
        data: taskData,
      };
    } else if (responseCode !== 200) {
      // API call failed
      return {
        success: false,
        error: `KIE.AI API error: ${taskDataObj.msg || 'Unknown error'}`,
        data: taskData,
      };
    } else {
      // Task is still processing (successFlag is undefined/null)
      return {
        success: false,
        error: "Task is still processing",
        data: taskData,
      };
    }

  } catch (error) {
    console.error("Failed to recall KIE AI task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function retrieveKieAiTaskResult(
  taskId: string,
  endpoint: string
): Promise<KieAiRecallResult> {
  const apiKey = process.env.KIE_AI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "KIE_AI_API_KEY is not configured",
    };
  }

  try {
    const response = await fetch(`${KIE_AI_BASE_URL}${endpoint}?taskId=${taskId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.msg || `HTTP ${response.status}: ${response.statusText}`,
        data,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function retrieveVeo3TaskResult(taskId: string): Promise<KieAiRecallResult> {
  return retrieveKieAiTaskResult(taskId, "/api/v1/veo/record-info");
}

export async function retrieveSunoTaskResult(taskId: string): Promise<KieAiRecallResult> {
  return retrieveKieAiTaskResult(taskId, "/api/v1/generate/record-info");
}