import { JsonObject } from "@/types/json";

export function getModelsFromRequest({
  request,
  systemRequest,
  metadata,
}: {
  request: JsonObject;
  systemRequest?: JsonObject;
  metadata: JsonObject;
}): string[] {
  // Priority: metadata.model > metadata.models > request.model > request.models > systemRequest.model > systemRequest.models
  let modelCodes: string[] = [];

  if (metadata?.model) {
    modelCodes = [metadata.model as string];
  } else if (metadata?.models && Array.isArray(metadata.models)) {
    modelCodes = metadata.models as string[];
  } else if (request.model) {
    modelCodes = [request.model as string];
  } else if (request.models && Array.isArray(request.models)) {
    modelCodes = request.models as string[];
  } else if (systemRequest?.model) {
    modelCodes = [systemRequest.model as string];
  } else if (systemRequest?.models && Array.isArray(systemRequest.models)) {
    modelCodes = systemRequest.models as string[];
  }

  if (!Array.isArray(modelCodes)) {
    throw new Error("models must be an array");
  }
  return modelCodes;
}
