import { Locale } from "@/i18n/locales";
import { TaskType, TemplateType } from "@/lib/constants";
import { JsonObject } from "@/types/json";
import { useLocale } from "next-intl";
import { useCallback } from "react";
import { getDefaultTemplateRequest, getTemplateForType } from "../utils/parameter-utils";
import { TemplateInvocationParams } from "./types";
import { useBaseInvocation } from "./useBaseInvocation";

export const useTemplateInvocation = (templateType: TemplateType, initialRequest?: JsonObject, defaultIsPublic?: boolean) => {
  const locale = useLocale() as Locale;
  const template = getTemplateForType(templateType, locale);

  const {
    invocationData,
    invocationDataRef,
    handleRequestChange,
    handleMetadataChange,
    handlePrivacyChange,
    handleAllImagesUploaded,
    setDynamicParameterRendererRef,
    createValidateAndPrepareRequest,
  } = useBaseInvocation<TemplateInvocationParams>(
    () => ({
      task_type: TaskType.Template,
      is_public: defaultIsPublic ?? true,
      request: {
        ...getDefaultTemplateRequest(templateType, locale),
        ...(initialRequest ?? {}),
      },
      metadata: {
        template_type: templateType,
      },
    }),
    [templateType, locale, JSON.stringify(initialRequest), defaultIsPublic]
  );

  // Create validation and request preparation function, ensuring exceptions are thrown on errors
  const validateAndPrepareRequest = useCallback(
    async (t: (key: string, params?: Record<string, unknown>) => string) => {
      console.log("Starting template invocation processing, checking image upload status...");

      const validateFn = createValidateAndPrepareRequest(template.parameterConfig);
      const result = await validateFn(t);

      if (!result.isValid) {
        throw new Error("Validation failed");
      }

      return {
        taskType: result.taskType,
        request: result.request,
        metadata: result.metadata,
      };
    },
    [template.parameterConfig, createValidateAndPrepareRequest]
  );

  return {
    template,
    invocationData,
    invocationDataRef,
    handleRequestChange,
    handleMetadataChange,
    handleAllImagesUploaded,
    handlePrivacyChange,
    setDynamicParameterRendererRef,
    validateAndPrepareRequest,
  };
};
