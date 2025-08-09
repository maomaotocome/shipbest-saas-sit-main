import { ModelCategory, TaskType } from "@/lib/constants";
import { JsonObject } from "@/types/json";
import { combineRequest } from "../../utils/combine-request";
import { getModelCategory } from "../../utils/get-model-category";
import { getModelInfo } from "../../utils/get-model-info";
import { getModelsFromRequest } from "../../utils/get-models-from-request";
import { submitOpenAINextTask } from "./index";
import {
  buildOpenAINextRequestParameters,
  validateOpenAINextParameters,
} from "./parameter-builder";

/**
 * Unified OpenAI Next task runner for all task types
 */
export async function runOpenAINextTask({
  taskType,
  request,
  systemRequest,
  metadata,
  taskId,
  subTaskId,
  userId,
}: {
  taskType: TaskType;
  request: JsonObject;
  systemRequest: JsonObject;
  metadata: JsonObject;
  taskId: string;
  subTaskId: string;
  userId: string;
}) {
  // Extract and validate model information
  const modelCodes = getModelsFromRequest({ request, systemRequest, metadata });

  if (modelCodes.length !== 1) {
    throw new Error("Only one model is supported for model direct invocation");
  }

  const modelCode = modelCodes[0];
  const modelCategory = getModelCategory({ metadata, request, systemRequest });
  if (!modelCategory) {
    throw new Error("model_category is required");
  }
  const modelInfo = getModelInfo(modelCategory, modelCode);
  if (!modelInfo) {
    throw new Error(`Model not found: ${modelCode}`);
  }

  // Combine parameters using the original combineRequest method
  const combinedParams = await combineRequest({ taskType, metadata, request, systemRequest });

  // Validate parameters first
  const validation = validateOpenAINextParameters({
    modelCategory: modelInfo.modelCategory as ModelCategory,
    combinedParams,
  });

  if (!validation.valid) {
    throw new Error(`Parameter validation failed: ${validation.errors.join(", ")}`);
  }

  // Build provider-specific parameters
  const providerParams = await buildOpenAINextRequestParameters({
    modelCategory: modelInfo.modelCategory as ModelCategory,
    combinedParams,
    userId,
  });

  // Submit task to OpenAI Next
  return await submitOpenAINextTask(
    modelInfo.providerModel,
    providerParams as { prompt: string; images_url?: string[] },
    taskId,
    subTaskId
  );
}
