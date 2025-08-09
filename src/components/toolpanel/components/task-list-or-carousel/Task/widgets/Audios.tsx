import { downloadMedia } from "@/components/common/ai/download";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SubTask } from "@/db/generated/prisma";
import { getObjectUrl } from "@/lib/utils";
import { TaskListItem } from "@/types/tasks";
import Image from "next/image";
import React from "react";
import { ItemActionButtons } from "../components/ItemActionButtons";
import { MediaFileInfoInline } from "../components/MediaFileInfo";
import { SubtaskTooltipContent } from "../components/SubtaskTooltipContent";
import { taskMediaItemClassName } from "../item-style.config";

interface AudioGridItemProps {
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

export function AudioGridItem({
  task,
  subTask,
  subRequest,
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
  originalImageObjectId,
  compressedImageObjectId,
  imageUrl,
}: AudioGridItemProps) {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadMedia({
      originalObjectId,
      compressedObjectId,
      sourceUrl,
      fileName,
    });
  };

  const RhythmSvg = () => {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
        <path
          d="M9 9V15L15 12L9 9Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="currentColor"
        />
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    );
  };

  const renderAudioVisual = () => {
    const coverImageUrl =
      getObjectUrl(compressedImageObjectId || originalImageObjectId) || imageUrl;

    return (
      <div className="relative h-full w-full">
        <Image
          src={coverImageUrl || "/images/aigc/filetypes/audio.svg"}
          alt=""
          fill
          className="rounded-lg object-cover"
          loading="lazy"
          unoptimized
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <RhythmSvg />
        </div>
      </div>
    );
  };

  return (
    <div className={taskMediaItemClassName}>
      <div className="h-full w-full" onClick={onClick}>
        <Tooltip>
          <TooltipTrigger asChild>{renderAudioVisual()}</TooltipTrigger>
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
