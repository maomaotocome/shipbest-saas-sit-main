import { getImageToImageModels } from "@/conifg/aigc/model-direct-invocation/image-to-image";
import { getImageToVideoModels } from "@/conifg/aigc/model-direct-invocation/image-to-video";
import { getTextToImageModels } from "@/conifg/aigc/model-direct-invocation/text-to-image";
import { getTextToMusicModels } from "@/conifg/aigc/model-direct-invocation/text-to-music";
import { getTextToVideoModels } from "@/conifg/aigc/model-direct-invocation/text-to-video";
import { ModelCategory } from "@/lib/constants";

export function getModelInfo(modelCategory: ModelCategory, modelCode: string) {
  const getModelsFunction =
    modelCategory === "text-to-image"
      ? getTextToImageModels
      : modelCategory === "image-to-image"
        ? getImageToImageModels
        : modelCategory === "text-to-video"
          ? getTextToVideoModels
          : modelCategory === "text-to-music"
            ? getTextToMusicModels
            : modelCategory === "image-to-video"
              ? getImageToVideoModels
              : null;

  if (!getModelsFunction) {
    throw new Error(`Unsupported model category: ${modelCategory}`);
  }

  const modelInfo = getModelsFunction().find((model) => model.code === modelCode);

  if (!modelInfo) {
    throw new Error(`Model not found: ${modelCode}`);
  }

  return modelInfo;
}
