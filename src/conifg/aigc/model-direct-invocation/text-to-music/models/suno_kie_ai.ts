import { Company } from "@/conifg/aigc/companys";
import {
  BaseModel,
  ModelParameterConfig,
  ParameterConfig,
  ParameterType,
  Provider,
  ResultType,
} from "@/conifg/aigc/types";
import { defaultLocale, Locale } from "@/i18n/locales";
import { ModelCategory } from "@/lib/constants";
import { JsonObject } from "@/types/json";

export const SunoModelCode = "suno_kie_ai";

export type SunoModel = BaseModel;

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
  customMode: {
    en: "Custom Mode",
    zh: "自定义模式",
    fr: "Mode personnalisé",
    de: "Benutzerdefinierter Modus",
    it: "Modalità personalizzata",
    pt: "Modo personalizado",
    ru: "Пользовательский режим",
    "zh-hk": "自定義模式",
    ja: "カスタムモード",
    ko: "커스텀 모드",
    es: "Modo personalizado",
  },
  instrumental: {
    en: "Instrumental",
    zh: "纯音乐",
    fr: "Instrumental",
    de: "Instrumental",
    it: "Strumentale",
    pt: "Instrumental",
    ru: "Инструментальный",
    "zh-hk": "純音樂",
    ja: "インストゥルメンタル",
    ko: "연주곡",
    es: "Instrumental",
  },
  style: {
    en: "Style",
    zh: "风格",
    fr: "Style",
    de: "Stil",
    it: "Stile",
    pt: "Estilo",
    ru: "Стиль",
    "zh-hk": "風格",
    ja: "スタイル",
    ko: "스타일",
    es: "Estilo",
  },
  title: {
    en: "Title",
    zh: "标题",
    fr: "Titre",
    de: "Titel",
    it: "Titolo",
    pt: "Título",
    ru: "Название",
    "zh-hk": "標題",
    ja: "タイトル",
    ko: "제목",
    es: "Título",
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
  negativeTags: {
    en: "Negative Tags",
    zh: "排除标签",
    fr: "Tags négatifs",
    de: "Negative Tags",
    it: "Tag negativi",
    pt: "Tags negativas",
    ru: "Негативные теги",
    "zh-hk": "排除標籤",
    ja: "ネガティブタグ",
    ko: "네거티브 태그",
    es: "Etiquetas negativas",
  },
};

export const modelDescription: Record<Locale, string> = {
  en: "Suno AI music generation model that creates high-quality music with lyrics based on text prompts. Supports both custom mode and simple mode for different levels of control.",
  zh: "Suno AI音乐生成模型，基于文本提示词创建带有歌词的高质量音乐。支持自定义模式和简单模式，提供不同级别的控制。",
  fr: "Modèle de génération musicale Suno AI qui crée de la musique de haute qualité avec des paroles basées sur des invites textuelles. Prend en charge le mode personnalisé et le mode simple pour différents niveaux de contrôle.",
  de: "Suno AI Musikgenerierungsmodell, das hochwertige Musik mit Texten basierend auf Textaufforderungen erstellt. Unterstützt sowohl benutzerdefinierten Modus als auch einfachen Modus für verschiedene Kontrollstufen.",
  it: "Modello di generazione musicale Suno AI che crea musica di alta qualità con testi basati su prompt testuali. Supporta sia la modalità personalizzata che quella semplice per diversi livelli di controllo.",
  pt: "Modelo de geração musical Suno AI que cria música de alta qualidade com letras baseadas em prompts de texto. Suporta tanto o modo personalizado quanto o modo simples para diferentes níveis de controle.",
  ru: "Модель генерации музыки Suno AI, которая создает высококачественную музыку с текстами на основе текстовых подсказок. Поддерживает как пользовательский режим, так и простой режим для разных уровней контроля.",
  "zh-hk":
    "Suno AI音樂生成模型，基於文本提示詞創建帶有歌詞的高質量音樂。支持自定義模式和簡單模式，提供不同級別的控制。",
  ja: "テキストプロンプトに基づいて歌詞付きの高品質音楽を作成するSuno AI音楽生成モデル。異なるレベルの制御のためのカスタムモードとシンプルモードの両方をサポート。",
  ko: "텍스트 프롬프트를 기반으로 가사가 있는 고품질 음악을 생성하는 Suno AI 음악 생성 모델. 다양한 제어 수준을 위한 커스텀 모드와 심플 모드를 모두 지원합니다.",
  es: "Modelo de generación musical Suno AI que crea música de alta calidad con letras basadas en prompts de texto. Soporta tanto el modo personalizado como el modo simple para diferentes niveles de control.",
};

export function calculateCredits(request: JsonObject): number {
  // Base credits for music generation
  const baseCredits = 50;
  const customMode = (request.customMode as boolean) ?? false;

  // Custom mode may use more resources
  return customMode ? Math.round(baseCredits * 1.2) : baseCredits;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateQuantity(_request: JsonObject): number {
  // Suno typically generates 2 variations per request
  return 2;
}

export function getSunoModel(locale = defaultLocale as Locale): SunoModel {
  const parameterConfig: ModelParameterConfig = {
    parameters: [
      {
        key: "prompt",
        type: ParameterType.TEXT,
        label: parameterLabels.prompt[locale],
        defaultValue: "",
        required: true,
        text_max_length: ({ userInput }) => {
          const customMode = Boolean(userInput.customMode);
          const model = (userInput.model as string) ?? "V3_5";

          if (!customMode) {
            return 400; // Non-custom mode limit
          }

          return model === "V4_5" ? 5000 : 3000;
        },
      } as ParameterConfig,

      {
        key: "customMode",
        type: ParameterType.BOOLEAN,
        label: parameterLabels.customMode[locale],
        defaultValue: false,
        required: true,
        description: "Enable custom mode for more detailed control",
      } as ParameterConfig,

      {
        key: "instrumental",
        type: ParameterType.BOOLEAN,
        label: parameterLabels.instrumental[locale],
        defaultValue: false,
        required: true,
        is_additional: true,
      } as ParameterConfig,

      {
        key: "style",
        type: ParameterType.TEXT,
        label: parameterLabels.style[locale],
        defaultValue: "",
        required: false,
        showWhen: { customMode: true },
        is_additional: true,
        text_max_length: ({ userInput }) => {
          const model = (userInput.model as string) ?? "V3_5";
          return model === "V4_5" ? 1000 : 200;
        },
      } as ParameterConfig,

      {
        key: "title",
        type: ParameterType.TEXT,
        label: parameterLabels.title[locale],
        defaultValue: "",
        required: false,
        showWhen: { customMode: true },
        is_additional: true,
        text_max_length: 80,
      } as ParameterConfig,

      {
        key: "model",
        type: ParameterType.SELECT,
        label: parameterLabels.model[locale],
        defaultValue: "V4_5",
        options: [
          { value: "V3_5", label: "V3.5" },
          { value: "V4", label: "V4" },
          { value: "V4_5", label: "V4.5" },
        ],
        required: false,
        is_additional: true,
      } as ParameterConfig,

      {
        key: "negativeTags",
        type: ParameterType.TEXT,
        label: parameterLabels.negativeTags[locale],
        defaultValue: "",
        required: false,
        is_additional: true,
        description: "Music styles or traits to exclude from the generated audio",
      } as ParameterConfig,
    ],
  };

  return {
    icon: "/images/aigc/models/logo/suno.svg",
    provider: Provider.kie_ai,
    providerModel: "suno",
    company: Company.suno,
    name: "Suno",
    description: modelDescription[locale],
    tags: ["music", "lyrics", "ai-generated"],
    code: SunoModelCode,
    version: "1.0",
    parameterConfig,
    resultType: ResultType.AUDIO,
    modelCategory: ModelCategory.TextToMusic,
    recallable: true,
    extra: {
      endpoint: "/api/v1/generate",
      supports_callback: true,
    },
  };
}
