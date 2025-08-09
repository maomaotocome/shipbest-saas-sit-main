import { defaultLocale, Locale } from "@/i18n/locales";
import { JsonObject } from "@/types/json";

import {
  calculateCredits as calculateFluxDevCredits,
  calculateQuantity as calculateFluxDevQuantity,
  getFluxDevModel,
  type FluxDevModel,
} from "./models/flux-dev";

import {
  calculateCredits as calculateFluxSchnellCredits,
  calculateQuantity as calculateFluxSchnellQuantity,
  getFluxSchnellModel,
  type FluxSchnellModel,
} from "./models/flux-schnell";

import {
  calculateCredits as calculateGPT4oCredits,
  calculateQuantity as calculateGPT4oQuantity,
  getGPT4oModel,
  type GPT4oModel,
} from "./models/gpt4o";

import {
  calculateCredits as calculateFluxProKontextMaxMultiCredits,
  calculateQuantity as calculateFluxProKontextMaxMultiQuantity,
  getFluxProKontextMaxMultiModel,
  type FluxProKontextMaxMultiModel,
} from "./models/flux-pro-kontext-max-multi";

// Unified model code enum
export enum ImageToImageModelCode {
  fluxDev = "fal-ai/flux/dev/image-to-image",
  fluxSchnell = "fal-ai/flux/schnell/image-to-image",
  gpt4o = "gpt-4o-image",
  fluxProKontextMaxMulti = "fal-ai/flux-pro/kontext/max/multi",
}

// Unified model type
export type Model = FluxDevModel | FluxSchnellModel | GPT4oModel | FluxProKontextMaxMultiModel;

// Get all models
export function getImageToImageModels(locale = defaultLocale as Locale): Model[] {
  return [
    getFluxDevModel(locale),
    getFluxSchnellModel(locale),
    getGPT4oModel(locale),
    getFluxProKontextMaxMultiModel(locale),
  ];
}

// Calculate model credits
export function calculateModelCredits(
  modelCode: ImageToImageModelCode,
  request: JsonObject
): number {
  switch (modelCode) {
    case ImageToImageModelCode.fluxDev:
      return calculateFluxDevCredits(request);
    case ImageToImageModelCode.fluxSchnell:
      return calculateFluxSchnellCredits(request);
    case ImageToImageModelCode.gpt4o:
      return calculateGPT4oCredits(request);
    case ImageToImageModelCode.fluxProKontextMaxMulti:
      return calculateFluxProKontextMaxMultiCredits(request);
    default:
      return 999999999;
  }
}

// Calculate model quantity
export function calculateModelQuantity(
  modelCode: ImageToImageModelCode,
  request: JsonObject
): number {
  switch (modelCode) {
    case ImageToImageModelCode.fluxDev:
      return calculateFluxDevQuantity(request);
    case ImageToImageModelCode.fluxSchnell:
      return calculateFluxSchnellQuantity(request);
    case ImageToImageModelCode.gpt4o:
      return calculateGPT4oQuantity(request);
    case ImageToImageModelCode.fluxProKontextMaxMulti:
      return calculateFluxProKontextMaxMultiQuantity(request);
    default:
      return 1;
  }
}

// Calculate quantity for image-to-image models
export function calculateQuantity(request: JsonObject): number {
  const num_images = (request.num_images as number) || 1;
  return num_images;
}
