import { getTemplateForType } from "@/components/toolpanel/utils/parameter-utils";
import { getImageToImageModels } from "@/conifg/aigc/model-direct-invocation/image-to-image";
import { getImageToVideoModels } from "@/conifg/aigc/model-direct-invocation/image-to-video";
import { getTextToImageModels } from "@/conifg/aigc/model-direct-invocation/text-to-image";
import { getTextToMusicModels } from "@/conifg/aigc/model-direct-invocation/text-to-music";
import { getTextToVideoModels } from "@/conifg/aigc/model-direct-invocation/text-to-video";
import { BaseModel, ParameterConfig, ParameterType } from "@/conifg/aigc/types";
import { Locale } from "@/i18n/locales";
import { ModelCategory, TaskType, TemplateType } from "@/lib/constants";
import { JsonObject } from "@/types/json";
import { TaskListItem } from "@/types/tasks";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  compactContainerRenderer,
  ContainerRenderer,
  defaultParameterRenderer,
  ParameterRenderer,
} from "./ParameterRenderers";

interface ParameterRendererData {
  key: string;
  label: string;
  value: React.ReactNode;
}

interface DynamicParameterDisplayProps {
  parameters: ParameterConfig[];
  request: Record<string, unknown>;
  modelMap: Record<string, string>;
  customRenderer?: ParameterRenderer;
  containerRenderer?: ContainerRenderer;
  showEmptyValues?: boolean;
  taskMedia?: Array<{ url: string; name: string }>;
}

export function DynamicParameterDisplay({
  parameters,
  request,
  modelMap,
  customRenderer = defaultParameterRenderer,
  containerRenderer = compactContainerRenderer,
  showEmptyValues = false,
  taskMedia,
}: DynamicParameterDisplayProps) {
  const t = useTranslations("ai.common");
  const renderers: ParameterRendererData[] = [];

  parameters.forEach((param) => {
    const value = request[param.key];

    const isEmpty =
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    if (isEmpty && !showEmptyValues) {
      return;
    }

    const renderedValue = customRenderer({ param, value, modelMap, taskMedia, t });

    renderers.push({
      key: param.key,
      label: param.label,
      value: renderedValue,
    });
  });

  return <>{containerRenderer(renderers)}</>;
}

export function useTaskParameterConfig({
  taskType,
  metadata,
  locale,
}: {
  taskType: TaskType;
  metadata: JsonObject;
  locale: Locale;
}) {
  return useMemo(() => {
    let config: BaseModel | null = null;
    const modelMap: Record<string, string> = {};

    if (taskType === TaskType.Template) {
      const templateType = metadata?.template_type as TemplateType;
      if (templateType) {
        try {
          config = getTemplateForType(templateType, locale);
        } catch {
          console.warn(`Unknown template type: ${templateType}`);
        }
      }
    } else if (taskType === TaskType.ModelDirectInvocation) {
      const modelCategory = metadata?.model_category as ModelCategory;
      if (modelCategory === ModelCategory.TextToImage) {
        getTextToImageModels(locale).forEach((m) => {
          modelMap[m.code] = m.name;
        });
        const models = getTextToImageModels(locale);
        config = models.find((m) => m.code === metadata.model) || models[0];
      } else if (modelCategory === ModelCategory.ImageToImage) {
        getImageToImageModels(locale).forEach((m) => {
          modelMap[m.code] = m.name;
        });
        const models = getImageToImageModels(locale);
        config = models.find((m) => m.code === metadata.model) || models[0];
      } else if (modelCategory === ModelCategory.TextToVideo) {
        getTextToVideoModels(locale).forEach((m) => {
          modelMap[m.code] = m.name;
        });
        const models = getTextToVideoModels(locale);
        config = models.find((m) => m.code === metadata.model) || models[0];
      } else if (modelCategory === ModelCategory.ImageToVideo) {
        getImageToVideoModels(locale).forEach((m) => {
          modelMap[m.code] = m.name;
        });
        const models = getImageToVideoModels(locale);
        config = models.find((m) => m.code === metadata.model) || models[0];
      } else if (modelCategory === ModelCategory.TextToMusic) {
        getTextToMusicModels(locale).forEach((m) => {
          modelMap[m.code] = m.name;
        });
        const models = getTextToMusicModels(locale);
        config = models.find((m) => m.code === metadata.model) || models[0];
      }
    }

    if (config?.parameterConfig?.parameters) {
      config.parameterConfig.parameters.forEach((param) => {
        if (param.type === ParameterType.MODEL && param.models) {
          param.models.forEach((model) => {
            modelMap[model.code] = model.name;
          });
        }
      });
    }

    return {
      parameters: config?.parameterConfig?.parameters || [],
      modelMap,
      config, // Export the full model configuration
    };
  }, [taskType, metadata, locale]);
}

export function useTaskInvokerConfig(task: TaskListItem) {
  return useMemo(() => {
    if (task.taskType === TaskType.Template) {
      const metadata = task.metadata as JsonObject;
      return {
        taskType: TaskType.Template as const,
        metadata,
      };
    } else if (task.taskType === TaskType.ModelDirectInvocation) {
      const metadata = task.metadata as JsonObject;
      return {
        taskType: TaskType.ModelDirectInvocation as const,
        metadata,
      };
    }
    return null;
  }, [task.taskType, task.metadata]);
}
