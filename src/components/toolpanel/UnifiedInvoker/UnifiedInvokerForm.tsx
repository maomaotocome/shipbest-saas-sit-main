import { FileItemInfo } from "@/components/common/uploader";
import { SlideToDo, type SlideToDoRef } from "@/components/ui/swipe-to-do";
import { ModelParameterConfig } from "@/conifg/aigc/types";
import { TaskType } from "@/lib/constants";
import { JsonObject, JsonValue } from "@/types/json";
import { useTranslations } from "next-intl";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { CreditDisplay } from "../components/CreditDisplay";
import {
  DynamicParameterRenderer,
  DynamicParameterRendererRef,
} from "../components/DynamicParameterRenderer";
import { ModelsSelector } from "../components/from-fields/ModelSelector";
import { TaskPrivacySelector } from "../components/task-privacy-selector";
import { Model } from "./types";

interface UnifiedInvokerFormProps {
  taskType: TaskType;
  // Model mode props
  models?: Model[];

  parameterConfig: ModelParameterConfig;
  onRequestChange: (key: string, value: JsonValue) => void;
  onMetadataChange: (key: string, value: JsonValue) => void;
  onPrivacyChange: (isPublic: boolean) => void;
  onAllImagesUploaded?: (uploadedFiles: { [key: string]: FileItemInfo[] }) => void;
  onInvocation: () => void;
  // Display data
  currentData: {
    task_type: TaskType;
    request: JsonObject;
    metadata: JsonObject;
    is_public?: boolean;
  };
  // Fixed model mode
  hideModelSelector?: boolean;
}

export const UnifiedInvokerForm = forwardRef<
  {
    slideToDoRef: SlideToDoRef | null;
    dynamicParameterRendererRef: DynamicParameterRendererRef | null;
  },
  UnifiedInvokerFormProps
>(
  (
    {
      taskType,
      models,
      parameterConfig,
      onRequestChange,
      onMetadataChange,
      onPrivacyChange,
      onAllImagesUploaded,
      onInvocation,
      currentData = {
        task_type: taskType,
        request: {},
        metadata: {},
        is_public: true,
      },
      hideModelSelector = false,
    },
    ref
  ) => {
    const t = useTranslations("ai.common");
    const slideToDoRef = useRef<SlideToDoRef>(null);
    const dynamicParameterRendererRef = useRef<DynamicParameterRendererRef>(null);

    // Expose refs to parent component
    useImperativeHandle(
      ref,
      () => ({
        slideToDoRef: slideToDoRef.current,
        dynamicParameterRendererRef: dynamicParameterRendererRef.current,
      }),
      []
    );

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onInvocation();
        }}
        className="flex-1 space-y-4"
      >
        <div className="space-y-4">
          {/* Model Selector for model-direct-invocation */}
          {taskType === TaskType.ModelDirectInvocation && models && !hideModelSelector && (
            <ModelsSelector
              models={models}
              selectedModels={
                currentData.metadata.model
                  ? models.filter((m) => m.code === currentData.metadata.model)
                  : []
              }
              setSelectedModels={(selectedModels) => {
                const modelCode = selectedModels[0]?.code || null;
                onMetadataChange("model", modelCode);
              }}
            />
          )}

          {/* Dynamic Parameters */}
          {parameterConfig.parameters.length > 0 && (
            <DynamicParameterRenderer
              ref={(el) => {
                dynamicParameterRendererRef.current = el;
              }}
              parameterConfig={parameterConfig}
              values={currentData.request}
              onChange={onRequestChange}
              t={t}
              uploadMode="submit"
              onAllImagesUploaded={onAllImagesUploaded}
              isPublic={currentData.is_public ?? false}
            />
          )}

          <TaskPrivacySelector
            isPublic={currentData.is_public ?? true}
            onPrivacyChange={onPrivacyChange}
          />

          <CreditDisplay
            taskType={currentData.task_type}
            request={currentData.request}
            metadata={currentData.metadata}
            collapsible={true}
            defaultCollapsed={false}
          />
        </div>

        <SlideToDo
          ref={slideToDoRef}
          onCompleted={() => {
            onInvocation();
            // Reset after a short delay to allow the task submission to complete
            setTimeout(() => {
              slideToDoRef.current?.reset();
            }, 3000);
          }}
          readyText={t("slideToDo.readyText")}
          completedText={t("slideToDo.completedText")}
          slidingAtEndingText={t("slideToDo.slidingAtEndingText")}
        />
      </form>
    );
  }
);

UnifiedInvokerForm.displayName = "UnifiedInvokerForm";
