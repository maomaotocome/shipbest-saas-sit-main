import { ModelParameterConfig, ResultType } from "@/conifg/aigc/types";
import { JsonObject } from "@/types/json";
import { buildKieAiRequestForModel } from "./parameter-builder";

const KIE_AI_BASE_URL = "https://api.kie.ai";

export interface KieAiSubmitResult {
  success: boolean;
  taskId?: string;
  error?: string;
  data?: JsonObject;
}

export async function submitKieAiApiTaskWithConfig({
  endpoint,
  parameterConfig,
  userInput,
  taskId,
  subTaskId,
  userId,
  resultType,
}: {
  endpoint: string;
  parameterConfig: ModelParameterConfig;
  userInput: JsonObject;
  taskId: string;
  subTaskId: string;
  userId: string;
  resultType: ResultType;
}) {
  // Construct callback URL
  const callBackUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/ai/webhook/kie-ai/${taskId}/${subTaskId}/${resultType}`;

  // Build request parameters
  const { requestParams, validation } = await buildKieAiRequestForModel(
    parameterConfig,
    userInput,
    userId,
    callBackUrl
  );

  // If parameter validation failed, throw error
  if (!validation.valid) {
    throw new Error(`Parameter validation failed: ${validation.errors.join(", ")}`);
  }

  // Get API key
  const apiKey = process.env.KIE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("KIE_AI_API_KEY is not configured");
  }

  const result = await submitToKieAi(endpoint, requestParams, apiKey);

  if (!result.success) {
    throw new Error(result.error || "Failed to submit task to Kie.ai");
  }

  // Return the Kie.ai task ID for tracking
  return {
    kie_ai_task_id: result.taskId,
  };
}

export async function submitToKieAi(
  endpoint: string,
  parameters: JsonObject,
  apiKey: string
): Promise<KieAiSubmitResult> {
  try {
    const response = await fetch(`${KIE_AI_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      body: JSON.stringify(parameters),
    });

    const data = await response.json();

    // Check if the response indicates success based on Kie.ai's format
    if (data.code !== 200) {
      return {
        success: false,
        error: data.msg || `Kie.ai API error (code: ${data.code})`,
        data,
      };
    }

    // Extract taskId from the response
    const taskId = data.data?.taskId || data.data?.task_id;

    return {
      success: true,
      taskId,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getVeo31080pVideo(
  taskId: string,
  apiKey: string
): Promise<KieAiSubmitResult> {
  try {
    const response = await fetch(`${KIE_AI_BASE_URL}/api/v1/veo/get-1080p-video?taskId=${taskId}`, {
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
