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

export const Imagen4ModelCode = "imagen4";

export type Imagen4Model = BaseModel;

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
  aspect_ratio: {
    en: "Aspect Ratio",
    zh: "宽高比",
    fr: "Ratio d'aspect",
    de: "Seitenverhältnis",
    it: "Rapporto d'aspetto",
    pt: "Proporção",
    ru: "Соотношение сторон",
    "zh-hk": "寬高比",
    ja: "アスペクト比",
    ko: "종횡비",
    es: "Relación de aspecto",
  },
};

export const modelDescription: Record<Locale, string> = {
  en: "The most powerful AI image generation model, supporting complex scenes and details",
  zh: "最强大的AI图像生成模型，支持复杂的场景和细节",
  fr: "Le modèle de génération d'images IA le plus puissant, prenant en charge les scènes et détails complexes",
  de: "Das leistungsstärkste KI-Bildgenerierungsmodell, das komplexe Szenen und Details unterstützt",
  it: "Il modello di generazione di immagini IA più potente, che supporta scene e dettagli complessi",
  pt: "O modelo de geração de imagens IA mais poderoso, suportando cenas e detalhes complexos",
  ru: "Самая мощная модель генерации изображений ИИ, поддерживающая сложные сцены и детали",
  "zh-hk": "最強大的AI圖像生成模型，支持複雜的場景和細節",
  ja: "複雑なシーンとディテールをサポートする、最も強力なAI画像生成モデル",
  ko: "복잡한 장면과 세부 사항을 지원하는 가장 강력한 AI 이미지 생성 모델",
  es: "El modelo de generación de imágenes IA más potente, que admite escenas y detalles complejos",
};

export function calculateCredits(request: JsonObject): number {
  const num_images = (request.num_images as number) || 1;
  return 12 * num_images;
}

export function calculateQuantity(request: JsonObject): number {
  const num_images = (request.num_images as number) || 1;
  return num_images;
}

export function getImagen4Model(locale = defaultLocale as Locale): Imagen4Model {
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
        key: "negative_prompt",
        type: ParameterType.TEXT,
        label: parameterLabels.negative_prompt[locale],
        defaultValue: "",
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

      {
        key: "aspect_ratio",
        type: ParameterType.ASPECT_RATIO,
        label: parameterLabels.aspect_ratio[locale],
        defaultValue: "1:1",
        aspectRatios: [
          { label: "1:1", ratio: { w: 1, h: 1 }, value: "1:1" },
          { label: "2:3", ratio: { w: 2, h: 3 }, value: "2:3" },
          { label: "3:4", ratio: { w: 3, h: 4 }, value: "3:4" },
          { label: "4:3", ratio: { w: 4, h: 3 }, value: "4:3" },
          { label: "9:16", ratio: { w: 9, h: 16 }, value: "9:16" },
          { label: "16:9", ratio: { w: 16, h: 9 }, value: "16:9" },
          { label: "21:9", ratio: { w: 21, h: 9 }, value: "21:9" },
        ],
        required: true,
      } as ParameterConfig,
    ],
  };

  return {
    icon: "/images/aigc/models/logo/google.svg",
    provider: Provider.fal,
    providerModel: "fal-ai/imagen4/preview",
    company: Company.google,
    name: "Imagen 4",
    description: modelDescription[locale],
    tags: [],
    code: Imagen4ModelCode,
    version: "4",
    parameterConfig,
    resultType: ResultType.IMAGE,
    modelCategory: ModelCategory.TextToImage,
    recallable: true,
  };
}
