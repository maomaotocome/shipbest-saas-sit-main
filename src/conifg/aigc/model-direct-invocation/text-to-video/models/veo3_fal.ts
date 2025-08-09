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
import { randomSeed } from "@/conifg/aigc/utils";

export const Veo3ModelCode = "veo3";

export type Veo3Model = BaseModel;

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
  duration: {
    en: "Duration",
    zh: "时长",
    fr: "Durée",
    de: "Dauer",
    it: "Durata",
    pt: "Duração",
    ru: "Продолжительность",
    "zh-hk": "時長",
    ja: "時間",
    ko: "지속 시간",
    es: "Duración",
  },
  enhance_prompt: {
    en: "Enhance Prompt",
    zh: "增强提示词",
    fr: "Améliorer l'invite",
    de: "Aufforderung verbessern",
    it: "Migliora prompt",
    pt: "Melhorar prompt",
    ru: "Улучшить запрос",
    "zh-hk": "增強提示詞",
    ja: "プロンプト強化",
    ko: "프롬프트 향상",
    es: "Mejorar prompt",
  },
  seed: {
    en: "Seed",
    zh: "随机种子",
    fr: "Graine",
    de: "Seed",
    it: "Seme",
    pt: "Semente",
    ru: "Зерно",
    "zh-hk": "隨機種子",
    ja: "シード",
    ko: "시드",
    es: "Semilla",
  },
  generate_audio: {
    en: "Generate Audio",
    zh: "生成音频",
    fr: "Générer l'audio",
    de: "Audio generieren",
    it: "Genera audio",
    pt: "Gerar áudio",
    ru: "Генерировать звук",
    "zh-hk": "生成音頻",
    ja: "音声生成",
    ko: "오디오 생성",
    es: "Generar audio",
  },
};

export const modelDescription: Record<Locale, string> = {
  en: "Google's Veo3 model is an advanced text-to-video generation model that creates high-quality videos with enhanced prompt understanding and audio generation capabilities.",
  zh: "Google的Veo3模型是一个先进的文本生成视频模型，能够创建具有增强提示理解和音频生成功能的高质量视频。",
  fr: "Le modèle Veo3 de Google est un modèle avancé de génération texte-vidéo qui crée des vidéos de haute qualité avec une compréhension améliorée des invites et des capacités de génération audio.",
  de: "Googles Veo3-Modell ist ein fortschrittliches Text-zu-Video-Generierungsmodell, das hochwertige Videos mit verbesserter Aufforderungsverständnis und Audio-Generierungsfähigkeiten erstellt.",
  it: "Il modello Veo3 di Google è un modello avanzato di generazione testo-video che crea video di alta qualità con comprensione migliorata dei prompt e capacità di generazione audio.",
  pt: "O modelo Veo3 do Google é um modelo avançado de geração texto-para-vídeo que cria vídeos de alta qualidade com compreensão aprimorada de prompts e capacidades de geração de áudio.",
  ru: "Модель Veo3 от Google - это продвинутая модель генерации видео из текста, которая создает высококачественные видео с улучшенным пониманием подсказок и возможностями генерации звука.",
  "zh-hk":
    "Google的Veo3模型是一個先進的文本生成視頻模型，能夠創建具有增強提示理解和音頻生成功能的高質量視頻。",
  ja: "GoogleのVeo3モデルは、強化されたプロンプト理解と音声生成機能を持つ高品質なビデオを作成する高度なテキスト・トゥ・ビデオ生成モデルです。",
  ko: "Google의 Veo3 모델은 향상된 프롬프트 이해와 오디오 생성 기능을 갖춘 고품질 비디오를 생성하는 고급 텍스트-투-비디오 생성 모델입니다.",
  es: "El modelo Veo3 de Google es un modelo avanzado de generación texto-a-video que crea videos de alta calidad con comprensión mejorada de prompts y capacidades de generación de audio.",
};

export function calculateCredits(request: JsonObject): number {
  const generate_audio = (request.generate_audio as boolean) ?? true;
  // Base credits for 8s video
  const baseCredits = 10000000;
  // If audio is disabled, reduce credits by 33%
  return generate_audio ? baseCredits : Math.round(baseCredits * 0.67);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateQuantity(_request: JsonObject): number {
  // Veo3 generates only one video per request
  return 1;
}

export function getVeo3Model(locale = defaultLocale as Locale): Veo3Model {
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
        key: "aspect_ratio",
        type: ParameterType.ASPECT_RATIO,
        label: parameterLabels.aspect_ratio[locale],
        defaultValue: "16:9",
        aspectRatios: [
          { label: "16:9", ratio: { w: 16, h: 9 }, value: "16:9" },
          { label: "9:16", ratio: { w: 9, h: 16 }, value: "9:16" },
          { label: "1:1", ratio: { w: 1, h: 1 }, value: "1:1" },
        ],
        required: true,
      } as ParameterConfig,

      {
        key: "duration",
        type: ParameterType.SELECT,
        label: parameterLabels.duration[locale],
        defaultValue: "8s",
        options: [{ value: "8s", label: "8s" }],
        required: true,
      } as ParameterConfig,

      {
        key: "negative_prompt",
        type: ParameterType.TEXT,
        label: parameterLabels.negative_prompt[locale],
        defaultValue: "",
        required: false,
        is_additional: true,
      } as ParameterConfig,

      {
        key: "enhance_prompt",
        type: ParameterType.BOOLEAN,
        label: parameterLabels.enhance_prompt[locale],
        defaultValue: true,
        required: false,
        is_additional: true,
      } as ParameterConfig,

      {
        key: "seed",
        type: ParameterType.SEED,
        label: parameterLabels.seed[locale],
        defaultValue: randomSeed(),
        min: 0,
        max: 2147483647,
        step: 1,
        required: false,
        is_additional: true,
      } as ParameterConfig,

      {
        key: "generate_audio",
        type: ParameterType.BOOLEAN,
        label: parameterLabels.generate_audio[locale],
        defaultValue: true,
        required: false,
        is_additional: true,
      } as ParameterConfig,
    ],
  };

  return {
    icon: "/images/aigc/models/logo/google.svg",
    provider: Provider.fal,
    providerModel: "fal-ai/veo3",
    company: Company.google,
    name: "Veo3",
    description: modelDescription[locale],
    tags: [],
    code: Veo3ModelCode,
    version: "1.0",
    parameterConfig,
    resultType: ResultType.VIDEO,
    modelCategory: ModelCategory.TextToVideo,
    recallable: true,
  };
}
