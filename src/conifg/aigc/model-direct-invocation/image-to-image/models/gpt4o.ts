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

export const GPT4oModelCode = "gpt-4o-image";

export type GPT4oModel = BaseModel;

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

  size: {
    en: "Size",
    zh: "尺寸",
    fr: "Taille",
    de: "Größe",
    it: "Dimensione",
    pt: "Tamanho",
    ru: "Размер",
    "zh-hk": "尺寸",
    ja: "サイズ",
    ko: "크기",
    es: "Tamaño",
  },

  aspect_ratio: {
    en: "Aspect Ratio",
    zh: "长宽比",
    fr: "Ratio d'aspect",
    de: "Seitenverhältnis",
    it: "Rapporto di aspetto",
    pt: "Razão de aspecto",
    ru: "Соотношение сторон",
    "zh-hk": "長寬比",
    ja: "アスペクト比",
    ko: "비율",
    es: "Relación de aspecto",
  },
};

export const modelDescription: Record<Locale, string> = {
  en: "GPT-4o image editing model that can understand and modify images based on natural language instructions with high accuracy.",
  zh: "GPT-4o 图像编辑模型，能够根据自然语言指令高精度地理解和修改图像。",
  fr: "Modèle d'édition d'images GPT-4o qui peut comprendre et modifier des images basées sur des instructions en langage naturel avec une grande précision.",
  de: "GPT-4o Bildbearbeitungsmodell, das Bilder basierend auf natürlichsprachlichen Anweisungen mit hoher Genauigkeit verstehen und modifizieren kann.",
  it: "Modello di editing delle immagini GPT-4o che può comprendere e modificare le immagini basandosi su istruzioni in linguaggio naturale con alta precisione.",
  pt: "Modelo de edição de imagens GPT-4o que pode entender e modificar imagens baseadas em instruções de linguagem natural com alta precisão.",
  ru: "Модель редактирования изображений GPT-4o, которая может понимать и изменять изображения на основе инструкций на естественном языке с высокой точностью.",
  "zh-hk": "GPT-4o 圖像編輯模型，能夠根據自然語言指令高精度地理解和修改圖像。",
  ja: "自然言語の指示に基づいて高精度で画像を理解し修正できるGPT-4o画像編集モデル。",
  ko: "자연어 지시에 기반하여 높은 정확도로 이미지를 이해하고 수정할 수 있는 GPT-4o 이미지 편집 모델.",
  es: "Modelo de edición de imágenes GPT-4o que puede entender y modificar imágenes basadas en instrucciones de lenguaje natural con alta precisión.",
};

export function calculateCredits(request: JsonObject): number {
  const baseCredits = 20;
  const numImages = (request.num_images as number) || 1;
  return baseCredits * numImages;
}

export function calculateQuantity(request: JsonObject): number {
  const numImages = (request.num_images as number) || 1;
  return numImages;
}

export function getGPT4oModel(locale = defaultLocale as Locale): GPT4oModel {
  const parameterConfig: ModelParameterConfig = {
    parameters: [
      {
        key: "prompt",
        type: ParameterType.TEXT,
        label: parameterLabels.prompt[locale],
        defaultValue: "",
        required: true,
      } as ParameterConfig,

      {
        key: "image_url",
        type: ParameterType.IMAGES,
        label: parameterLabels.image_url[locale],
        image_count: 4,
        defaultValue: "",
        required: true,
      } as ParameterConfig,

      {
        key: "aspect_ratio",
        type: ParameterType.ASPECT_RATIO,
        label: parameterLabels.aspect_ratio[locale],
        defaultValue: "1:1",
        aspectRatios: [
          { label: "1:1", ratio: { w: 1, h: 1 }, value: "1:1" },
          { label: "16:9", ratio: { w: 16, h: 9 }, value: "16:9" },
          { label: "9:16", ratio: { w: 9, h: 16 }, value: "9:16" },
          { label: "4:3", ratio: { w: 4, h: 3 }, value: "4:3" },
          { label: "3:4", ratio: { w: 3, h: 4 }, value: "3:4" },
          { label: "1:2", ratio: { w: 1, h: 2 }, value: "1:2" },
          { label: "2:1", ratio: { w: 2, h: 1 }, value: "2:1" },
          { label: "2:3", ratio: { w: 2, h: 3 }, value: "2:3" },
          { label: "3:2", ratio: { w: 3, h: 2 }, value: "3:2" },
        ],
        required: false,
        is_additional: true,
      } as ParameterConfig,
    ],
  };

  return {
    icon: "/images/aigc/models/logo/openai.svg",
    provider: Provider.openai_next,
    providerModel: "gpt-4o-image-vip",
    company: Company.openai,
    name: "GPT-4o",
    description: modelDescription[locale],
    tags: [],
    code: GPT4oModelCode,
    version: "1.0",
    parameterConfig,
    resultType: ResultType.IMAGE,
    modelCategory: ModelCategory.ImageToImage,
    recallable: false,
  };
}
