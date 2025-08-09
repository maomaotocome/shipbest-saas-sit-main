import { getObjectUrl } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { MediaItem } from "../../MediaPreviewDialog";

interface AudioThumbnailProps {
  item: MediaItem;
  isSelected: boolean;
  onClick: () => void;
}

export const AudioThumbnail: React.FC<AudioThumbnailProps> = ({ item, isSelected, onClick }) => {
  return (
    <div
      className={`pointer-events-auto h-14 w-14 cursor-pointer overflow-hidden rounded border-none outline-none focus-visible:ring-0 focus-visible:outline-none ${
        isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-black/60" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded">
        {(() => {
          const coverImageUrl =
            getObjectUrl(item.compressedImageObjectId || item.originalImageObjectId) ||
            item.imageUrl;
          return coverImageUrl ? (
            <div className="relative h-full w-full">
              <Image
                src={coverImageUrl}
                alt="Audio cover"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path
                    d="M9 9V15L15 12L9 9Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
          ) : (
            <Image
              src="/images/aigc/filetypes/audio.svg"
              alt="Audio file"
              width={24}
              height={24}
              className="text-white"
            />
          );
        })()}
      </div>
    </div>
  );
};
