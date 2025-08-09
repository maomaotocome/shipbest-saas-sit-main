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

export const FluxDevModelCode = "flux-dev";

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
  num_inference_steps: {
    en: "Inference Steps",
    zh: "推理步数",
    fr: "Étapes d'inférence",
    de: "Inferenzschritte",
    it: "Passi di inferenza",
    pt: "Passos de inferência",
    ru: "Шаги вывода",
    "zh-hk": "推理步數",
    ja: "推論ステップ",
    ko: "추론 단계",
    es: "Pasos de inferencia",
  },
};

export const modelDescription: Record<Locale, string> = {
  en: "A 12 billion parameter flow transformer that generates high-quality images from text. It is suitable for personal and commercial use.",
  zh: "一个120亿参数的流式变压器，从文本生成高质量的图像。它适合个人和商业用途。",
  fr: "Un transformateur de flux de 12 milliards de paramètres qui génère des images de haute qualité à partir de texte. Il convient à un usage personnel et commercial.",
  de: "Ein Flusstransformator mit 12 Milliarden Parametern, der hochwertige Bilder aus Text generiert. Er eignet sich für den persönlichen und kommerziellen Gebrauch.",
  it: "Un trasformatore di flusso da 12 miliardi di parametri che genera immagini di alta qualità dal testo. È adatto per uso personale e commerciale.",
  pt: "Um transformador de fluxo de 12 bilhões de parâmetros que gera imagens de alta qualidade a partir de texto. É adequado para uso pessoal e comercial.",
  ru: "Трансформер потока с 12 миллиардами параметров, который генерирует высококачественные изображения из текста. Подходит для личного и коммерческого использования.",
  "zh-hk": "一個120億參數的流式變壓器，從文本生成高質量的圖像。它適合個人和商業用途。",
  ja: "テキストから高品質な画像を生成する120億パラメータのフロートランスフォーマー。個人および商業利用に適しています。",
  ko: "텍스트에서 고품질 이미지를 생성하는 120억 개의 매개변수를 가진 흐름 변환기. 개인 및 상업적 사용에 적합합니다.",
  es: "Un transformador de flujo de 12 mil millones de parámetros que genera imágenes de alta calidad a partir de texto. Es adecuado para uso personal y comercial.",
};

export function calculateCredits(request: JsonObject): number {
  const num_images = (request.num_images as number) || 1;
  return 8 * num_images;
}

export function calculateQuantity(request: JsonObject): number {
  const num_images = (request.num_images as number) || 1;
  return num_images;
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
          { label: "21:9", ratio: { w: 21, h: 9 }, value: "21:9" },
          { label: "16:9", ratio: { w: 16, h: 9 }, value: "16:9" },
          { label: "4:3", ratio: { w: 4, h: 3 }, value: "4:3" },
          { label: "3:2", ratio: { w: 3, h: 2 }, value: "3:2" },
          { label: "1:1", ratio: { w: 1, h: 1 }, value: "1:1" },
          { label: "2:3", ratio: { w: 2, h: 3 }, value: "2:3" },
          { label: "3:4", ratio: { w: 3, h: 4 }, value: "3:4" },
          { label: "9:16", ratio: { w: 9, h: 16 }, value: "9:16" },
          { label: "9:21", ratio: { w: 9, h: 21 }, value: "9:21" },
        ],
        required: true,
      } as ParameterConfig,

      {
        key: "num_inference_steps",
        type: ParameterType.NUMBER,
        label: parameterLabels.num_inference_steps[locale],
        defaultValue: 28,
        min: 1,
        max: 50,
        step: 1,
        required: false,
      } as ParameterConfig,
    ],
  };

  return {
    icon: "/images/aigc/models/logo/black-forest-labs.svg",
    provider: Provider.fal,
    providerModel: "fal-ai/flux-1/dev",
    company: Company.blackForestLabs,
    name: "Flux Dev",
    description: modelDescription[locale],
    tags: [],
    code: FluxDevModelCode,
    version: "1.0",
    parameterConfig,
    resultType: ResultType.IMAGE,
    modelCategory: ModelCategory.TextToImage,
    recallable: true,
  };
}
