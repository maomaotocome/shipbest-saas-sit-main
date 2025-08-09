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

export const FluxProKontextMaxMultiModelCode = "fal-ai/flux-pro/kontext/max/multi";

export type FluxProKontextMaxMultiModel = BaseModel;

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
  image_urls: {
    en: "Input Images",
    zh: "输入图片",
    fr: "Images d'entrée",
    de: "Eingabebilder",
    it: "Immagini di input",
    pt: "Imagens de entrada",
    ru: "Входные изображения",
    "zh-hk": "輸入圖片",
    ja: "入力画像",
    ko: "입력 이미지",
    es: "Imágenes de entrada",
  },
  seed: {
    en: "Seed",
    zh: "随机种子",
    fr: "Graine",
    de: "Samen",
    it: "Seme",
    pt: "Semente",
    ru: "Семя",
    "zh-hk": "隨機種子",
    ja: "シード",
    ko: "시드",
    es: "Semilla",
  },
  guidance_scale: {
    en: "Guidance Scale",
    zh: "引导强度",
    fr: "Échelle de guidage",
    de: "Führungsskala",
    it: "Scala di guida",
    pt: "Escala de orientação",
    ru: "Масштаб руководства",
    "zh-hk": "引導強度",
    ja: "ガイダンススケール",
    ko: "가이던스 스케일",
    es: "Escala de guía",
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
  safety_tolerance: {
    en: "Safety Tolerance",
    zh: "安全容忍度",
    fr: "Tolérance de sécurité",
    de: "Sicherheitstoleranz",
    it: "Tolleranza di sicurezza",
    pt: "Tolerância de segurança",
    ru: "Допуск безопасности",
    "zh-hk": "安全容忍度",
    ja: "安全許容度",
    ko: "안전 허용도",
    es: "Tolerancia de seguridad",
  },
  output_format: {
    en: "Output Format",
    zh: "输出格式",
    fr: "Format de sortie",
    de: "Ausgabeformat",
    it: "Formato di output",
    pt: "Formato de saída",
    ru: "Формат вывода",
    "zh-hk": "輸出格式",
    ja: "出力フォーマット",
    ko: "출력 형식",
    es: "Formato de salida",
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
  sync_mode: {
    en: "Sync Mode",
    zh: "同步模式",
    fr: "Mode synchrone",
    de: "Sync-Modus",
    it: "Modalità sincrona",
    pt: "Modo síncrono",
    ru: "Синхронный режим",
    "zh-hk": "同步模式",
    ja: "同期モード",
    ko: "동기 모드",
    es: "Modo síncrono",
  },
};

// Multi-language option labels
const optionLabels = {
  jpeg: {
    en: "JPEG",
    zh: "JPEG",
    fr: "JPEG",
    de: "JPEG",
    it: "JPEG",
    pt: "JPEG",
    ru: "JPEG",
    "zh-hk": "JPEG",
    ja: "JPEG",
    ko: "JPEG",
    es: "JPEG",
  },
  png: {
    en: "PNG",
    zh: "PNG",
    fr: "PNG",
    de: "PNG",
    it: "PNG",
    pt: "PNG",
    ru: "PNG",
    "zh-hk": "PNG",
    ja: "PNG",
    ko: "PNG",
    es: "PNG",
  },
};

export const modelDescription: Record<Locale, string> = {
  en: "Flux Pro Kontext Max Multi - Advanced multi-image composition model that combines multiple input images with text prompts to create sophisticated image compositions.",
  zh: "Flux Pro Kontext Max Multi - 先进的多图像合成模型，能够将多张输入图像与文本提示相结合，创建复杂的图像合成作品。",
  fr: "Flux Pro Kontext Max Multi - Modèle avancé de composition multi-images qui combine plusieurs images d'entrée avec des invites textuelles pour créer des compositions d'images sophistiquées.",
  de: "Flux Pro Kontext Max Multi - Fortschrittliches Multi-Bild-Kompositionsmodell, das mehrere Eingabebilder mit Textaufforderungen kombiniert, um anspruchsvolle Bildkompositionen zu erstellen.",
  it: "Flux Pro Kontext Max Multi - Modello avanzato di composizione multi-immagine che combina più immagini di input con prompt testuali per creare composizioni sofisticate.",
  pt: "Flux Pro Kontext Max Multi - Modelo avançado de composição multi-imagem que combina múltiplas imagens de entrada com prompts de texto para criar composições sofisticadas.",
  ru: "Flux Pro Kontext Max Multi - Продвинутая модель композиции из нескольких изображений, которая объединяет несколько входных изображений с текстовыми подсказками для создания сложных композиций.",
  "zh-hk":
    "Flux Pro Kontext Max Multi - 先進的多圖像合成模型，能夠將多張輸入圖像與文本提示相結合，創建複雜的圖像合成作品。",
  ja: "Flux Pro Kontext Max Multi - 複数の入力画像とテキストプロンプトを組み合わせて洗練された画像合成を作成する高度なマルチ画像合成モデル。",
  ko: "Flux Pro Kontext Max Multi - 여러 입력 이미지와 텍스트 프롬프트를 결합하여 정교한 이미지 합성을 만드는 고급 멀티 이미지 합성 모델.",
  es: "Flux Pro Kontext Max Multi - Modelo avanzado de composición multi-imagen que combina múltiples imágenes de entrada con prompts de texto para crear composiciones sofisticadas.",
};

export function calculateCredits(request: JsonObject): number {
  const numImages = (request.num_images as number) || 1;
  return 25 * numImages; // Higher cost due to multi-image processing
}

export function calculateQuantity(request: JsonObject): number {
  const numImages = (request.num_images as number) || 1;
  return numImages;
}

export function getFluxProKontextMaxMultiModel(
  locale = defaultLocale as Locale
): FluxProKontextMaxMultiModel {
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
        key: "image_urls",
        type: ParameterType.IMAGES,
        label: parameterLabels.image_urls[locale],
        image_count: 5, // Support up to 5 images
        defaultValue: "",
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
        required: false,
        is_additional: true,
      } as ParameterConfig,

      {
        key: "seed",
        type: ParameterType.SEED,
        label: parameterLabels.seed[locale],
        defaultValue: -1,
        required: false,
        is_additional: true,
      } as ParameterConfig,

      {
        key: "guidance_scale",
        type: ParameterType.NUMBER,
        label: parameterLabels.guidance_scale[locale],
        defaultValue: 3.5,
        min: 1.0,
        max: 20.0,
        step: 0.5,
        required: false,
        is_additional: true,
      } as ParameterConfig,

      {
        key: "num_images",
        type: ParameterType.NUMBER,
        label: parameterLabels.num_images[locale],
        defaultValue: 1,
        min: 1,
        max: 4,
        step: 1,
        required: false,
        is_additional: true,
      } as ParameterConfig,

      {
        key: "safety_tolerance",
        type: ParameterType.SELECT,
        label: parameterLabels.safety_tolerance[locale],
        defaultValue: "2",
        options: [
          { value: "1", label: "1 (Most Strict)" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5" },
          { value: "6", label: "6 (Most Permissive)" },
        ],
        required: false,
        is_additional: true,
      } as ParameterConfig,

      {
        key: "output_format",
        type: ParameterType.SELECT,
        label: parameterLabels.output_format[locale],
        defaultValue: "jpeg",
        options: [
          { value: "jpeg", label: optionLabels.jpeg[locale] },
          { value: "png", label: optionLabels.png[locale] },
        ],
        required: false,
        is_additional: true,
      } as ParameterConfig,

      {
        key: "sync_mode",
        type: ParameterType.BOOLEAN,
        label: parameterLabels.sync_mode[locale],
        defaultValue: false,
        required: false,
        is_additional: true,
      } as ParameterConfig,
    ],
  };

  return {
    icon: "/images/aigc/models/logo/black-forest-labs.svg",
    provider: Provider.fal,
    providerModel: "fal-ai/flux-pro/kontext/max/multi",
    company: Company.blackForestLabs,
    name: "Flux Pro Kontext Max Multi",
    description: modelDescription[locale],
    tags: ["multi-image", "composition"],
    code: FluxProKontextMaxMultiModelCode,
    version: "1.0",
    parameterConfig,
    resultType: ResultType.IMAGE,
    modelCategory: ModelCategory.ImageToImage,
    recallable: true,
  };
}
