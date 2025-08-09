import { Company } from "@/conifg/aigc/companys";
import { ImageToImageModelCode } from "@/conifg/aigc/model-direct-invocation/image-to-image";
import { getFluxProKontextMaxMultiModel } from "@/conifg/aigc/model-direct-invocation/image-to-image/models/flux-pro-kontext-max-multi";
import { getGPT4oModel } from "@/conifg/aigc/model-direct-invocation/image-to-image/models/gpt4o";
import {
  BaseModel,
  ModelParameterConfig,
  ParameterConfig,
  ParameterType,
  Provider,
  ResultType,
} from "@/conifg/aigc/types";
import { defaultLocale, Locale } from "@/i18n/locales";
import { ModelCategory, TemplateType } from "@/lib/constants";
import { JsonObject } from "@/types/json";

export type AnimeStyleTemplate = BaseModel;

// Multi-language parameter labels
const parameterLabels = {
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
  model_selection: {
    en: "Model Selection",
    zh: "模型选择",
    fr: "Sélection de modèle",
    de: "Modellauswahl",
    it: "Selezione modello",
    pt: "Seleção de modelo",
    ru: "Выбор модели",
    "zh-hk": "模型選擇",
    ja: "モデル選択",
    ko: "모델 선택",
    es: "Selección de modelo",
  },
  anime_style: {
    en: "Anime Style",
    zh: "动画风格",
    fr: "Style d'anime",
    de: "Anime-Stil",
    it: "Stile anime",
    pt: "Estilo anime",
    ru: "Аниме стиль",
    "zh-hk": "動畫風格",
    ja: "アニメスタイル",
    ko: "애니메이션 스타일",
    es: "Estilo anime",
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

// Multi-language style option labels
const styleOptionLabels = {
  ghibli: {
    en: "Studio Ghibli",
    zh: "吉卜力工作室",
    fr: "Studio Ghibli",
    de: "Studio Ghibli",
    it: "Studio Ghibli",
    pt: "Studio Ghibli",
    ru: "Студия Гибли",
    "zh-hk": "吉卜力工作室",
    ja: "スタジオジブリ",
    ko: "스튜디오 지브리",
    es: "Studio Ghibli",
  },
  shinkai: {
    en: "Makoto Shinkai",
    zh: "新海诚",
    fr: "Makoto Shinkai",
    de: "Makoto Shinkai",
    it: "Makoto Shinkai",
    pt: "Makoto Shinkai",
    ru: "Макото Синкай",
    "zh-hk": "新海誠",
    ja: "新海誠",
    ko: "신카이 마코토",
    es: "Makoto Shinkai",
  },
  pixar: {
    en: "Pixar",
    zh: "皮克斯",
    fr: "Pixar",
    de: "Pixar",
    it: "Pixar",
    pt: "Pixar",
    ru: "Пиксар",
    "zh-hk": "彼思",
    ja: "ピクサー",
    ko: "픽사",
    es: "Pixar",
  },
  classic: {
    en: "Classic Japanese Anime",
    zh: "经典日漫",
    fr: "Anime japonais classique",
    de: "Klassischer japanischer Anime",
    it: "Anime giapponese classico",
    pt: "Anime japonês clássico",
    ru: "Классическое японское аниме",
    "zh-hk": "經典日漫",
    ja: "クラシック日本アニメ",
    ko: "클래식 일본 애니메이션",
    es: "Anime japonés clásico",
  },
};

export const templateDescription: Record<Locale, string> = {
  en: "Anime Style Template - Transform your images into beautiful anime-style artwork using advanced AI models.",
  zh: "动漫风格模板 - 使用先进的 AI 模型将您的图片转换为精美的动漫风格艺术作品。",
  fr: "Modèle de style anime - Transformez vos images en magnifiques œuvres d'art de style anime en utilisant des modèles IA avancés.",
  de: "Anime-Stil-Vorlage - Verwandeln Sie Ihre Bilder mit fortschrittlichen KI-Modellen in wunderschöne Kunstwerke im Anime-Stil.",
  it: "Template stile anime - Trasforma le tue immagini in bellissime opere d'arte in stile anime utilizzando modelli IA avanzati.",
  pt: "Template estilo anime - Transforme suas imagens em belas obras de arte no estilo anime usando modelos IA avançados.",
  ru: "Шаблон аниме-стиля - Превратите ваши изображения в прекрасные произведения искусства в стиле аниме, используя передовые модели ИИ.",
  "zh-hk": "動漫風格模板 - 使用先進的 AI 模型將您的圖片轉換為精美的動漫風格藝術作品。",
  ja: "アニメスタイルテンプレート - 高度なAIモデルを使用して、あなたの画像を美しいアニメスタイルのアートワークに変換します。",
  ko: "애니메이션 스타일 템플릿 - 고급 AI 모델을 사용하여 이미지를 아름다운 애니메이션 스타일 아트워크로 변환합니다.",
  es: "Plantilla estilo anime - Transforma tus imágenes en hermosas obras de arte estilo anime usando modelos de IA avanzados.",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateCredits(request: JsonObject, _systemRequest?: JsonObject): number {
  const modelSelection = request.model_selection as string;
  const baseCredits = modelSelection === ImageToImageModelCode.gpt4o ? 20 : 25;

  // You can use _systemRequest here for more complex credit calculations if needed
  // For example: const multiplier = _systemRequest?.complexity_multiplier || 1;

  return baseCredits;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateQuantity(_request: JsonObject, _systemRequest?: JsonObject): number {
  // You can use _request and _systemRequest here for quantity calculations if needed
  // For example: const quantity = _request.batch_size || 1;

  return 1;
}

export function isRecallable(request: JsonObject): boolean {
  const modelSelection = request.model_selection as string;
  // GPT-4o models are not recallable
  return modelSelection !== ImageToImageModelCode.gpt4o;
}

export function getAnimeStyleTemplate(locale = defaultLocale as Locale): AnimeStyleTemplate {
  // Get available models for selection
  const availableModels = [getFluxProKontextMaxMultiModel(locale), getGPT4oModel(locale)];

  const parameterConfig: ModelParameterConfig = {
    parameters: [
      {
        key: "image_url",
        type: ParameterType.IMAGES,
        label: parameterLabels.image_url[locale],
        image_count: 1,
        defaultValue: "",
        required: true,
      } as ParameterConfig,

      {
        key: "model",
        type: ParameterType.MODEL,
        label: parameterLabels.model_selection[locale],
        defaultValue: getFluxProKontextMaxMultiModel(locale).code,
        models: availableModels,
        required: true,
      } as ParameterConfig,

      {
        key: "anime_style",
        type: ParameterType.SELECT,
        label: parameterLabels.anime_style[locale],
        has_cover: true,
        options: [
          {
            value: "ghibli",
            label: styleOptionLabels.ghibli[locale],
            cover:
              "https://meterial.example.ai/meterial/aigc/template/anime-style-image/glibli.avif",
          },
          {
            value: "shinkai",
            label: styleOptionLabels.shinkai[locale],
            cover:
              "https://meterial.example.ai/meterial/aigc/template/anime-style-image/shinkai.avif",
          },
          {
            value: "pixar",
            label: styleOptionLabels.pixar[locale],
            cover:
              "https://meterial.example.ai/meterial/aigc/template/anime-style-image/pixar.avif",
          },
        ],
        defaultValue: "ghibli",
        required: true,
      } as ParameterConfig,

      {
        key: "aspect_ratio",
        type: ParameterType.ASPECT_RATIO,
        label: parameterLabels.aspect_ratio[locale],
        defaultValue: "1:1",
        aspectRatios: [
          { label: "1:1", ratio: { w: 1, h: 1 }, value: "1:1" },
          { label: "16:9", ratio: { w: 16, h: 9 }, value: "16:9" },
          { label: "9:16", ratio: { w: 9, h: 16 }, value: "9:16" },
          { label: "4:3", ratio: { w: 4, h: 3 }, value: "4:3" },
          { label: "3:4", ratio: { w: 3, h: 4 }, value: "3:4" },
          { label: "2:3", ratio: { w: 2, h: 3 }, value: "2:3" },
          { label: "3:2", ratio: { w: 3, h: 2 }, value: "3:2" },
        ],
        required: true,
      } as ParameterConfig,
    ],
  };

  return {
    icon: "/images/aigc/models/logo/anime-template.svg",
    provider: Provider.fal, // Default provider, will be overridden based on model selection
    providerModel: "template-anime-style",
    company: Company.blackForestLabs,
    name: "Anime Style",
    description: templateDescription[locale],
    tags: ["anime", "style-transfer", "template"],
    code: TemplateType.StylizedAnimeImage,
    version: "1.0",
    parameterConfig,
    resultType: ResultType.IMAGE,
    modelCategory: ModelCategory.ImageToImage,
    recallable: isRecallable,
  };
}
