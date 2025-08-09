import { getImageToImageModels } from "@/conifg/aigc/model-direct-invocation/image-to-image";
import { getImageToVideoModels } from "@/conifg/aigc/model-direct-invocation/image-to-video";
import { getTextToImageModels } from "@/conifg/aigc/model-direct-invocation/text-to-image";
import { getTextToMusicModels } from "@/conifg/aigc/model-direct-invocation/text-to-music";
import { getTextToVideoModels } from "@/conifg/aigc/model-direct-invocation/text-to-video";
import { Locale } from "@/i18n/locales";
import { ModelCategory } from "@/lib/constants";
import { Model } from "./types";

export const getModelsForTaskType = (modelCategory: ModelCategory, locale: Locale): Model[] => {
  switch (modelCategory) {
    case "text-to-image":
      return getTextToImageModels(locale);
    case "text-to-video":
      return getTextToVideoModels(locale);
    case "text-to-music":
      return getTextToMusicModels(locale);
    case "image-to-image":
      return getImageToImageModels(locale);
    case "image-to-video":
      return getImageToVideoModels(locale);
    default:
      return [];
  }
};
