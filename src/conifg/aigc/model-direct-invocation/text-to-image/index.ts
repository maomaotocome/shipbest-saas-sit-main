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
  calculateCredits as calculateFluxProUltraCredits,
  calculateQuantity as calculateFluxProUltraQuantity,
  getFluxProUltraModel,
  type FluxProUltraModel,
} from "./models/flux-pro-ultra";

import {
  calculateCredits as calculateImagen4Credits,
  calculateQuantity as calculateImagen4Quantity,
  getImagen4Model,
  type Imagen4Model,
} from "./models/imagen4";

import {
  calculateCredits as calculateGPT4oCredits,
  calculateQuantity as calculateGPT4oQuantity,
  getGPT4oModel,
  type GPT4oModel,
} from "./models/gpt4o";

// Unified model code enum
export enum TextToImageModelCode {
  fluxDev = "flux-dev",
  fluxSchnell = "flux-schnell",
  fluxProUltra = "flux-pro-v1.1-ultra",
  imagen4 = "imagen4",
  gpt4o = "gpt-4o-image",
}

// Unified model type
export type Model = FluxDevModel | FluxSchnellModel | FluxProUltraModel | Imagen4Model | GPT4oModel;

// Get all models
export function getTextToImageModels(locale = defaultLocale as Locale): Model[] {
  return [
    getImagen4Model(locale),
    getFluxDevModel(locale),
    getFluxSchnellModel(locale),
    getFluxProUltraModel(locale),
    getGPT4oModel(locale),
  ];
}

// Calculate model credits
export function calculateModelCredits(
  modelCode: TextToImageModelCode,
  request: JsonObject
): number {
  switch (modelCode) {
    case TextToImageModelCode.fluxDev:
      return calculateFluxDevCredits(request);
    case TextToImageModelCode.fluxSchnell:
      return calculateFluxSchnellCredits(request);
    case TextToImageModelCode.fluxProUltra:
      return calculateFluxProUltraCredits(request);
    case TextToImageModelCode.imagen4:
      return calculateImagen4Credits(request);
    case TextToImageModelCode.gpt4o:
      return calculateGPT4oCredits(request);
    default:
      return 999999999;
  }
}

// Calculate model quantity
export function calculateModelQuantity(
  modelCode: TextToImageModelCode,
  request: JsonObject
): number {
  switch (modelCode) {
    case TextToImageModelCode.fluxDev:
      return calculateFluxDevQuantity(request);
    case TextToImageModelCode.fluxSchnell:
      return calculateFluxSchnellQuantity(request);
    case TextToImageModelCode.fluxProUltra:
      return calculateFluxProUltraQuantity(request);
    case TextToImageModelCode.imagen4:
      return calculateImagen4Quantity(request);
    case TextToImageModelCode.gpt4o:
      return calculateGPT4oQuantity(request);
    default:
      return 1;
  }
}
