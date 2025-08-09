import { ModelCategory } from "@/lib/constants";
import { JsonObject } from "@/types/json";
import { getImageUrlsFromFileItems } from "../../utils/get-image-urls-from-file-items";

/**
 * OpenAI Next specific parameter builder for different model categories
 */
export async function buildOpenAINextRequestParameters({
  modelCategory,
  combinedParams,
  userId,
}: {
  modelCategory: ModelCategory;
  combinedParams: JsonObject;
  userId: string;
}): Promise<JsonObject> {
  switch (modelCategory) {
    case ModelCategory.TextToImage:
      return await buildTextToImageParameters(combinedParams);

    case ModelCategory.ImageToImage:
      return await buildImageToImageParameters(combinedParams, userId);

    case ModelCategory.TextToVideo:
    case ModelCategory.ImageToVideo:
      throw new Error(`OpenAI Next does not support ${modelCategory} tasks`);

    default:
      throw new Error(`Unsupported model category: ${modelCategory}`);
  }
}

/**
 * Build parameters for text-to-image tasks
 */
async function buildTextToImageParameters(combinedParams: JsonObject): Promise<JsonObject> {
  return {
    prompt: String(combinedParams.prompt || ""),
  };
}

/**
 * Build parameters for image-to-image tasks
 */
async function buildImageToImageParameters(
  combinedParams: JsonObject,
  userId: string
): Promise<JsonObject> {
  // Process image URLs
  const imageUrls = await processImageUrls(combinedParams.image_url, userId);

  // Build enhanced prompt with aspect ratio
  const aspectRatio = combinedParams.aspect_ratio || "1:1";
  const basePrompt = String(combinedParams.prompt || "");
  const enhancedPrompt = `${basePrompt}. Please generate images in ${aspectRatio} ratio.`;

  return {
    prompt: enhancedPrompt,
    images_url: imageUrls,
  };
}

/**
 * Process image URLs from user input
 */
async function processImageUrls(imageInput: unknown, userId: string): Promise<string[]> {
  // Reuse common image URL utility
  // Note: getViewInfo needs to be imported from original path
  const { getViewInfo } = await import("@/services/oss/objects/getViewInfo");
  return getImageUrlsFromFileItems(imageInput, userId, getViewInfo);
}

/**
 * Validate required parameters for OpenAI Next tasks
 */
export function validateOpenAINextParameters({
  modelCategory,
  combinedParams,
}: {
  modelCategory: ModelCategory;
  combinedParams: JsonObject;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  switch (modelCategory) {
    case ModelCategory.TextToImage:
      if (!combinedParams.prompt || String(combinedParams.prompt).trim() === "") {
        errors.push("Prompt is required for text-to-image tasks");
      }
      break;

    case ModelCategory.ImageToImage:
      if (!combinedParams.prompt || String(combinedParams.prompt).trim() === "") {
        errors.push("Prompt is required for image-to-image tasks");
      }

      if (
        !combinedParams.image_url ||
        !Array.isArray(combinedParams.image_url) ||
        combinedParams.image_url.length === 0
      ) {
        errors.push("At least one image is required for image-to-image tasks");
      }
      break;

    case ModelCategory.TextToVideo:
    case ModelCategory.ImageToVideo:
      errors.push(`OpenAI Next does not support ${modelCategory} tasks`);
      break;

    default:
      errors.push(`Unsupported model category: ${modelCategory}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get default parameters for OpenAI Next models
 */
export function getOpenAINextDefaultParameters(modelCategory: ModelCategory): JsonObject {
  switch (modelCategory) {
    case ModelCategory.TextToImage:
      return {
        prompt: "",
      };

    case ModelCategory.ImageToImage:
      return {
        prompt: "",
        image_url: [],
        aspect_ratio: "1:1",
      };

    default:
      return {};
  }
}

/**
 * Sanitize and clean input parameters
 */
export function sanitizeParameters(input: JsonObject): JsonObject {
  const sanitized: JsonObject = {};

  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && value !== null) {
      // Clean string values
      if (typeof value === "string") {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}
