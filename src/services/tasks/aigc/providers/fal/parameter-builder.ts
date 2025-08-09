import { ModelParameterConfig, ParameterConfig, ParameterType } from "@/conifg/aigc/types";
import { getViewInfo } from "@/services/oss/objects/getViewInfo";
import { JsonObject, JsonValue } from "@/types/json";
import { getImageUrlsFromFileItems } from "../../utils/get-image-urls-from-file-items";

export async function buildFalRequestParameters(
  parameterConfig: ModelParameterConfig,
  userInput: JsonObject,
  userId: string
): Promise<JsonObject> {
  const requestParams: Record<string, JsonValue> = {};

  for (const param of parameterConfig.parameters) {
    const userValue = userInput[param.key];
    const finalValue = await getFinalParameterValue(param, userValue, userId);

    if (finalValue !== undefined && finalValue !== null) {
      requestParams[param.key] = finalValue;
    }
  }

  return requestParams;
}

async function getFinalParameterValue(
  param: ParameterConfig,
  userValue: unknown,
  userId: string
): Promise<JsonValue | undefined> {
  // if user provided value, use user value
  if (userValue !== undefined && userValue !== null) {
    return processParameterValue(param, userValue, userId);
  }

  // if parameter is required and user did not provide value, use default value
  if (param.required || param.defaultValue !== undefined) {
    return processParameterValue(param, param.defaultValue, userId);
  }

  // if parameter is optional and user did not provide value, return undefined
  return undefined;
}

/**
 * process parameter value, ensure type is correct
 */
async function processParameterValue(
  param: ParameterConfig,
  value: unknown,
  userId: string
): Promise<JsonValue> {
  switch (param.type) {
    case ParameterType.IMAGES:
      if (param.image_count && value && Array.isArray(value)) {
        if (value.length > param.image_count) {
          throw new Error(
            `Invalid image count for parameter ${param.key}: ${value.length}. Max: ${param.image_count}`
          );
        }
      }
      const urls = await getImageUrlsFromFileItems(value, userId, getViewInfo);
      return urls.length === 1 ? urls[0] : urls;

    case ParameterType.TEXT:
      return String(value);

    case ParameterType.NUMBER:
      const numValue = Number(value);
      if (isNaN(numValue)) {
        throw new Error(`Invalid number value for parameter ${param.key}: ${value}`);
      }

      // apply value range limit
      let clampedValue = numValue;
      if (param.min !== undefined) {
        clampedValue = Math.max(clampedValue, param.min);
      }
      if (param.max !== undefined) {
        clampedValue = Math.min(clampedValue, param.max);
      }

      // apply step
      if (param.step !== undefined && param.step > 0) {
        const steps = Math.round((clampedValue - (param.min || 0)) / param.step);
        clampedValue = (param.min || 0) + steps * param.step;
      }

      return clampedValue;

    case ParameterType.BOOLEAN:
      return Boolean(value);

    case ParameterType.SELECT:
      // validate select value is in allowed options
      if (param.options && param.options.length > 0) {
        const validValues = param.options.map((opt) => opt.value);
        if (!validValues.includes(value as string | number | boolean)) {
          throw new Error(
            `Invalid select value for parameter ${param.key}: ${value}. Valid options: ${validValues.join(", ")}`
          );
        }
      }
      return value as string | number | boolean;

    case ParameterType.ASPECT_RATIO:
      const aspectRatioValue = String(value);
      // validate aspect ratio is in allowed options
      if (!param.allowCustomRatio && param.aspectRatios && param.aspectRatios.length > 0) {
        const validValues = param.aspectRatios.map((ar) => ar.value);
        if (!validValues.includes(aspectRatioValue)) {
          throw new Error(
            `Invalid aspect ratio for parameter ${param.key}: ${value}. Valid options: ${validValues.join(", ")}`
          );
        }
      }
      return aspectRatioValue;

    default:
      return String(value);
  }
}

/**
 * validate parameter dependencies
 */
export function validateParameterDependencies(
  parameterConfig: ModelParameterConfig,
  userInput: JsonObject
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const param of parameterConfig.parameters) {
    // check required parameters
    if (param.required && (userInput[param.key] === undefined || userInput[param.key] === null)) {
      errors.push(`Required parameter ${param.key} is missing`);
    }

    // check parameter dependencies
    if (param.dependencies && param.dependencies.length > 0) {
      for (const dependency of param.dependencies) {
        if (userInput[dependency] === undefined || userInput[dependency] === null) {
          errors.push(
            `Parameter ${param.key} depends on ${dependency}, but ${dependency} is missing`
          );
        }
      }
    }

    // check display conditions
    if (param.showWhen) {
      const shouldShow = Object.entries(param.showWhen).every(([key, expectedValue]) => {
        return userInput[key] === expectedValue;
      });

      if (!shouldShow && userInput[param.key] !== undefined) {
        errors.push(`Parameter ${param.key} should not be provided when conditions are not met`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * get default parameter values
 */
export function getDefaultParameters(parameterConfig: ModelParameterConfig): JsonObject {
  const defaults: JsonObject = {};

  for (const param of parameterConfig.parameters) {
    if (param.defaultValue !== undefined) {
      defaults[param.key] = param.defaultValue;
    }
  }

  return defaults;
}

/**
 * build FAL request parameters for specific model
 */
export async function buildFalRequestForModel(
  parameterConfig: ModelParameterConfig,
  userInput: JsonObject,
  userId: string
): Promise<{
  requestParams: JsonObject;
  validation: { valid: boolean; errors: string[] };
}> {
  // validate parameters
  const validation = validateParameterDependencies(parameterConfig, userInput);

  if (!validation.valid) {
    return {
      requestParams: {},
      validation,
    };
  }

  // build request parameters
  const requestParams = await buildFalRequestParameters(parameterConfig, userInput, userId);

  return {
    requestParams,
    validation: { valid: true, errors: [] },
  };
}
