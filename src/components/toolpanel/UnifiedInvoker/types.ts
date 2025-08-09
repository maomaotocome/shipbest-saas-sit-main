import { BaseModel } from "@/conifg/aigc/types";
import { ModelCategory, TaskType, TemplateType } from "@/lib/constants";
import { JsonObject } from "@/types/json";

export type Model = BaseModel;
export type DemoType = "image" | "video" | "audio";
export type InvokerMode = "template" | "model";

export interface UnifiedInvokerProps {
  /**
   * Task type to invoke. Determines whether to run in template or model-direct-invocation mode.
   */
  taskType: TaskType;
  /**
   * Additional metadata for the task. For template invocation this should contain `template_type`,
   * for model-direct invocation it should contain `model_category` (and optionally `model`).
   */
  metadata?: JsonObject;
  // Common props
  demoType?: DemoType;
  demoInterval?: number;
  containerHeight?: string;
  // Initial request data to pre-fill the form
  initialRequest?: JsonObject;
  className?: string;
  maxFormWidth?: string;
  displayMode?: "page" | "section";
  // Fixed model mode
  fixedModel?: string; // Fixed model code for single model invocation
  hideModelSelector?: boolean; // Whether to hide the model selector
  // Form scrolling control
  disableFormScroll?: boolean; // Whether to disable form scrolling in page mode
}

export interface TemplateInvocationParams {
  task_type: TaskType.Template;
  is_public?: boolean;
  request: JsonObject;
  metadata: {
    template_type: TemplateType;
  } & JsonObject;
}

export interface ModelInvocationParams {
  task_type: TaskType.ModelDirectInvocation;
  is_public?: boolean;
  request: JsonObject;
  metadata: {
    model_category: ModelCategory;
    model?: string;
  } & JsonObject;
}
