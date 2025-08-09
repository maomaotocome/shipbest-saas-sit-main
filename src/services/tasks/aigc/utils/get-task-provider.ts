import { Provider } from "@/conifg/aigc/types";
import { TaskType } from "@/lib/constants";
import { JsonObject } from "@/types/json";
import { getModelCategory } from "./get-model-category";
import { getModelInfo } from "./get-model-info";
import { getModelsFromRequest } from "./get-models-from-request";

export async function getTaskProvider({
  metadata,
  taskType,
  request,
  systemRequest,
}: {
  metadata: JsonObject;
  taskType: TaskType;
  request: JsonObject;
  systemRequest: JsonObject;
}): Promise<Provider> {
  const modelCategory = getModelCategory({ metadata, request, systemRequest });
  if (!modelCategory) {
    throw new Error("model_category is required");
  }
  switch (taskType) {
    case TaskType.ModelDirectInvocation:
    case TaskType.Template:
      const modelCodes = getModelsFromRequest({ request, systemRequest, metadata });
      if (modelCodes.length !== 1) {
        throw new Error("Only one model is supported for model direct invocation");
      }
      const modelInfo = getModelInfo(modelCategory, modelCodes[0]);
      return modelInfo.provider;
    default:
      return Provider.unknown;
  }
}
