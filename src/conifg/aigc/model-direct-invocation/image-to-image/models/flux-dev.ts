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

export const FluxDevModelCode = "fal-ai/flux/dev/image-to-image";

export type FluxDevModel = BaseModel;

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
  strength: {
    en: "Strength",
    zh: "强度",
    fr: "Force",
    de: "Stärke",
    it: "Forza",
    pt: "Força",
    ru: "Сила",
    "zh-hk": "強度",
    ja: "強度",
    ko: "강도",
    es: "Fuerza",
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
  en: "Flux Dev image-to-image model for high-quality image transformations with excellent detail preservation and creative control.",
  zh: "Flux Dev 图像到图像模型，用于高质量图像转换，具有出色的细节保留和创意控制能力。",
  fr: "Modèle image-à-image Flux Dev pour des transformations d'images de haute qualité avec une excellente préservation des détails et un contrôle créatif.",
  de: "Flux Dev Bild-zu-Bild-Modell für hochwertige Bildtransformationen mit ausgezeichneter Detailerhaltung und kreativer Kontrolle.",
  it: "Modello immagine-a-immagine Flux Dev per trasformazioni di immagini di alta qualità con eccellente conservazione dei dettagli e controllo creativo.",
  pt: "Modelo imagem-para-imagem Flux Dev para transformações de imagens de alta qualidade com excelente preservação de detalhes e controle criativo.",
  ru: "Модель изображение-в-изображение Flux Dev для высококачественных преобразований изображений с отличным сохранением деталей и творческим контролем.",
  "zh-hk": "Flux Dev 圖像到圖像模型，用於高質量圖像轉換，具有出色的細節保留和創意控制能力。",
  ja: "優れた詳細保持と創造的制御を備えた高品質な画像変換のためのFlux Dev画像間変換モデル。",
  ko: "뛰어난 디테일 보존과 창의적 제어를 통한 고품질 이미지 변환을 위한 Flux Dev 이미지-투-이미지 모델.",
  es: "Modelo imagen-a-imagen Flux Dev para transformaciones de imágenes de alta calidad con excelente preservación de detalles y control creativo.",
};

export function calculateCredits(request: JsonObject): number {
  const numImages = (request.num_images as number) || 1;
  return 12 * numImages;
}

export function calculateQuantity(request: JsonObject): number {
  const numImages = (request.num_images as number) || 1;
  return numImages;
}

export function getFluxDevModel(locale = defaultLocale as Locale): FluxDevModel {
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
        key: "image_url",
        type: ParameterType.IMAGES,
        label: parameterLabels.image_url[locale],
        image_count: 1,
        defaultValue: "",
        required: true,
      } as ParameterConfig,

      {
        key: "strength",
        type: ParameterType.NUMBER,
        label: parameterLabels.strength[locale],
        defaultValue: 0.95,
        min: 0.1,
        max: 1.0,
        step: 0.05,
        required: false,
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
    providerModel: "fal-ai/flux/dev/image-to-image",
    company: Company.blackForestLabs,
    name: "Flux Dev",
    description: modelDescription[locale],
    tags: [],
    code: FluxDevModelCode,
    version: "1.0",
    parameterConfig,
    resultType: ResultType.IMAGE,
    modelCategory: ModelCategory.ImageToImage,
    recallable: true,
  };
}
