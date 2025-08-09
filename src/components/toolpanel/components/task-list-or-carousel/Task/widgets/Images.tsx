import { downloadMedia } from "@/components/common/ai/download";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SubTask } from "@/db/generated/prisma";
import { TaskListItem } from "@/types/tasks";
import Image from "next/image";
import React from "react";
import { ItemActionButtons } from "../components/ItemActionButtons";
import { MediaFileInfoInline } from "../components/MediaFileInfo";
import { SubtaskTooltipContent } from "../components/SubtaskTooltipContent";
import { taskMediaItemClassName } from "../item-style.config";

interface ImageGridItemProps {
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

export function ImageGridItem({
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
}: ImageGridItemProps) {
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
      <div className="relative h-full w-full" onClick={onClick}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Image src={mediaUrl} alt="" fill className="object-cover" loading="lazy" unoptimized />
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
