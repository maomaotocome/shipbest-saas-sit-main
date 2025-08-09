import { SubTask } from "@/db/generated/prisma";
import { ModelCategory, TaskType, TemplateType } from "@/lib/constants";
import { JsonObject } from "@/types/json";
import { TaskListItem } from "@/types/tasks";
import { AudioGridItem } from "./widgets/Audios";
import { ImageGridItem } from "./widgets/Images";
import { VideoGridItem } from "./widgets/Videos";

interface MediaGridItemProps {
  task: TaskListItem;
  subTask: SubTask;
  subRequest: Record<string, unknown>;
  mediaUrl: string;
  fileName: string;
  originalObjectId?: string;
  compressedObjectId?: string;
  sourceUrl?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  onClick: () => void;
  onRecreate?: (e: React.MouseEvent) => void;
  showRecreate?: boolean;
  originalImageObjectId?: string;
  compressedImageObjectId?: string;
  imageUrl?: string;
}

type MediaGridItemComponent = React.ComponentType<MediaGridItemProps>;

export const getTaskMediaGridItem = (taskType: TaskType, metadata: JsonObject): MediaGridItemComponent | null => {
  switch (taskType) {
    case TaskType.ModelDirectInvocation: {
      const modelCategory = metadata.model_category as string;

      // determine return image or video component based on model category
      if (
        modelCategory === ModelCategory.TextToImage ||
        modelCategory === ModelCategory.ImageToImage
      ) {
        return ImageGridItem;
      } else if (
        modelCategory === ModelCategory.TextToVideo ||
        modelCategory === ModelCategory.ImageToVideo
      ) {
        return VideoGridItem;
      } else if (modelCategory === ModelCategory.TextToMusic) {
        return AudioGridItem;
      }

      // default return image component
      return ImageGridItem;
    }

    case TaskType.Template: {
      const templateType = metadata.template_type as string;

      // determine return image or video component based on template type
      if (templateType === TemplateType.StylizedAnimeImage) {
        return ImageGridItem;
      }

      // default return image component
      return ImageGridItem;
    }

    default:
      return null;
  }
};
