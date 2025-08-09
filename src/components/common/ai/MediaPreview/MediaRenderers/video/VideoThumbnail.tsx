import React from "react";
import { MediaItem } from "../../MediaPreviewDialog";

interface VideoThumbnailProps {
  item: MediaItem;
  isSelected: boolean;
  onClick: () => void;
}

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  item,
  isSelected,
  onClick,
}) => {
  return (
    <div
      className={`h-14 w-14 cursor-pointer overflow-hidden rounded border-none outline-none focus-visible:ring-0 focus-visible:outline-none pointer-events-auto ${
        isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-black/60" : ""
      }`}
      onClick={onClick}
    >
      <video
        src={item.url}
        className="h-full w-full object-cover"
        muted
        loop
        onMouseEnter={(e) => {
          const v = e.target as HTMLVideoElement;
          v.play().catch(() => {});
        }}
        onMouseLeave={(e) => {
          const v = e.target as HTMLVideoElement;
          v.pause();
          v.currentTime = 0;
        }}
      />
    </div>
  );
};