import { defaultLocale, Locale } from "@/i18n/locales";
import { ModelCategory } from "@/lib/constants";
import { JsonObject } from "@/types/json";
import { Company } from "@/conifg/aigc/companys";
import {
  AspectRatio,
  BaseModel,
  ModelParameterConfig,
  ParameterConfig,
  ParameterType,
  Provider,
  ResultType,
} from "@/conifg/aigc/types";

export const FluxSchnellModelCode = "flux-schnell";

export type FluxSchnellModel = BaseModel;

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
  image_size: {
    en: "Image Size",
    zh: "图片尺寸",
    fr: "Taille d'image",
    de: "Bildgröße",
    it: "Dimensione immagine",
    pt: "Tamanho da imagem",
    ru: "Размер изображения",
    "zh-hk": "圖片尺寸",
    ja: "画像サイズ",
    ko: "이미지 크기",
    es: "Tamaño de imagen",
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
  seed: {
    en: "Seed",
    zh: "随机种子",
    fr: "Graine",
    de: "Startwert",
    it: "Seme",
    pt: "Semente",
    ru: "Сид",
    "zh-hk": "隨機種子",
    ja: "シード",
    ko: "시드",
    es: "Semilla",
  },
  enable_safety_checker: {
    en: "Enable Safety Checker",
    zh: "启用安全检查器",
    fr: "Activer le vérificateur de sécurité",
    de: "Sicherheitsprüfer aktivieren",
    it: "Abilita controllo sicurezza",
    pt: "Ativar verificador de segurança",
    ru: "Включить проверку безопасности",
    "zh-hk": "啟用安全檢查器",
    ja: "安全チェッカーを有効にする",
    ko: "안전 검사기 활성화",
    es: "Activar verificador de seguridad",
  },
};

export const modelDescription: Record<Locale, string> = {
  en: "A fast and efficient AI image generation model, optimized for quick results while maintaining quality",
  zh: "一个快速高效的AI图像生成模型，在保持质量的同时优化了生成速度",
  fr: "Un modèle de génération d'images IA rapide et efficace, optimisé pour des résultats rapides tout en maintenant la qualité",
  de: "Ein schnelles und effizientes KI-Bildgenerierungsmodell, optimiert für schnelle Ergebnisse bei gleichbleibender Qualität",
  it: "Un modello di generazione di immagini IA veloce ed efficiente, ottimizzato per risultati rapidi mantenendo la qualità",
  pt: "Um modelo de geração de imagens IA rápido e eficiente, otimizado para resultados rápidos mantendo a qualidade",
  ru: "Быстрая и эффективная модель генерации изображений ИИ, оптимизированная для быстрых результатов при сохранении качества",
  "zh-hk": "一個快速高效的AI圖像生成模型，在保持質量的同時優化了生成速度",
  ja: "品質を維持しながら、迅速な結果に最適化された高速で効率的なAI画像生成モデル",
  ko: "품질을 유지하면서 빠른 결과를 위해 최적화된 빠르고 효율적인 AI 이미지 생성 모델",
  es: "Un modelo de generación de imágenes IA rápido y eficiente, optimizado para resultados rápidos manteniendo la calidad",
};

export function calculateCredits(request: JsonObject): number {
  const num_images = (request.num_images as number) || 1;
  return 3 * num_images;
}

export function calculateQuantity(request: JsonObject): number {
  const num_images = (request.num_images as number) || 1;
  return num_images;
}

export function getFluxSchnellModel(locale = defaultLocale as Locale): FluxSchnellModel {
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
        key: "image_size",
        type: ParameterType.ASPECT_RATIO,
        label: parameterLabels.image_size[locale],
        defaultValue: "landscape_4_3",
        aspectRatios: [
          { label: "1:1", ratio: { w: 1, h: 1 }, value: "square_hd", tip: "512x512" },
          { label: "1:1 HD", ratio: { w: 1, h: 1 }, value: "square", tip: "1024x1024" },
          { label: "4:3", ratio: { w: 3, h: 4 }, value: "portrait_4_3", tip: "1024x768" },
          { label: "16:9", ratio: { w: 9, h: 16 }, value: "portrait_16_9", tip: "1024x576" },
          { label: "4:3", ratio: { w: 4, h: 3 }, value: "landscape_4_3", tip: "768x1024" },
          { label: "16:9", ratio: { w: 16, h: 9 }, value: "landscape_16_9", tip: "922x576" },
        ] as AspectRatio[],
        allowCustomRatio: true,
        customRange: {
          w: { min: 512, max: 1024, default: 768, step: 8 },
          h: { min: 512, max: 1024, default: 768, step: 8 },
        },
        customRatioConvert: ({ width, height }) => {
          return { width, height };
        },
        required: true,
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
        key: "num_inference_steps",
        type: ParameterType.NUMBER,
        label: parameterLabels.num_inference_steps[locale],
        defaultValue: 4,
        min: 1,
        max: 50,
        step: 1,
        required: false,
      } as ParameterConfig,

      {
        key: "seed",
        type: ParameterType.SEED,
        label: parameterLabels.seed[locale],
        defaultValue: "",
        required: false,
      } as ParameterConfig,

      {
        key: "enable_safety_checker",
        type: ParameterType.BOOLEAN,
        label: parameterLabels.enable_safety_checker[locale],
        defaultValue: true,
        required: false,
      } as ParameterConfig,
    ],
  };

  return {
    icon: "/images/aigc/models/logo/black-forest-labs.svg",
    provider: Provider.fal,
    providerModel: "fal-ai/flux-1/schnell",
    company: Company.blackForestLabs,
    name: "Flux Schnell",
    description: modelDescription[locale],
    tags: [],
    code: FluxSchnellModelCode,
    version: "1.0",
    parameterConfig,
    resultType: ResultType.IMAGE,
    modelCategory: ModelCategory.TextToImage,
    recallable: true,
  };
}
