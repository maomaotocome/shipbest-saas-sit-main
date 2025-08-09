import { ModelCategory, TemplateType } from "@/lib/constants";
import { JsonObject, JsonValue } from "@/types/json";
import { Company } from "./companys";

export enum Provider {
  fal = "fal",
  replicate = "replicate",
  openai_next = "openai_next",
  kie_ai = "kie_ai",
  unknown = "unknown",
}

export interface AspectRatio {
  label: string;
  ratio: { w: number; h: number };
  value: string;
  tip?: string; // tooltip text
}

// parameter type definition
export enum ParameterType {
  NUMBER = "number",
  SELECT = "select",
  BOOLEAN = "boolean",
  ASPECT_RATIO = "aspect_ratio",
  TEXT = "text",
  IMAGES = "images",
  SEED = "seed",
  MODEL = "model",
}

export enum ResultType {
  IMAGE = "image",
  IMAGE_LIST = "image_list",
  VIDEO = "video",
  VIDEO_LIST = "video_list",
  AUDIO = "audio",
  TEXT = "text",
  JSON = "json",
  CSV = "csv",
  PDF = "pdf",
  HTML = "html",
  THREE_D = "3d",
}

// Forward declaration for BaseModel to avoid circular dependency
export interface BaseModel {
  icon: string;
  provider: Provider;
  providerModel: string;
  company: Company;
  code: string;
  version: string;
  name: string;
  description: string;
  tags: string[];
  parameterConfig: ModelParameterConfig;
  resultType: ResultType;
  modelCategory?: ModelCategory;
  templateType?: TemplateType;
  extra?: JsonObject;
  recallable?: boolean | ((request: JsonObject) => boolean);
}

// parameter config interface
export interface ParameterConfig {
  key: string;
  type: ParameterType;
  label: string;
  description?: string;
  defaultValue: JsonValue;
  required?: boolean;
  // text type config
  text_max_length?:
    | number
    | (({
        parameterConfig,
        userInput,
      }: {
        parameterConfig: ModelParameterConfig;
        userInput: JsonObject;
      }) => number);
  enable_translate?: boolean;
  translate_to?: string; // default is "English"
  enable_prompt_optimize?: boolean; // whether to enable optimize, default is false
  // image type config
  image_count?: number;
  // number type config
  min?: number;
  max?: number;
  step?: number;
  values?: number[]; // discrete values
  number_unit?: string; // unit of number type, like "s", "px"
  // select type config
  options?: Array<{ value: string | number | boolean; label: string; cover?: string }>;
  has_cover?: boolean;
  // aspect ratio type config
  aspectRatios?: AspectRatio[];
  allowCustomRatio?: boolean; // whether to allow custom aspect ratios
  customRange?: {
    w: { min: number; max: number; default?: number; step?: number };
    h: { min: number; max: number; default?: number; step?: number };
  };
  customRatioConvert?: ({ width, height }: { width: number; height: number }) => JsonValue;
  // model type config
  models?: BaseModel[];
  // dependencies
  dependencies?: string[];
  // show when
  showWhen?: Record<string, string | number | boolean>;
  is_additional?: boolean; // whether the parameter is additional, default is false

  // collapse
  collapsible?: boolean;
  defaultCollapsed?: boolean;

  hidden?: boolean; // whether the parameter is hidden, default is false
}

// model parameter config
export interface ModelParameterConfig {
  parameters: ParameterConfig[];
}

// Enhanced model interface with system-level methods
export interface EnhancedModel extends BaseModel {
  // Calculate credits based on request parameters
  calculateCredits: (request: JsonObject) => number;

  // Merge user request with system parameters (server-side only)
  mergeSystemParameters?: (userRequest: JsonObject, systemRequest?: JsonObject) => JsonObject;

  // Get built-in parameters that are not exposed to users
  getBuiltInParameters?: () => JsonObject;

  // Get system prompt or reference images (server-side only)
  getSystemPrompt?: (request: JsonObject) => string | null;
  getSystemReferenceImages?: (request: JsonObject) => string[] | null;

  // Style-specific credit calculation
  calculateStyleCredits?: (style: string, baseCredits: number) => number;
}
