import { combineAnimeStyleRequest } from "@/conifg/aigc/template/stylized/anime/system";
import { TaskType, TemplateType } from "@/lib/constants";
import { JsonObject } from "@/types/json";

export async function combineRequest({
  taskType,
  metadata,
  request,
  systemRequest,
}: {
  taskType: TaskType;
  metadata: JsonObject;
  request: JsonObject;
  systemRequest: JsonObject;
}): Promise<JsonObject> {
  switch (taskType) {
    case TaskType.ModelDirectInvocation:
      return request;
    case TaskType.Template:
      const templateType = metadata.template_type as TemplateType;
      switch (templateType) {
        case TemplateType.StylizedAnimeImage:
          return await combineAnimeStyleRequest({ request, systemRequest });
        default:
          return {
            ...request,
            ...systemRequest,
          };
      }
    default:
      return request;
  }
}
