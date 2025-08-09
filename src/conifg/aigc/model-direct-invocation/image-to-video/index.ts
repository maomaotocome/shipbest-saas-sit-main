import { defaultLocale, Locale } from "@/i18n/locales";
import { JsonObject } from "@/types/json";

// Import individual models
import {
  calculateCredits as calculateHailuo02ProCredits,
  calculateQuantity as calculateHailuo02ProQuantity,
  getHailuo02ProModel,
  type Hailuo02ProModel,
} from "./models/hailuo02pro";

import {
  calculateCredits as calculateVeo3KieAiCredits,
  calculateQuantity as calculateVeo3KieAiQuantity,
  getVeo3KieAiModel,
  type Veo3KieAiModel,
} from "./models/veo3_kie-ai";

// Unified model code enum
export enum ImageToVideoModelCode {
  kling = "kling",
  hailuo02pro = "hailuo02pro",
  veo3_kie_ai = "veo3_kie_ai",
}

// Unified model type
export type Model = Hailuo02ProModel | Veo3KieAiModel;

// Get all models
export function getImageToVideoModels(locale = defaultLocale as Locale): Model[] {
  return [getHailuo02ProModel(locale), getVeo3KieAiModel(locale)];
}

// Calculate model credits
export function calculateModelCredits(
  modelCode: ImageToVideoModelCode,
  request: JsonObject
): number {
  switch (modelCode) {
    case ImageToVideoModelCode.hailuo02pro:
      return calculateHailuo02ProCredits(request);
    case ImageToVideoModelCode.veo3_kie_ai:
      return calculateVeo3KieAiCredits(request);
    default:
      return 999999999;
  }
}

// Calculate model quantity
export function calculateModelQuantity(
  modelCode: ImageToVideoModelCode,
  request: JsonObject
): number {
  switch (modelCode) {
    case ImageToVideoModelCode.hailuo02pro:
      return calculateHailuo02ProQuantity(request);
    case ImageToVideoModelCode.veo3_kie_ai:
      return calculateVeo3KieAiQuantity(request);
    default:
      return 1;
  }
}
