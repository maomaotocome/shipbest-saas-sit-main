"use server";

import { getAnimeStyleSystemRequest } from "@/conifg/aigc/template/stylized/anime/system";
import { TaskType, TemplateType } from "@/lib/constants";
import { JsonObject } from "@/types/json";

export async function getSystemRequest({
  taskType,
  metadata,
}: {
  taskType: TaskType;
  metadata?: JsonObject;
}): Promise<JsonObject> {
  switch (taskType) {
    case TaskType.ModelDirectInvocation:
      return {};
    case TaskType.Template:
      const templateType = metadata?.template_type as TemplateType;
      switch (templateType) {
        case TemplateType.StylizedAnimeImage:
          return await getAnimeStyleSystemRequest(metadata);
        default:
          return { ...metadata };
      }
    default:
      return {};
  }
}
