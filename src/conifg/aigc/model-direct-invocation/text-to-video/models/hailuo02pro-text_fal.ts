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

export const Hailuo02ProTextModelCode = "hailuo02pro-text";

export type Hailuo02ProTextModel = BaseModel;

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
  en: "Hailuo 02 Pro by MiniMax AI - Advanced text-to-video generation model with enhanced prompt optimization for high-quality cinematic video creation.",
  zh: "MiniMax AI的Hailuo 02 Pro - 具有增强提示词优化功能的先进文本生成视频模型，用于创建高质量的电影级视频。",
  fr: "Hailuo 02 Pro par MiniMax AI - Modèle avancé de génération texte-vidéo avec optimisation d'invite améliorée pour la création de vidéos cinématographiques de haute qualité.",
  de: "Hailuo 02 Pro von MiniMax AI - Fortschrittliches Text-zu-Video-Generierungsmodell mit verbesserter Prompt-Optimierung für die Erstellung hochwertiger kinematografischer Videos.",
  it: "Hailuo 02 Pro di MiniMax AI - Modello avanzato di generazione testo-video con ottimizzazione prompt migliorata per la creazione di video cinematografici di alta qualità.",
  pt: "Hailuo 02 Pro da MiniMax AI - Modelo avançado de geração texto-para-vídeo com otimização de prompt aprimorada para criação de vídeos cinematográficos de alta qualidade.",
  ru: "Hailuo 02 Pro от MiniMax AI - Продвинутая модель генерации видео из текста с улучшенной оптимизацией запросов для создания высококачественных кинематографических видео.",
  "zh-hk":
    "MiniMax AI的Hailuo 02 Pro - 具有增強提示詞優化功能的先進文本生成視頻模型，用於創建高質量的電影級視頻。",
  ja: "MiniMax AIによるHailuo 02 Pro - 高品質な映画的ビデオ作成のための強化されたプロンプト最適化を備えた先進的なテキスト-動画生成モデル。",
  ko: "MiniMax AI의 Hailuo 02 Pro - 고품질 영화적 비디오 제작을 위한 향상된 프롬프트 최적화를 갖춘 고급 텍스트-투-비디오 생성 모델.",
  es: "Hailuo 02 Pro de MiniMax AI - Modelo avanzado de generación texto-a-video con optimización de prompt mejorada para la creación de videos cinematográficos de alta calidad.",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateCredits(_request: JsonObject): number {
  // Base credit cost for Hailuo 02 Pro text-to-video generation
  return 60;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateQuantity(_request: JsonObject): number {
  // Hailuo02Pro generates only one video per request
  return 1;
}

export function getHailuo02ProTextModel(locale = defaultLocale as Locale): Hailuo02ProTextModel {
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
    providerModel: "fal-ai/minimax/hailuo-02/pro/text-to-video",
    company: Company.minimax,
    name: "Hailuo 02 Pro Text",
    description: modelDescription[locale],
    tags: [],
    code: Hailuo02ProTextModelCode,
    version: "2.0",
    parameterConfig,
    resultType: ResultType.VIDEO,
    modelCategory: ModelCategory.TextToVideo,
    recallable: true,
  };
}
