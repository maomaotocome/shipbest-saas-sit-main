import { defaultLocale, Locale } from "@/i18n/locales";
import { JsonObject } from "@/types/json";

// Import individual models
import {
  calculateCredits as calculateHailuo02ProTextCredits,
  calculateQuantity as calculateHailuo02ProTextQuantity,
  getHailuo02ProTextModel,
  type Hailuo02ProTextModel,
} from "./models/hailuo02pro-text_fal";
import {
  calculateCredits as calculateKling21Credits,
  calculateQuantity as calculateKling21Quantity,
  getKling21Model,
  type Kling21Model,
} from "./models/kling21master";
import {
  calculateCredits as calculateVeo3Credits,
  calculateQuantity as calculateVeo3Quantity,
  getVeo3Model,
  type Veo3Model,
} from "./models/veo3_fal";
import {
  calculateCredits as calculateVeo3KieAiCredits,
  calculateQuantity as calculateVeo3KieAiQuantity,
  getVeo3KieAiModel,
  type Veo3KieAiModel,
} from "./models/veo3_kie-ai";

// Unified model code enum
export enum TextToVideoModelCode {
  kling = "kling",
  kling21master = "kling21master",
  veo3 = "veo3",
  veo3_kie_ai = "veo3_kie_ai",
  hailuo02ProText = "hailuo02pro-text",
}

// Unified model type
export type Model = Kling21Model | Veo3Model | Veo3KieAiModel | Hailuo02ProTextModel;

// Get all models
export function getTextToVideoModels(locale = defaultLocale as Locale): Model[] {
  return [
    getKling21Model(locale),
    getVeo3Model(locale),
    getVeo3KieAiModel(locale),
    getHailuo02ProTextModel(locale),
  ];
}

// Calculate model credits
export function calculateModelCredits(
  modelCode: TextToVideoModelCode,
  request: JsonObject
): number {
  switch (modelCode) {
    case TextToVideoModelCode.kling21master:
      return calculateKling21Credits(request);
    case TextToVideoModelCode.veo3:
      return calculateVeo3Credits(request);
    case TextToVideoModelCode.veo3_kie_ai:
      return calculateVeo3KieAiCredits(request);
    case TextToVideoModelCode.hailuo02ProText:
      return calculateHailuo02ProTextCredits(request);
    default:
      return 999999999;
  }
}

// Calculate model quantity
export function calculateModelQuantity(
  modelCode: TextToVideoModelCode,
  request: JsonObject
): number {
  switch (modelCode) {
    case TextToVideoModelCode.kling21master:
      return calculateKling21Quantity(request);
    case TextToVideoModelCode.veo3:
      return calculateVeo3Quantity(request);
    case TextToVideoModelCode.veo3_kie_ai:
      return calculateVeo3KieAiQuantity(request);
    case TextToVideoModelCode.hailuo02ProText:
      return calculateHailuo02ProTextQuantity(request);
    default:
      return 1;
  }
}

// Calculate quantity for text-to-video models
export function calculateQuantity(request: JsonObject): number {
  const num_videos = (request.num_videos as number) || 1;
  return num_videos;
}
