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

export type ImageCombineTemplate = BaseModel;

// Multi-language parameter labels
const parameterLabels = {
  images: {
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
  combine_mode: {
    en: "Combine Mode",
    zh: "合成模式",
    fr: "Mode de combinaison",
    de: "Kombinationsmodus",
    it: "Modalità di combinazione",
    pt: "Modo de combinação",
    ru: "Режим комбинирования",
    "zh-hk": "合成模式",
    ja: "結合モード",
    ko: "결합 모드",
    es: "Modo de combinación",
  },
};

// Multi-language combine mode option labels
const combineModeLabels = {
  side_by_side: {
    en: "Side by Side",
    zh: "并排",
    fr: "Côte à côte",
    de: "Nebeneinander",
    it: "Fianco a fianco",
    pt: "Lado a lado",
    ru: "Рядом",
    "zh-hk": "並排",
    ja: "横並び",
    ko: "나란히",
    es: "Lado a lado",
  },
  grid: {
    en: "Grid Layout",
    zh: "网格布局",
    fr: "Disposition en grille",
    de: "Rasterlayout",
    it: "Layout a griglia",
    pt: "Layout de grade",
    ru: "Сетка",
    "zh-hk": "網格佈局",
    ja: "グリッドレイアウト",
    ko: "그리드 레이아웃",
    es: "Diseño de cuadrícula",
  },
  overlay: {
    en: "Overlay",
    zh: "叠加",
    fr: "Superposition",
    de: "Überlagerung",
    it: "Sovrapposizione",
    pt: "Sobreposição",
    ru: "Наложение",
    "zh-hk": "疊加",
    ja: "オーバーレイ",
    ko: "오버레이",
    es: "Superposición",
  },
};

export const templateDescription: Record<Locale, string> = {
  en: "Image Combine Template - Combine multiple images into a single composition using various layout modes.",
  zh: "图片合成模板 - 使用各种布局模式将多张图片合成为一张图片。",
  fr: "Modèle de combinaison d'images - Combinez plusieurs images en une seule composition en utilisant divers modes de mise en page.",
  de: "Bildkombinations-Vorlage - Kombinieren Sie mehrere Bilder zu einer einzigen Komposition mit verschiedenen Layout-Modi.",
  it: "Template combinazione immagini - Combina più immagini in una singola composizione utilizzando varie modalità di layout.",
  pt: "Template combinação de imagens - Combine várias imagens em uma única composição usando vários modos de layout.",
  ru: "Шаблон комбинирования изображений - Объедините несколько изображений в одну композицию, используя различные режимы макета.",
  "zh-hk": "圖片合成模板 - 使用各種佈局模式將多張圖片合成為一張圖片。",
  ja: "画像結合テンプレート - 様々なレイアウトモードを使用して複数の画像を1つの構成に結合します。",
  ko: "이미지 결합 템플릿 - 다양한 레이아웃 모드를 사용하여 여러 이미지를 하나의 구성으로 결합합니다.",
  es: "Plantilla combinación de imágenes - Combina múltiples imágenes en una sola composición usando varios modos de diseño.",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateCredits(request: JsonObject, _systemRequest?: JsonObject): number {
  const images = (request.images as string[]) || [];
  const baseCredits = 5; // Base credit cost
  const imageCountMultiplier = Math.max(1, images.length * 0.5); // Additional cost based on image count

  return Math.ceil(baseCredits * imageCountMultiplier);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateQuantity(_request: JsonObject, _systemRequest?: JsonObject): number {
  return 1;
}

export function getImageCombineTemplate(locale = defaultLocale as Locale): ImageCombineTemplate {
  const parameterConfig: ModelParameterConfig = {
    parameters: [
      {
        key: "images",
        type: ParameterType.IMAGES,
        label: parameterLabels.images[locale],
        image_count: 5, // Allow up to 5 images
        defaultValue: "",
        required: true,
      } as ParameterConfig,

      {
        key: "combine_mode",
        type: ParameterType.SELECT,
        label: parameterLabels.combine_mode[locale],
        options: [
          {
            value: "side_by_side",
            label: combineModeLabels.side_by_side[locale],
          },
          {
            value: "grid",
            label: combineModeLabels.grid[locale],
          },
          {
            value: "overlay",
            label: combineModeLabels.overlay[locale],
          },
        ],
        defaultValue: "side_by_side",
        required: true,
      } as ParameterConfig,
    ],
  };

  return {
    icon: "/images/aigc/models/logo/image-combine-template.svg",
    provider: Provider.fal, // Use existing provider
    providerModel: "template-image-combine",
    company: Company.openai,
    name: "Image Combine",
    description: templateDescription[locale],
    tags: ["image", "combine", "template"],
    code: "image-combine",
    version: "1.0",
    parameterConfig,
    resultType: ResultType.IMAGE,
    modelCategory: ModelCategory.ImageToImage,
  };
}
