import { defaultLocale, Locale } from "@/i18n/locales";
import { ModelCategory } from "@/lib/constants";
import { JsonObject } from "@/types/json";
import { Company } from "@/conifg/aigc/companys";
import {
  BaseModel,
  ModelParameterConfig,
  ParameterConfig,
  ParameterType,
  Provider,
  ResultType,
} from "@/conifg/aigc/types";

export const FluxSchnellModelCode = "fal-ai/flux/schnell/image-to-image";

export type FluxSchnellModel = BaseModel;

// Multi-language parameter labels
const parameterLabels = {
  prompt: {
    en: "Prompt",
    zh: "提示词",
    fr: "Invite",
    de: "Aufforderung",
    it: "Prompt",
    pt: "Prompt",
    ru: "Запрос",
    "zh-hk": "提示詞",
    ja: "プロンプト",
    ko: "프롬프트",
    es: "Prompt",
  },
  negative_prompt: {
    en: "Negative Prompt",
    zh: "负面提示词",
    fr: "Invite négatif",
    de: "Negative Aufforderung",
    it: "Prompt negativo",
    pt: "Prompt negativo",
    ru: "Негативный запрос",
    "zh-hk": "負面提示詞",
    ja: "ネガティブプロンプト",
    ko: "네거티브 프롬프트",
    es: "Prompt negativo",
  },
  image_url: {
    en: "Input Image",
    zh: "输入图片",
    fr: "Image d'entrée",
    de: "Eingabebild",
    it: "Immagine di input",
    pt: "Imagem de entrada",
    ru: "Входное изображение",
    "zh-hk": "輸入圖片",
    ja: "入力画像",
    ko: "입력 이미지",
    es: "Imagen de entrada",
  },
  num_images: {
    en: "Number of Images",
    zh: "图片数量",
    fr: "Nombre d'images",
    de: "Anzahl der Bilder",
    it: "Numero di immagini",
    pt: "Número de imagens",
    ru: "Количество изображений",
    "zh-hk": "圖片數量",
    ja: "画像数",
    ko: "이미지 수",
    es: "Número de imágenes",
  },
};

export const modelDescription: Record<Locale, string> = {
  en: "Flux Schnell image-to-image model for fast image transformations with good quality and speed optimization.",
  zh: "Flux Schnell 图像到图像模型，用于快速图像转换，具有良好的质量和速度优化。",
  fr: "Modèle image-à-image Flux Schnell pour des transformations d'images rapides avec une bonne qualité et une optimisation de vitesse.",
  de: "Flux Schnell Bild-zu-Bild-Modell für schnelle Bildtransformationen mit guter Qualität und Geschwindigkeitsoptimierung.",
  it: "Modello immagine-a-immagine Flux Schnell per trasformazioni di immagini veloci con buona qualità e ottimizzazione della velocità.",
  pt: "Modelo imagem-para-imagem Flux Schnell para transformações de imagens rápidas com boa qualidade e otimização de velocidade.",
  ru: "Модель изображение-в-изображение Flux Schnell для быстрых преобразований изображений с хорошим качеством и оптимизацией скорости.",
  "zh-hk": "Flux Schnell 圖像到圖像模型，用於快速圖像轉換，具有良好的質量和速度優化。",
  ja: "良好な品質と速度最適化を備えた高速画像変換のためのFlux Schnell画像間変換モデル。",
  ko: "좋은 품질과 속도 최적화를 통한 빠른 이미지 변환을 위한 Flux Schnell 이미지-투-이미지 모델.",
  es: "Modelo imagen-a-imagen Flux Schnell para transformaciones de imágenes rápidas con buena calidad y optimización de velocidad.",
};

export function calculateCredits(request: JsonObject): number {
  const numImages = (request.num_images as number) || 1;
  return 5 * numImages;
}

export function calculateQuantity(request: JsonObject): number {
  const numImages = (request.num_images as number) || 1;
  return numImages;
}

export function getFluxSchnellModel(locale = defaultLocale as Locale): FluxSchnellModel {
  const parameterConfig: ModelParameterConfig = {
    parameters: [
      {
        key: "prompt",
        type: ParameterType.TEXT,
        label: parameterLabels.prompt[locale],
        defaultValue: "",
        required: true,
        enable_translate: true,
        translate_to: "English",
      } as ParameterConfig,

      {
        key: "negative_prompt",
        type: ParameterType.TEXT,
        label: parameterLabels.negative_prompt[locale],
        defaultValue: "",
        required: false,
        collapsible: true,
        defaultCollapsed: true,
      } as ParameterConfig,

      {
        key: "image_url",
        type: ParameterType.IMAGES,
        label: parameterLabels.image_url[locale],
        image_count: 1,
        defaultValue: "",
        required: true,
      } as ParameterConfig,

      {
        key: "num_images",
        type: ParameterType.NUMBER,
        label: parameterLabels.num_images[locale],
        defaultValue: 1,
        min: 1,
        max: 4,
        step: 1,
        required: true,
      } as ParameterConfig,
    ],
  };

  return {
    icon: "/images/aigc/models/logo/black-forest-labs.svg",
    provider: Provider.fal,
    providerModel: "fal-ai/flux-1/schnell/redux",
    company: Company.blackForestLabs,
    name: "Flux Schnell",
    description: modelDescription[locale],
    tags: [],
    code: FluxSchnellModelCode,
    version: "1.0",
    parameterConfig,
    resultType: ResultType.IMAGE,
    modelCategory: ModelCategory.ImageToImage,
    recallable: true,
  };
}
