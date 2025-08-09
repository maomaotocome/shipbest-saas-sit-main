import Image from "next/image";
import React from "react";
import { MediaItem } from "../../MediaPreviewDialog";

interface ImageThumbnailProps {
  item: MediaItem;
  isSelected: boolean;
  onClick: () => void;
}

export const ImageThumbnail: React.FC<ImageThumbnailProps> = ({
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
      <Image
        unoptimized
        src={item.url}
        alt="thumb"
        width={56}
        height={56}
        className="h-full w-full object-cover"
      />
    </div>
  );
};