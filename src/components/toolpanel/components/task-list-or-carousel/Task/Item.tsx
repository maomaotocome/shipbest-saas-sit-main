import { Locale } from "@/i18n/locales";
import { ModelCategory, TaskType, TemplateType } from "@/lib/constants";
import { JsonObject, JsonValue } from "@/types/json";
import { TaskListItem, ImageSubTaskResponse, VideoSubTaskResponse, AudioSubTaskResponse } from "@/types/tasks";
import { useLocale } from "next-intl";
import { useTaskParameterConfig } from "../../../../common/ai/DynamicParameterDisplay";
import { TaskHeader } from "./components/TaskHeader";
import { MediaGrid } from "./components/MediaGrid";
import { useTaskRecall, useTaskType } from "./hooks";
import { useModelRecallable } from "./hooks/useModelRecallable";
import { useTaskRequest } from "./hooks/useTaskRequest";
import { useTaskTime } from "./hooks/useTaskTime";

interface TaskItemProps {
  task: TaskListItem;
}

export function TaskItem({ task }: TaskItemProps) {
  const { data: taskTypes } = useTaskType();
  const { recallTask, isRecalling, isEligibleForRecall } = useTaskRecall();
  const locale = useLocale() as Locale;
  const taskType = task.taskType as TaskType;
  const title = taskTypes?.[locale]?.title ?? "";
  const description = taskTypes?.[locale]?.description ?? "";
  const metadata = task.metadata as JsonObject;

  // Custom hooks for better organization
  const timeAgo = useTaskTime(task.createdAt, locale);
  const request = useTaskRequest(task.request as JsonValue);

  // Get task parameter configuration and model mapping table
  const { parameters, modelMap, config } = useTaskParameterConfig({
    taskType: task.taskType as TaskType,
    metadata: task.metadata as JsonObject,
    locale,
  });

  // Check if model is recallable
  const isModelRecallable = useModelRecallable(config, request);

  // Determine media type and response extractors based on task type and metadata
  const getMediaConfig = () => {
    switch (taskType) {
      case TaskType.ModelDirectInvocation: {
        const modelCategory = metadata.model_category as string;

        if (
          modelCategory === ModelCategory.TextToImage ||
          modelCategory === ModelCategory.ImageToImage
        ) {
          return {
            mediaType: "image" as const,
            getMediaFromResponse: (response: unknown) => 
              (response as unknown as ImageSubTaskResponse)?.images,
            getDefaultFileName: () => "image.png",
          };
        } else if (
          modelCategory === ModelCategory.TextToVideo ||
          modelCategory === ModelCategory.ImageToVideo
        ) {
          return {
            mediaType: "video" as const,
            getMediaFromResponse: (response: unknown) => 
              (response as unknown as VideoSubTaskResponse)?.videos,
            getDefaultFileName: () => "video.mp4",
          };
        } else if (modelCategory === ModelCategory.TextToMusic) {
          return {
            mediaType: "audio" as const,
            getMediaFromResponse: (response: unknown) => 
              (response as unknown as AudioSubTaskResponse)?.audios,
            getDefaultFileName: () => "audio.mp3",
          };
        }

        // default return image component
        return {
          mediaType: "image" as const,
          getMediaFromResponse: (response: unknown) => 
            (response as unknown as ImageSubTaskResponse)?.images,
          getDefaultFileName: () => "image.png",
        };
      }

      case TaskType.Template: {
        const templateType = metadata.template_type as string;

        if (templateType === TemplateType.StylizedAnimeImage) {
          return {
            mediaType: "image" as const,
            getMediaFromResponse: (response: unknown) => 
              (response as unknown as ImageSubTaskResponse)?.images,
            getDefaultFileName: () => "image.png",
          };
        }

        // default return image component
        return {
          mediaType: "image" as const,
          getMediaFromResponse: (response: unknown) => 
            (response as unknown as ImageSubTaskResponse)?.images,
          getDefaultFileName: () => "image.png",
        };
      }

      default:
        return null;
    }
  };

  const mediaConfig = getMediaConfig();

  return (
    <div className="group hover:bg-primary/10 dark:hover:bg-primary/10 relative flex max-h-[400px] flex-col items-start gap-1.5 overflow-hidden rounded-lg bg-white/40 p-2.5 transition-all duration-200 dark:bg-black/40">
      <TaskHeader
        task={task}
        title={title}
        timeAgo={timeAgo}
        parameters={parameters}
        request={request}
        modelMap={modelMap}
        isEligibleForRecall={isEligibleForRecall}
        isModelRecallable={isModelRecallable}
        recallTask={recallTask}
        isRecalling={isRecalling}
      />

      <p className="text-muted-foreground w-full text-left text-xs break-words break-all whitespace-normal">
        {description}
      </p>

      {mediaConfig && (
        <MediaGrid
          task={task}
          mediaType={mediaConfig.mediaType}
          getMediaFromResponse={mediaConfig.getMediaFromResponse}
          getDefaultFileName={mediaConfig.getDefaultFileName}
        />
      )}
    </div>
  );
}
