import { ModelCategory } from "@/lib/constants";
import { JsonObject } from "@/types/json";

/**
 * Get model_category with priority: metadata > request > systemRequest
 */
export function getModelCategory({
  metadata,
  request,
  systemRequest,
}: {
  metadata: JsonObject;
  request: JsonObject;
  systemRequest: JsonObject;
}): ModelCategory {
  return (metadata?.model_category ||
    request?.model_category ||
    systemRequest?.model_category ||
    ModelCategory.Unknown) as ModelCategory;
}
