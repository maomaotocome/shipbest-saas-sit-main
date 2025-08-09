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

export const Veo3KieAiModelCode = "veo3_kie_ai";

export type Veo3KieAiModel = BaseModel;

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
  imageUrls: {
    en: "Image URLs",
    zh: "图片链接",
    fr: "URLs d'images",
    de: "Bild-URLs",
    it: "URL delle immagini",
    pt: "URLs das imagens",
    ru: "URL изображений",
    "zh-hk": "圖片鏈接",
    ja: "画像URL",
    ko: "이미지 URL",
    es: "URLs de imágenes",
  },
  model: {
    en: "Model",
    zh: "模型",
    fr: "Modèle",
    de: "Modell",
    it: "Modello",
    pt: "Modelo",
    ru: "Модель",
    "zh-hk": "模型",
    ja: "モデル",
    ko: "모델",
    es: "Modelo",
  },
  watermark: {
    en: "Watermark",
    zh: "水印",
    fr: "Filigrane",
    de: "Wasserzeichen",
    it: "Filigrana",
    pt: "Marca d'água",
    ru: "Водяной знак",
    "zh-hk": "浮水印",
    ja: "透かし",
    ko: "워터마크",
    es: "Marca de agua",
  },
};

export const modelDescription: Record<Locale, string> = {
  en: "Google's Veo3 model via example API is an advanced text-to-video generation model that creates high-quality videos with enhanced prompt understanding. Supports both text-to-video and image-to-video generation with 1080P upscaling.",
  zh: "通过example API的Google Veo3模型是一个先进的文本生成视频模型，能够创建具有增强提示理解的高质量视频。支持文本生成视频和图片生成视频，并提供1080P升级。",
  fr: "Le modèle Veo3 de Google via l'API example est un modèle avancé de génération texte-vidéo qui crée des vidéos de haute qualité avec une compréhension améliorée des invites. Prend en charge la génération texte-vidéo et image-vidéo avec mise à l'échelle 1080P.",
  de: "Googles Veo3-Modell über die example API ist ein fortschrittliches Text-zu-Video-Generierungsmodell, das hochwertige Videos mit verbesserter Aufforderungsverständnis erstellt. Unterstützt sowohl Text-zu-Video- als auch Bild-zu-Video-Generierung mit 1080P-Upscaling.",
  it: "Il modello Veo3 di Google tramite l'API example è un modello avanzato di generazione testo-video che crea video di alta qualità con comprensione migliorata dei prompt. Supporta sia la generazione testo-video che immagine-video con upscaling 1080P.",
  pt: "O modelo Veo3 do Google via API example é um modelo avançado de geração texto-para-vídeo que cria vídeos de alta qualidade com compreensão aprimorada de prompts. Suporta geração texto-para-vídeo e imagem-para-vídeo com upscaling 1080P.",
  ru: "Модель Veo3 от Google через API example - это продвинутая модель генерации видео из текста, которая создает высококачественные видео с улучшенным пониманием подсказок. Поддерживает генерацию видео из текста и изображений с апскейлингом до 1080P.",
  "zh-hk":
    "通過example API的Google Veo3模型是一個先進的文本生成視頻模型，能夠創建具有增強提示理解的高質量視頻。支持文本生成視頻和圖片生成視頻，並提供1080P升級。",
  ja: "example API経由のGoogleのVeo3モデルは、強化されたプロンプト理解を持つ高品質なビデオを作成する高度なテキスト・トゥ・ビデオ生成モデルです。テキスト・トゥ・ビデオと画像・トゥ・ビデオの両方の生成を1080Pアップスケーリングでサポートします。",
  ko: "example API를 통한 Google의 Veo3 모델은 향상된 프롬프트 이해로 고품질 비디오를 생성하는 고급 텍스트-투-비디오 생성 모델입니다. 1080P 업스케일링으로 텍스트-투-비디오와 이미지-투-비디오 생성을 모두 지원합니다.",
  es: "El modelo Veo3 de Google a través de la API example es un modelo avanzado de generación texto-a-video que crea videos de alta calidad con comprensión mejorada de prompts. Soporta generación texto-a-video e imagen-a-video con escalado 1080P.",
};

export function calculateCredits(request: JsonObject): number {
  const model = (request.model as string) ?? "veo3";
  // Base credits for 8s video
  const baseCredits = 300;

  // veo3_fast is cheaper but only supports text-to-video
  if (model === "veo3_fast") {
    return Math.round(baseCredits * 0.8);
  }

  // veo3 supports both text-to-video and image-to-video
  return baseCredits;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateQuantity(_request: JsonObject): number {
  // Veo3 generates only one video per request
  return 1;
}

export function getVeo3KieAiModel(locale = defaultLocale as Locale): Veo3KieAiModel {
  const parameterConfig: ModelParameterConfig = {
    parameters: [
      {
        key: "prompt",
        type: ParameterType.TEXT,
        label: parameterLabels.prompt[locale],
        defaultValue: "",
        required: true,
        description: "Text prompt describing the desired video content",
      } as ParameterConfig,

      {
        key: "model",
        type: ParameterType.SELECT,
        label: parameterLabels.model[locale],
        defaultValue: "veo3",
        options: [
          { value: "veo3", label: "Standard" },
          { value: "veo3_fast", label: "Fast" },
        ],
        required: false,
        is_additional: false,
      } as ParameterConfig,
    ],
  };

  return {
    icon: "/images/aigc/models/logo/google.svg",
    provider: Provider.kie_ai,
    providerModel: "veo3",
    company: Company.google,
    name: "Veo3",
    description: modelDescription[locale],
    tags: ["video", "text-to-video", "image-to-video", "1080p"],
    code: Veo3KieAiModelCode,
    version: "1.0",
    parameterConfig,
    resultType: ResultType.VIDEO,
    modelCategory: ModelCategory.TextToVideo,
    recallable: true,
    extra: {
      endpoint: "/api/v1/veo/generate",
      supports_callback: true,
      supports_1080p_upgrade: true,
    },
  };
}
