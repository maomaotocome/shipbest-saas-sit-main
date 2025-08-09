import { downloadMedia } from "@/components/common/ai/download";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SubTask } from "@/db/generated/prisma";
import { TaskListItem } from "@/types/tasks";
import React from "react";
import { ItemActionButtons } from "../components/ItemActionButtons";
import { MediaFileInfoInline } from "../components/MediaFileInfo";
import { SubtaskTooltipContent } from "../components/SubtaskTooltipContent";
import { taskMediaItemClassName } from "../item-style.config";

interface VideoGridItemProps {
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
}

export function VideoGridItem({
  task,
  subTask,
  subRequest,
  mediaUrl,
  fileName,
  originalObjectId,
  compressedObjectId,
  sourceUrl,
  width,
  height,
  fileSize,
  onClick,
  onRecreate,
  showRecreate = false,
}: VideoGridItemProps) {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadMedia({
      originalObjectId,
      compressedObjectId,
      sourceUrl,
      fileName,
    });
  };

  return (
    <div className={taskMediaItemClassName}>
      <div className="h-full w-full" onClick={onClick}>
        <Tooltip>
          <TooltipTrigger asChild>
            <video
              src={mediaUrl}
              className="h-full w-full object-cover"
              muted
              loop
              onMouseEnter={(e) => {
                const video = e.target as HTMLVideoElement;
                video.play().catch(() => {});
              }}
              onMouseLeave={(e) => {
                const video = e.target as HTMLVideoElement;
                video.pause();
                video.currentTime = 0;
              }}
            />
          </TooltipTrigger>
          <TooltipContent>
            <SubtaskTooltipContent task={task} subTask={subTask} request={subRequest}>
              <MediaFileInfoInline width={width} height={height} fileSize={fileSize} />
            </SubtaskTooltipContent>
          </TooltipContent>
        </Tooltip>
      </div>

      <ItemActionButtons
        showRecreate={showRecreate}
        onDownload={handleDownload}
        onRecreate={onRecreate || (() => {})}
      />
    </div>
  );
}
