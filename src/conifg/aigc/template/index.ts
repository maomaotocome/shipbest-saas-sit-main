import { defaultLocale, Locale } from "@/i18n/locales";
import { TemplateType } from "@/lib/constants";
import { JsonObject } from "@/types/json";

// Import template types
import {
  calculateCredits as calculateAnimeStyleCredits,
  calculateQuantity as calculateAnimeStyleQuantity,
  getAnimeStyleTemplate,
  type AnimeStyleTemplate,
} from "./stylized/anime";

import {
  calculateCredits as calculateImageCombineCredits,
  calculateQuantity as calculateImageCombineQuantity,
  getImageCombineTemplate,
  type ImageCombineTemplate,
} from "./image/combine";

// Unified template type
export type Template = AnimeStyleTemplate | ImageCombineTemplate;

// Get all templates
export function getTemplates(locale = defaultLocale as Locale): Template[] {
  return [
    getAnimeStyleTemplate(locale),
    getImageCombineTemplate(locale),
    // Add more templates here as needed
  ];
}

// Calculate template credits (similar to calculateModelCredits for ModelCategory)
export function calculateTemplateCredits(
  templateType: TemplateType,
  request: JsonObject,
  systemRequest?: JsonObject
): number {
  switch (templateType) {
    case TemplateType.StylizedAnimeImage:
      return calculateAnimeStyleCredits(request, systemRequest);
    case TemplateType.CombineImages:
      return calculateImageCombineCredits(request, systemRequest);
    case TemplateType.StylizedAnimeVideo:
      // TODO: Implement when video template is ready
      throw new Error(`Template type ${templateType} not implemented yet`);
    default:
      throw new Error(`Unsupported template type: ${templateType}`);
  }
}

// Calculate template quantity
export function calculateTemplateQuantity(
  templateType: TemplateType,
  request: JsonObject,
  systemRequest?: JsonObject
): number {
  switch (templateType) {
    case TemplateType.StylizedAnimeImage:
      return calculateAnimeStyleQuantity(request, systemRequest);
    case TemplateType.CombineImages:
      return calculateImageCombineQuantity(request, systemRequest);
    case TemplateType.StylizedAnimeVideo:
      // TODO: Implement when video template is ready
      return 1;
    default:
      return 1;
  }
}

// Get template by type
export function getTemplateByType(
  templateType: TemplateType,
  locale = defaultLocale as Locale
): Template {
  switch (templateType) {
    case TemplateType.StylizedAnimeImage:
      return getAnimeStyleTemplate(locale);
    case TemplateType.CombineImages:
      return getImageCombineTemplate(locale);
    case TemplateType.StylizedAnimeVideo:
      // TODO: Implement when video template is ready
      throw new Error(`Template type ${templateType} not implemented yet`);
    default:
      throw new Error(`Unsupported template type: ${templateType}`);
  }
}
