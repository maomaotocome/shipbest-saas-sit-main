"use server";

import { ModelCategory, TemplateType } from "@/lib/constants";
import { JsonObject } from "@/types/json";
import { FluxProKontextMaxMultiModelCode } from "@/conifg/aigc/model-direct-invocation/image-to-image/models/flux-pro-kontext-max-multi";
import { GPT4oModelCode } from "@/conifg/aigc/model-direct-invocation/image-to-image/models/gpt4o";

// Built-in anime style transformation prompts and parameters
const ANIME_STYLE_PROMPTS = {
  flux_pro_kontext: {
    base_prompt:
      "Transform this image into a beautiful anime-style artwork with vibrant colors, clean lines, and characteristic anime features. Maintain the original composition while applying anime aesthetic principles.",
  },
  gpt4o: {
    base_prompt:
      "Convert this image to anime style. Apply anime-characteristic features such as large expressive eyes, clean line art, vibrant colors, and stylized proportions. Keep the original subject recognizable while transforming it into an anime aesthetic.",
  },
};

// Animation style options
const ANIME_STYLE_OPTIONS = [
  {
    value: "ghibli",
    reference_image:
      "https://meterial.example.ai/meterial/aigc/template/anime-style-image/reference/glibli.avif",
    prompt:
      "inspired by Studio Ghibli, soft colors, whimsical, magical realism, detailed backgrounds",
  },
  {
    value: "shinkai",
    reference_image:
      "https://meterial.example.ai/meterial/aigc/template/anime-style-image/reference/shinkai.avif",
    prompt:
      "inspired by Makoto Shinkai, vivid lighting, dramatic skies, emotional atmosphere, cinematic composition",
  },
  {
    value: "pixar",
    reference_image:
      "https://meterial.example.ai/meterial/aigc/template/anime-style-image/reference/pixar.avif",
    prompt: "inspired by Pixar, 3D cartoon, expressive faces, vibrant colors, playful mood",
  },
];

/**
 * 获取系统内置参数，用于模板处理
 * 由 get-system-request.ts 调用
 */
export async function getAnimeStyleSystemRequest(metadata?: JsonObject): Promise<JsonObject> {
  // Return template system-level configuration
  return {
    template_type: TemplateType.StylizedAnimeImage,
    supported_models: [FluxProKontextMaxMultiModelCode, GPT4oModelCode],
    default_model: FluxProKontextMaxMultiModelCode,
    model_category: ModelCategory.ImageToImage,
    ...metadata,
  };
}

export async function combineAnimeStyleRequest({
  request,
}: {
  request: JsonObject;
  systemRequest?: JsonObject;
}): Promise<JsonObject> {
  const modelSelection = (request.model as string) || FluxProKontextMaxMultiModelCode;
  const animeStyle = (request.anime_style as string) || "ghibli";
  const imageUrl = request.image_url;
  const aspectRatio = (request.aspect_ratio as string) || "1:1";

  const styleOption =
    ANIME_STYLE_OPTIONS.find((opt) => opt.value === animeStyle) || ANIME_STYLE_OPTIONS[0];
  const stylePrompt = styleOption.prompt;
  const styleReferenceImage = styleOption.reference_image;

  const userImages = Array.isArray(imageUrl) ? imageUrl : [imageUrl];

  if (modelSelection === GPT4oModelCode) {
    const basePrompt = ANIME_STYLE_PROMPTS.gpt4o.base_prompt;
    return {
      model: GPT4oModelCode,
      prompt: `${basePrompt} ${stylePrompt} . please keep the original ratio: ${aspectRatio}`,
      image_url: Array.isArray(userImages) ? userImages : [userImages], // no need to add style reference image
      size: aspectRatio,
    };
  } else {
    const allImages = [...userImages, styleReferenceImage];
    const basePrompt = ANIME_STYLE_PROMPTS.flux_pro_kontext.base_prompt;
    return {
      model: FluxProKontextMaxMultiModelCode,
      prompt: `${basePrompt} ${stylePrompt}`,
      image_urls: allImages,
      aspect_ratio: aspectRatio,
      guidance_scale: 3.5,
      num_images: 1,
      safety_tolerance: "2",
      output_format: "png",
      sync_mode: false,
      model_category: ModelCategory.ImageToImage,
    };
  }
}
