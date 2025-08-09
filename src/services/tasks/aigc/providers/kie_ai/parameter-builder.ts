import { ModelParameterConfig, ParameterConfig, ParameterType } from "@/conifg/aigc/types";
import { getViewInfo } from "@/services/oss/objects/getViewInfo";
import { JsonObject, JsonValue } from "@/types/json";
import { getImageUrlsFromFileItems } from "../../utils/get-image-urls-from-file-items";

export async function buildKieAiRequestParameters(
  parameterConfig: ModelParameterConfig,
  userInput: JsonObject,
  userId: string
): Promise<JsonObject> {
  const requestParams: Record<string, JsonValue> = {};

  for (const param of parameterConfig.parameters) {
    const userValue = userInput[param.key];
    const finalValue = await getFinalParameterValue(
      param,
      userValue,
      userId,
      parameterConfig,
      userInput
    );

    if (finalValue !== undefined && finalValue !== null) {
      requestParams[param.key] = finalValue;
    }
  }

  return requestParams;
}

async function getFinalParameterValue(
  param: ParameterConfig,
  userValue: unknown,
  userId: string,
  parameterConfig: ModelParameterConfig,
  userInput: JsonObject
): Promise<JsonValue | undefined> {
  // if user provided value, use user value
  if (userValue !== undefined && userValue !== null) {
    return processParameterValue(param, userValue, userId, parameterConfig, userInput);
  }

  // if parameter is required and user did not provide value, use default value
  if (param.required || param.defaultValue !== undefined) {
    return processParameterValue(param, param.defaultValue, userId, parameterConfig, userInput);
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
  userId: string,
  parameterConfig: ModelParameterConfig,
  userInput: JsonObject
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
      return urls.join(",");

    case ParameterType.TEXT:
      // Special handling for imageUrls parameter (comma-separated URLs)

      const strValue = String(value);

      // Apply max length rule if configured
      if (param.text_max_length !== undefined) {
        let maxLen: number | undefined;

        if (typeof param.text_max_length === "number") {
          maxLen = param.text_max_length;
        } else if (typeof param.text_max_length === "function") {
          try {
            maxLen = param.text_max_length({ parameterConfig, userInput });
          } catch (err) {
            throw new Error(
              `Failed to evaluate text_max_length for parameter ${param.key}: ${err instanceof Error ? err.message : String(err)}`
            );
          }
        }

        if (maxLen !== undefined && strValue.length > maxLen) {
          throw new Error(
            `Parameter ${param.key} length ${strValue.length} exceeds maximum allowed ${maxLen}`
          );
        }
      }

      return strValue;

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
      if (param.aspectRatios && param.aspectRatios.length > 0) {
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

      if (!shouldShow && userInput[param.key] !== undefined && userInput[param.key] !== "") {
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
 * build KieAi request parameters for specific model
 */
export async function buildKieAiRequestForModel(
  parameterConfig: ModelParameterConfig,
  userInput: JsonObject,
  userId: string,
  callBackUrl?: string
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
  const requestParams = await buildKieAiRequestParameters(parameterConfig, userInput, userId);

  // Add callback URL if provided
  if (callBackUrl) {
    requestParams.callBackUrl = callBackUrl;
  }

  return {
    requestParams,
    validation: { valid: true, errors: [] },
  };
}
