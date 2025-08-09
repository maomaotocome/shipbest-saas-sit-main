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

export const Kling21ModelCode = "kling21";

export type Kling21Model = BaseModel;

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
  cfg_scale: {
    en: "CFG Scale",
    zh: "CFG 强度",
    fr: "Échelle CFG",
    de: "CFG-Skala",
    it: "Scala CFG",
    pt: "Escala CFG",
    ru: "Шкала CFG",
    "zh-hk": "CFG 強度",
    ja: "CFGスケール",
    ko: "CFG 스케일",
    es: "Escala CFG",
  },
};

// Multi-language option labels
const optionLabels = {
  "5": {
    en: "5 seconds",
    zh: "5秒",
    fr: "5 secondes",
    de: "5 Sekunden",
    it: "5 secondi",
    pt: "5 segundos",
    ru: "5 секунд",
    "zh-hk": "5秒",
    ja: "5秒",
    ko: "5초",
    es: "5 segundos",
  },
  "10": {
    en: "10 seconds",
    zh: "10秒",
    fr: "10 secondes",
    de: "10 Sekunden",
    it: "10 secondi",
    pt: "10 segundos",
    ru: "10 секунд",
    "zh-hk": "10秒",
    ja: "10秒",
    ko: "10초",
    es: "10 segundos",
  },
};

export const modelDescription: Record<Locale, string> = {
  en: "Kling AI's advanced text-to-video generation model v2.1 Master that creates high-quality videos from text prompts with enhanced control and cinematic quality.",
  zh: "快手AI的高级文本生成视频模型v2.1 Master，能够从文本提示创建具有增强控制和电影级质量的高质量视频。",
  fr: "Le modèle avancé de génération texte-vidéo v2.1 Master de Kling AI qui crée des vidéos de haute qualité à partir d'invites textuelles avec un contrôle amélioré et une qualité cinématographique.",
  de: "Kling AIs fortschrittliches Text-zu-Video-Generierungsmodell v2.1 Master, das hochwertige Videos aus Textaufforderungen mit verbesserter Kontrolle und kinematografischer Qualität erstellt.",
  it: "Il modello avanzato di generazione testo-video v2.1 Master di Kling AI che crea video di alta qualità da prompt testuali con controllo migliorato e qualità cinematografica.",
  pt: "O modelo avançado de geração texto-para-vídeo v2.1 Master da Kling AI que cria vídeos de alta qualidade a partir de prompts de texto com controle aprimorado e qualidade cinematográfica.",
  ru: "Продвинутая модель генерации видео из текста v2.1 Master от Kling AI, которая создает высококачественные видео из текстовых подсказок с улучшенным контролем и кинематографическим качеством.",
  "zh-hk":
    "快手AI的高級文本生成視頻模型v2.1 Master，能夠從文本提示創建具有增強控制和電影級質量的高質量視頻。",
  ja: "テキストプロンプトから強化されたコントロールと映画的品質を持つ高品質なビデオを作成するKling AIの高度なテキスト・トゥ・ビデオ生成モデルv2.1 Master。",
  ko: "텍스트 프롬프트에서 향상된 제어와 영화적 품질을 가진 고품질 비디오를 생성하는 Kling AI의 고급 텍스트-투-비디오 생성 모델 v2.1 Master.",
  es: "El modelo avanzado de generación texto-a-video v2.1 Master de Kling AI que crea videos de alta calidad a partir de prompts de texto con control mejorado y calidad cinematográfica.",
};

export function calculateCredits(request: JsonObject): number {
  const duration = (request.duration as string) || "5";
  return duration === "5" ? 80 : 160;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateQuantity(_request: JsonObject): number {
  // Kling21 models generate only one video per request
  return 1;
}

export function getKling21Model(locale = defaultLocale as Locale): Kling21Model {
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
        key: "duration",
        type: ParameterType.SELECT,
        label: parameterLabels.duration[locale],
        defaultValue: "5",
        options: [
          { value: "5", label: optionLabels["5"][locale] },
          { value: "10", label: optionLabels["10"][locale] },
        ],
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
        key: "negative_prompt",
        type: ParameterType.TEXT,
        label: parameterLabels.negative_prompt[locale],
        defaultValue: "blur, distort, and low quality",
        required: false,
        is_additional: true,
      } as ParameterConfig,

      {
        key: "cfg_scale",
        type: ParameterType.NUMBER,
        label: parameterLabels.cfg_scale[locale],
        defaultValue: 0.5,
        min: 0.1,
        max: 2.0,
        step: 0.1,
        required: false,
        is_additional: true,
      } as ParameterConfig,
    ],
  };

  return {
    icon: "/images/aigc/models/logo/kwai.svg",
    provider: Provider.fal,
    providerModel: "fal-ai/kling-video/v2.1/master/text-to-video",
    company: Company.kwai,
    name: "Kling 2.1 Master",
    description: modelDescription[locale],
    tags: [],
    code: Kling21ModelCode,
    version: "2.1",
    parameterConfig,
    resultType: ResultType.VIDEO,
    modelCategory: ModelCategory.TextToVideo,
    recallable: true,
  };
}
