import { Locale } from "@/i18n/locales";
import { ModelCategory, TaskType } from "@/lib/constants";
import { JsonObject, JsonValue } from "@/types/json";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useMemo } from "react";
import { generateDefaultRequest } from "../utils/parameter-utils";
import { ModelInvocationParams } from "./types";
import { useBaseInvocation } from "./useBaseInvocation";
import { getModelsForTaskType } from "./utils";

interface UseModelInvocationParams {
  modelCategory?: ModelCategory;
  metadata?: JsonObject;
  initialRequest?: JsonObject;
  defaultIsPublic?: boolean;
}

export const useModelInvocation = ({
  modelCategory,
  metadata,
  initialRequest,
  defaultIsPublic,
}: UseModelInvocationParams) => {
  const locale = useLocale() as Locale;

  const {
    invocationData: modelInvocationData,
    invocationDataRef: modelInvocationDataRef,
    handleRequestChange,
    handleMetadataChange: baseHandleMetadataChange,
    handlePrivacyChange,
    handleAllImagesUploaded,
    setDynamicParameterRendererRef,
    createValidateAndPrepareRequest,
  } = useBaseInvocation<ModelInvocationParams>(() => {
    const { model: modelCode } = (metadata ?? {}) as JsonObject & {
      model?: string;
    };

    return {
      task_type: TaskType.ModelDirectInvocation,
      is_public: defaultIsPublic ?? true,
      request: initialRequest ?? {},
      metadata: {
        model_category:
          modelCategory || (metadata?.model_category as ModelCategory) || ModelCategory.Unknown,
        ...(modelCode ? { model: modelCode } : {}),
      } as { model_category: ModelCategory } & JsonObject,
    };
  }, [modelCategory, JSON.stringify(metadata), JSON.stringify(initialRequest), defaultIsPublic]);

  // Get available models for this category
  const availableModels = useMemo(() => {
    return modelCategory ? getModelsForTaskType(modelCategory, locale) : [];
  }, [modelCategory, locale]);

  // Get current selected model from metadata
  const selectedModel = useMemo(() => {
    const modelCode = modelInvocationData.metadata.model as string | undefined;
    if (!modelCode) return null;
    return availableModels.find((m) => m.code === modelCode) || null;
  }, [modelInvocationData.metadata.model, availableModels]);

  // Initialize default request if selectedModel is preset and request is empty
  useEffect(() => {
    if (selectedModel && Object.keys(modelInvocationData.request).length === 0) {
      const defaultRequest = generateDefaultRequest(selectedModel);
      Object.entries(defaultRequest).forEach(([key, value]) => {
        handleRequestChange(key, value as JsonValue);
      });
    }
  }, [selectedModel, handleRequestChange, modelInvocationData.request]);

  // Function to handle model selection
  const handleMetadataChange = useCallback(
    (key: string, value: JsonValue) => {
      baseHandleMetadataChange(key, value);
      if (key === "model") {
        const model = availableModels.find((m) => m.code === (value as string));
        if (model) {
          // Generate default request from model configuration
          const defaultRequest = generateDefaultRequest(model);
          // Clear existing request data first
          Object.keys(modelInvocationDataRef.current.request).forEach((key) => {
            handleRequestChange(key, null);
          });

          // Set new default values
          Object.entries(defaultRequest).forEach(([key, value]) => {
            handleRequestChange(key, value);
          });
        }
      }
    },
    [baseHandleMetadataChange, availableModels, handleRequestChange, modelInvocationDataRef]
  );

  const validateAndPrepareRequest = useCallback(
    async (t: (key: string, params?: Record<string, unknown>) => string) => {
      if (!selectedModel) {
        return { isValid: false, errors: ["No model selected"] };
      }

      // Use the common validation function
      const validateFn = createValidateAndPrepareRequest(selectedModel.parameterConfig);
      const result = await validateFn(t);

      // For model invocation, ensure consistent return format
      if (!result.isValid) {
        return result;
      }

      return {
        isValid: true,
        taskType: result.taskType,
        request: result.request,
        metadata: result.metadata,
      };
    },
    [selectedModel, createValidateAndPrepareRequest]
  );

  return {
    selectedModel,
    availableModels,
    modelInvocationData,
    modelInvocationDataRef,
    handleRequestChange,
    handleMetadataChange,
    handlePrivacyChange,
    handleAllImagesUploaded,
    setDynamicParameterRendererRef,
    validateAndPrepareRequest,
  };
};
