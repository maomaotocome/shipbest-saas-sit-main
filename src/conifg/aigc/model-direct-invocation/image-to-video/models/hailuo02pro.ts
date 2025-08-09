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

export const Hailuo02ProModelCode = "hailuo02pro";

export type Hailuo02ProModel = BaseModel;

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
  prompt_optimizer: {
    en: "Prompt Optimizer",
    zh: "提示词优化器",
    fr: "Optimiseur d'invite",
    de: "Prompt-Optimierer",
    it: "Ottimizzatore prompt",
    pt: "Otimizador de prompt",
    ru: "Оптимизатор запросов",
    "zh-hk": "提示詞優化器",
    ja: "プロンプト最適化",
    ko: "프롬프트 최적화기",
    es: "Optimizador de prompt",
  },
};

export const modelDescription: Record<Locale, string> = {
  en: "Hailuo 02 Pro by MiniMax AI - Advanced image-to-video generation model with enhanced prompt optimization and high-quality video output.",
  zh: "MiniMax AI的Hailuo 02 Pro - 具有增强提示词优化和高质量视频输出的先进图像生成视频模型。",
  fr: "Hailuo 02 Pro par MiniMax AI - Modèle avancé de génération image-vidéo avec optimisation d'invite améliorée et sortie vidéo de haute qualité.",
  de: "Hailuo 02 Pro von MiniMax AI - Fortschrittliches Bild-zu-Video-Generierungsmodell mit verbesserter Prompt-Optimierung und hochwertiger Videoausgabe.",
  it: "Hailuo 02 Pro di MiniMax AI - Modello avanzato di generazione immagine-video con ottimizzazione prompt migliorata e output video di alta qualità.",
  pt: "Hailuo 02 Pro da MiniMax AI - Modelo avançado de geração imagem-para-vídeo com otimização de prompt aprimorada e saída de vídeo de alta qualidade.",
  ru: "Hailuo 02 Pro от MiniMax AI - Продвинутая модель генерации видео из изображений с улучшенной оптимизацией запросов и высококачественным видеовыходом.",
  "zh-hk": "MiniMax AI的Hailuo 02 Pro - 具有增強提示詞優化和高質量視頻輸出的先進圖像生成視頻模型。",
  ja: "MiniMax AIによるHailuo 02 Pro - 強化されたプロンプト最適化と高品質ビデオ出力を備えた先進的な画像-動画生成モデル。",
  ko: "MiniMax AI의 Hailuo 02 Pro - 향상된 프롬프트 최적화와 고품질 비디오 출력을 갖춘 고급 이미지-투-비디오 생성 모델.",
  es: "Hailuo 02 Pro de MiniMax AI - Modelo avanzado de generación imagen-a-video con optimización de prompt mejorada y salida de video de alta calidad.",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateCredits(_request: JsonObject): number {
  // Base credit cost for Hailuo 02 Pro image-to-video generation
  return 50;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateQuantity(_request: JsonObject): number {
  // Hailuo02Pro generates only one video per request
  return 1;
}

export function getHailuo02ProModel(locale = defaultLocale as Locale): Hailuo02ProModel {
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
        defaultValue: "",
        required: true,
        image_count: 1,
      } as ParameterConfig,

      {
        key: "prompt_optimizer",
        type: ParameterType.BOOLEAN,
        label: parameterLabels.prompt_optimizer[locale],
        defaultValue: true,
        required: false,
        is_additional: true,
      } as ParameterConfig,
    ],
  };

  return {
    icon: "/images/aigc/models/logo/minimax.svg",
    provider: Provider.fal,
    providerModel: "fal-ai/minimax/hailuo-02/pro/image-to-video",
    company: Company.minimax,
    name: "Hailuo 02 Pro",
    description: modelDescription[locale],
    tags: [],
    code: Hailuo02ProModelCode,
    version: "2.0",
    parameterConfig,
    resultType: ResultType.VIDEO,
    modelCategory: ModelCategory.ImageToVideo,
    recallable: true,
  };
}
