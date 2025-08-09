import { defaultLocale, Locale } from "@/i18n/locales";
import { JsonObject } from "@/types/json";

// Import individual models
import {
  calculateCredits as calculateSunoCredits,
  calculateQuantity as calculateSunoQuantity,
  getSunoModel,
  type SunoModel,
} from "./models/suno_kie_ai";

// Unified model code enum
export enum TextToMusicModelCode {
  suno_kie_ai = "suno_kie_ai",
}

// Unified model type
export type Model = SunoModel;

// Get all models
export function getTextToMusicModels(locale = defaultLocale as Locale): Model[] {
  return [getSunoModel(locale)];
}

// Calculate model credits
export function calculateModelCredits(
  modelCode: TextToMusicModelCode,
  request: JsonObject
): number {
  switch (modelCode) {
    case TextToMusicModelCode.suno_kie_ai:
      return calculateSunoCredits(request);
    default:
      return 999999999;
  }
}

// Calculate model quantity
export function calculateModelQuantity(
  modelCode: TextToMusicModelCode,
  request: JsonObject
): number {
  switch (modelCode) {
    case TextToMusicModelCode.suno_kie_ai:
      return calculateSunoQuantity(request);
    default:
      return 1;
  }
}

// Calculate quantity for text-to-music models
export function calculateQuantity(request: JsonObject): number {
  const num_outputs = (request.num_outputs as number) || 2;
  return num_outputs;
}
