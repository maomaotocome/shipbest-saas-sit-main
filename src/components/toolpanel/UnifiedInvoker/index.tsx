"use client";

import { FileItemInfo } from "@/components/common/uploader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type SlideToDoRef } from "@/components/ui/swipe-to-do";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserSettings } from "@/hooks/use-user-settings";
import { ModelCategory, TaskType, TemplateType } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { JsonObject, JsonValue } from "@/types/json";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { DynamicParameterRendererRef } from "../components/DynamicParameterRenderer";
import { TaskListOrCarousel } from "../components/task-list-or-carousel";
import { useCreateTask } from "../components/task-list-or-carousel/Task/hooks";
import { useTaskValidation } from "../utils/use-task-validation-return";
import { UnifiedInvokerProps } from "./types";
import { UnifiedInvokerForm } from "./UnifiedInvokerForm";
import { useModelInvocation } from "./useModelInvocation";
import { useTemplateInvocation } from "./useTemplateInvocation";

export default function UnifiedInvoker({
  taskType,
  metadata,
  demoType,
  demoInterval = 5000,
  containerHeight = "h-180",
  initialRequest,
  className,
  maxFormWidth = "max-w-2xl",
  displayMode = "section",
  fixedModel,
  hideModelSelector = false,
  disableFormScroll = false,
}: UnifiedInvokerProps) {
  const t = useTranslations("ai.common");
  const { createTask } = useCreateTask();
  const { settings } = useUserSettings();
  const formRef = useRef<{
    slideToDoRef: SlideToDoRef | null;
    dynamicParameterRendererRef: DynamicParameterRendererRef | null;
  }>(null);

  const { validateAndExecute, AuthDialogComponent, PricingDialogComponent } = useTaskValidation();
  const isMobile = useIsMobile();
  // Derive specific type information from metadata
  const templateType = (metadata?.template_type as TemplateType) || TemplateType.StylizedAnimeImage;
  const modelCategory = metadata?.model_category as ModelCategory | undefined;
  
  // Create enhanced metadata for fixed model mode
  const enhancedMetadata = fixedModel 
    ? { ...metadata, model: fixedModel } 
    : metadata;

  // Template mode hooks (pass initialRequest to prefill)
  const templateHooks = useTemplateInvocation(
    templateType || TemplateType.StylizedAnimeImage,
    initialRequest,
    settings?.isPublicDefault
  );

  // Model mode hooks (pass initialRequest to prefill)
  const modelHooks = useModelInvocation({
    modelCategory,
    metadata: enhancedMetadata,
    initialRequest,
    defaultIsPublic: settings?.isPublicDefault,
  });

  // Set DynamicParameterRendererRef
  useEffect(() => {
    if (formRef.current?.dynamicParameterRendererRef) {
      if (taskType === TaskType.Template) {
        templateHooks.setDynamicParameterRendererRef(formRef.current.dynamicParameterRendererRef);
      } else if (taskType === TaskType.ModelDirectInvocation) {
        modelHooks.setDynamicParameterRendererRef(formRef.current.dynamicParameterRendererRef);
      }
    } else {
      console.warn("dynamicParameterRendererRef is not available yet");
    }
  }, [taskType, templateHooks, modelHooks]);

  // Update refs when formRef changes
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (formRef.current?.dynamicParameterRendererRef) {
        if (taskType === TaskType.Template) {
          templateHooks.setDynamicParameterRendererRef(formRef.current.dynamicParameterRendererRef);
        } else if (taskType === TaskType.ModelDirectInvocation) {
          modelHooks.setDynamicParameterRendererRef(formRef.current.dynamicParameterRendererRef);
        }
        clearInterval(intervalId);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [taskType, templateHooks, modelHooks]);

  const executeTask = async () => {
    try {
      const finalTaskType =
        taskType === TaskType.Template
          ? templateHooks.invocationDataRef.current.task_type
          : modelHooks.modelInvocationDataRef.current.task_type;
      const request =
        taskType === TaskType.Template
          ? templateHooks.invocationDataRef.current.request
          : modelHooks.modelInvocationDataRef.current.request;
      const isPublic =
        taskType === TaskType.Template
          ? (templateHooks.invocationDataRef.current.is_public ?? (settings?.isPublicDefault ?? true))
          : (modelHooks.modelInvocationDataRef.current.is_public ?? (settings?.isPublicDefault ?? true));
      const metadata =
        taskType === TaskType.Template
          ? templateHooks.invocationDataRef.current.metadata
          : modelHooks.modelInvocationDataRef.current.metadata;
      await createTask({
        taskType: finalTaskType,
        request,
        isPublic,
        metadata,
      });

      toast.success(t("taskSubmittedSuccessfully"));
    } catch (error) {
      console.error("Failed to invoke:", error);
    }
  };

  const handleInvocation = async () => {
    try {
      const simpleT = (key: string, params?: Record<string, unknown>) => {
        // @ts-expect-error - ignore type error
        return t(key, params);
      };

      if (taskType === TaskType.Template && templateHooks) {
        const preparedRequest = await templateHooks.validateAndPrepareRequest(simpleT);

        // Template validation failure will throw an exception, pass the result directly here
        await validateAndExecute({
          ...preparedRequest,
          onSuccess: executeTask,
        });
      } else if (taskType === TaskType.ModelDirectInvocation) {
        const preparedRequest = await modelHooks.validateAndPrepareRequest(simpleT);

        if (!preparedRequest.isValid) {
          return;
        }

        // Use type assertion since we've already checked isValid
        await validateAndExecute({
          taskType: (preparedRequest as { taskType: TaskType }).taskType,
          request: (preparedRequest as { request: JsonObject }).request,
          metadata: (preparedRequest as { metadata: JsonObject }).metadata,
          onSuccess: executeTask,
        });
      }
    } catch (error) {
      console.error("Invocation failed:", error);
    }
  };

  const handleRequestChange = useCallback(
    (key: string, value: JsonValue) => {
      if (taskType === TaskType.Template && templateHooks) {
        templateHooks.handleRequestChange(key, value);
      } else if (taskType === TaskType.ModelDirectInvocation) {
        modelHooks.handleRequestChange(key, value);
      }
    },
    [taskType, templateHooks, modelHooks]
  );

  const handleMetadataChange = useCallback(
    (key: string, value: JsonValue) => {
      if (taskType === TaskType.Template && templateHooks) {
        templateHooks.handleMetadataChange(key, value);
      } else if (taskType === TaskType.ModelDirectInvocation) {
        modelHooks.handleMetadataChange(key, value);
      }
    },
    [taskType, templateHooks, modelHooks]
  );

  const handlePrivacyChange = (isPublic: boolean) => {
    if (taskType === TaskType.Template && templateHooks) {
      templateHooks.handlePrivacyChange(isPublic);
    } else if (taskType === TaskType.ModelDirectInvocation) {
      modelHooks.handlePrivacyChange(isPublic);
    }
  };

  const handleAllImagesUploaded = (uploadedFiles: { [key: string]: FileItemInfo[] }) => {
    if (taskType === TaskType.Template && templateHooks) {
      templateHooks.handleAllImagesUploaded(uploadedFiles);
    } else if (taskType === TaskType.ModelDirectInvocation) {
      modelHooks.handleAllImagesUploaded(uploadedFiles);
    }
  };

  // Get current data based on taskType
  const currentData =
    taskType === TaskType.Template && templateHooks
      ? templateHooks.invocationData
      : modelHooks.modelInvocationData;

  const currentParameterConfig =
    taskType === TaskType.Template && templateHooks
      ? templateHooks.template.parameterConfig
      : modelHooks.selectedModel?.parameterConfig || { parameters: [] };

  const containerClasses = cn(
    "flex w-full select-none gap-8",
    {
      "h-full flex-col md:flex-row": displayMode === "section",
      "h-full min-h-0 flex-col md:flex-row": displayMode === "page", // Use min-h-0 to fix flexbox height issue in Firefox
    },
    className
  );

  const formContainerClasses = cn(isMobile ? "" : "flex-1", maxFormWidth);

  const demoContainerClasses = cn("flex flex-2 flex-col gap-4", {
    [containerHeight]: displayMode === "section",
    "h-full min-h-0": displayMode === "page", // Use min-h-0 to fix flexbox height issue in Firefox
  });

  return (
    <div className={containerClasses}>
      {/* Form Section */}
      {displayMode === "page" ? (
        disableFormScroll ? (
          <div className={cn(formContainerClasses, "h-full overflow-hidden")}>
            <div className="pr-4 pl-2 pt-4">
              <UnifiedInvokerForm
                ref={formRef}
                taskType={taskType}
                models={modelHooks.availableModels}
                parameterConfig={currentParameterConfig}
                onRequestChange={handleRequestChange}
                onMetadataChange={handleMetadataChange}
                onPrivacyChange={handlePrivacyChange}
                onAllImagesUploaded={handleAllImagesUploaded}
                onInvocation={handleInvocation}
                currentData={currentData}
                hideModelSelector={hideModelSelector}
              />
            </div>
          </div>
        ) : (
          <div className={cn(formContainerClasses, "h-full overflow-hidden")}>
            <ScrollArea className="h-full">
              <div className="pr-4 pl-2 pt-4">
                <UnifiedInvokerForm
                  ref={formRef}
                  taskType={taskType}
                  models={modelHooks.availableModels}
                  parameterConfig={currentParameterConfig}
                  onRequestChange={handleRequestChange}
                  onMetadataChange={handleMetadataChange}
                  onPrivacyChange={handlePrivacyChange}
                  onAllImagesUploaded={handleAllImagesUploaded}
                  onInvocation={handleInvocation}
                  currentData={currentData}
                  hideModelSelector={hideModelSelector}
                />
              </div>
            </ScrollArea>
          </div>
        )
      ) : (
        <div className={formContainerClasses}>
          <UnifiedInvokerForm
            ref={formRef}
            taskType={taskType}
            models={modelHooks.availableModels}
            parameterConfig={currentParameterConfig}
            onRequestChange={handleRequestChange}
            onMetadataChange={handleMetadataChange}
            onPrivacyChange={handlePrivacyChange}
            onAllImagesUploaded={handleAllImagesUploaded}
            onInvocation={handleInvocation}
            currentData={currentData}
            hideModelSelector={hideModelSelector}
          />
        </div>
      )}

      {/* Demo Section */}
      {demoType && (
        <div className={demoContainerClasses}>
          <div className="min-h-0 flex-1">
            <TaskListOrCarousel
              className={cn("h-full", displayMode === "page" ? "pt-4" : "")}
              demoType={demoType}
              demoInterval={demoInterval}
            />
          </div>
        </div>
      )}

      {/* Render validation dialogs */}
      {AuthDialogComponent}
      {PricingDialogComponent}
    </div>
  );
}
