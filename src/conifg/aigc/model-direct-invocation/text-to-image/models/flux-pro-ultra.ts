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

export const FluxProUltraModelCode = "flux-pro-v1.1-ultra";

export type FluxProUltraModel = BaseModel;

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
  en: "The newest version of FLUX1.1 [pro], maintaining professional-grade image quality while delivering up to 2K resolution with improved photo realism.",
  zh: "FLUX1.1 [pro] 的最新版本，在保持专业级图像质量的同时，通过改进的摄影真实感提供高达 2K 的分辨率",
  fr: "La dernière version de FLUX1.1 [pro], maintenant une qualité d'image professionnelle tout en offrant une résolution jusqu'à 2K avec une photo réaliste améliorée",
  de: "Die neueste Version von FLUX1.1 [pro], die professionelle Bildqualität beibehält, während sie mit verbessertem Foto-Realismus bis zu 2K-Auflösung liefert",
  it: "La versione più recente di FLUX1.1 [pro], mantenendo alta qualità immagine professionale mentre offre una risoluzione fino a 2K con un'immagine migliorata",
  pt: "A versão mais recente do FLUX1.1 [pro], mantendo a qualidade de imagem profissional enquanto oferece uma resolução até 2K com uma foto realista melhorada",
  ru: "Последняя версия FLUX1.1 [pro], сохраняя профессиональное качество изображения, обеспечивая до 2K разрешение с улучшенной фотореалистичностью",
  "zh-hk":
    "FLUX1.1 [pro] 的最新版本，在保持專業級圖像質量的同時，通過改進的攝影真實感提供高達 2K 的分辨率",
  ja: "最新の FLUX1.1 [pro] バージョンは、プロの画像品質を維持しながら、改進された写真のリアリズムで最高 2K の解像度を提供します",
  ko: "최신 FLUX1.1 [pro] 버전은 전문 이미지 품질을 유지하면서 개선된 사진 리얼리즘으로 최대 2K 해상도를 제공합니다",
  es: "La última versión de FLUX1.1 [pro], manteniendo una calidad de imagen profesional mientras ofrece una resolución hasta 2K con una foto realista mejorada",
};

export function calculateCredits(request: JsonObject): number {
  const num_images = (request.num_images as number) || 1;
  return 10 * num_images;
}

export function calculateQuantity(request: JsonObject): number {
  const num_images = (request.num_images as number) || 1;
  return num_images;
}

export function getFluxProUltraModel(locale = defaultLocale as Locale): FluxProUltraModel {
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
    ],
  };

  return {
    icon: "/images/aigc/models/logo/black-forest-labs.svg",
    provider: Provider.fal,
    providerModel: "fal-ai/flux-pro/v1.1-ultra",
    company: Company.blackForestLabs,
    name: "Flux Pro v1.1 Ultra",
    description: modelDescription[locale],
    tags: [],
    code: FluxProUltraModelCode,
    version: "1.1-ultra",
    parameterConfig,
    resultType: ResultType.IMAGE,
    modelCategory: ModelCategory.TextToImage,
    recallable: true,
  };
}
