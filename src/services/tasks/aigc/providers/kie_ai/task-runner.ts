import { TaskType } from "@/lib/constants";
import { JsonObject } from "@/types/json";
import { combineRequest } from "../../utils/combine-request";
import { getModelCategory } from "../../utils/get-model-category";
import { getModelInfo } from "../../utils/get-model-info";
import { getModelsFromRequest } from "../../utils/get-models-from-request";
import { submitKieAiApiTaskWithConfig } from "./submit";

/**
 * Unified KieAi task runner for all task types
 */
export async function runKieAiTask({
  taskType,
  request,
  taskId,
  subTaskId,
  userId,
  metadata,
  systemRequest,
}: {
  taskType: TaskType;
  request: JsonObject;
  metadata: JsonObject;
  systemRequest: JsonObject;
  taskId: string;
  subTaskId: string;
  userId: string;
}) {
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

  return await submitKieAiApiTaskWithConfig({
    endpoint: (modelInfo.extra?.endpoint as string) || "/api/v1/generate",
    parameterConfig: modelInfo.parameterConfig,
    userInput: await combineRequest({ taskType, metadata, request, systemRequest }),
    taskId,
    subTaskId,
    userId,
    resultType: modelInfo.resultType,
  });
}
