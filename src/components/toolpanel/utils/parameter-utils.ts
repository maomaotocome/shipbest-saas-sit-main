"use client";
import type { FileItemInfo } from "@/components/common/uploader/types";
import { getAnimeStyleTemplate } from "@/conifg/aigc/template/stylized/anime";
import type { BaseModel } from "@/conifg/aigc/types";
import { ParameterType } from "@/conifg/aigc/types";
import { Locale } from "@/i18n/locales";
import { TemplateType } from "@/lib/constants";
import { JsonObject } from "@/types/json";

// Type definition for template (moved from UnifiedInvoker/types.ts)
export type Template = BaseModel;

/**
 * Get template configuration based on template type
 * @param templateType template type
 * @param locale locale
 * @returns template configuration
 */
export const getTemplateForType = (templateType: TemplateType, locale: Locale): Template => {
  switch (templateType) {
    case TemplateType.StylizedAnimeImage:
      return getAnimeStyleTemplate(locale);
    default:
      throw new Error(`Unknown template type: ${templateType}`);
  }
};

/**
 * Get default template request based on template type
 * @param templateType template type
 * @param locale locale
 * @returns default request object
 */
export const getDefaultTemplateRequest = (
  templateType: TemplateType,
  locale: Locale
): JsonObject => {
  const template = getTemplateForType(templateType, locale);
  return generateDefaultRequest(template);
};

/**
 * Auto generate default request object based on parameter config
 * Works for both templates and models as they share the same BaseModel structure
 * @param config template or model config object
 * @returns default request object
 */
export function generateDefaultRequest(config: BaseModel): JsonObject {
  const defaultRequest: JsonObject = {};
  // iterate over parameter config and set default value
  config.parameterConfig.parameters.forEach((param) => {
    if (param.defaultValue !== undefined && param.defaultValue !== null) {
      switch (param.type) {
        case ParameterType.IMAGES:
          // image type parameter, default value is empty array
          defaultRequest[param.key] = [];
          break;
        case ParameterType.TEXT:
          // text type parameter, use default value or empty string
          defaultRequest[param.key] = param.defaultValue || "";
          break;
        case ParameterType.NUMBER:
          // number type parameter, use default value
          defaultRequest[param.key] = param.defaultValue as number;
          break;
        case ParameterType.SELECT:
          // select type parameter, use default value
          defaultRequest[param.key] = param.defaultValue;
          break;
        case ParameterType.MODEL:
          // model type parameter, use default value
          defaultRequest[param.key] = param.defaultValue as string;
          break;
        case ParameterType.ASPECT_RATIO:
          // aspect ratio type parameter, use default value
          const aspectRatioValue =
            typeof param.defaultValue === "object" &&
            param.defaultValue &&
            "value" in param.defaultValue
              ? param.defaultValue.value
              : param.defaultValue;
          defaultRequest[param.key] = aspectRatioValue as string;
          break;
        case ParameterType.SEED:
          // seed type parameter, use default value or random generate
          defaultRequest[param.key] =
            (param.defaultValue as number) || Math.floor(Math.random() * 1000000);
          break;
        case ParameterType.BOOLEAN:
          // boolean type parameter, use default value or false
          defaultRequest[param.key] = (param.defaultValue as boolean) ?? false;
          break;
        default:
          // other type parameter, use default value
          defaultRequest[param.key] = param.defaultValue;
          break;
      }
    }
  });

  return defaultRequest;
}

/**
 * Legacy function name for backward compatibility
 * @deprecated Use generateDefaultRequest instead
 */
export const generateDefaultTemplateRequest = generateDefaultRequest;

/**
 * Legacy function name for backward compatibility
 * @deprecated Use generateDefaultRequest instead
 */
export const generateDefaultModelRequest = generateDefaultRequest;

/**
 * validate request object
 * @param config template or model config object
 * @param request request object
 * @returns validate result and error messages
 */
export function validateRequest(
  config: BaseModel,
  request: JsonObject
): {
  isValid: boolean;
  missingFields: string[];
  errors: string[];
} {
  const missingFields: string[] = [];
  const errors: string[] = [];

  // check required parameters
  const requiredParams = config.parameterConfig.parameters.filter((param) => param.required);

  for (const param of requiredParams) {
    const value = request[param.key];

    if (param.type === ParameterType.IMAGES) {
      // check image parameter
      if (!value || !Array.isArray(value) || value.length === 0) {
        missingFields.push(param.key);
        errors.push(`${param.label} is required`);
      } else {
        // check if images are uploaded successfully
        const hasValidImages = value.some(
          (file: unknown) =>
            file &&
            typeof file === "object" &&
            file !== null &&
            "objectId" in file &&
            (file as { objectId: string }).objectId
        );
        if (!hasValidImages) {
          errors.push(`${param.label} must be uploaded successfully`);
        }
      }
    } else {
      // check other type parameters
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        missingFields.push(param.key);
        errors.push(`${param.label} is required`);
      }
    }
  }

  return {
    isValid: missingFields.length === 0 && errors.length === 0,
    missingFields,
    errors,
  };
}

/**
 * Legacy function name for backward compatibility
 * @deprecated Use validateRequest instead
 */
export const validateTemplateRequest = validateRequest;

/**
 * strip fields from FileItemInfo that are not needed for backend
 * @param files FileItemInfo array
 * @param baseMetadata additional metadata to merge
 * @returns new array with stripped fields
 */
export function stripFileItemInfoFields(
  files: FileItemInfo[],
  baseMetadata: JsonObject = {}
): FileItemInfo[] {
  return files.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ file: _file, id: _id, previewUrl: _previewUrl, progress: _progress, ...rest }) => ({
      ...rest,
      metadata: { ...baseMetadata, ...rest.metadata },
    })
  ) as FileItemInfo[];
}
