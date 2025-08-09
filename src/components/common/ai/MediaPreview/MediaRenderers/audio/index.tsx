import React from "react";
import { MediaItem } from "../../MediaPreviewDialog";
import { AudioControls } from "./AudioControls";
import { AudioCover } from "./AudioCover";
import { AudioMetadata } from "./AudioMetadata";

interface AudioRendererProps {
  media: MediaItem;
  mediaLoaded: boolean;
  onLoad: () => void;
}

export const AudioRenderer: React.FC<AudioRendererProps> = ({ media, mediaLoaded, onLoad }) => {
  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center">
      <AudioCover
        imageUrl={media.imageUrl}
        compressedImageObjectId={media.compressedImageObjectId}
        originalImageObjectId={media.originalImageObjectId}
        fileName={media.fileName}
      />
      <AudioControls audioUrl={media.url} mediaLoaded={mediaLoaded} onLoad={onLoad} />
      <AudioMetadata fileName={media.fileName} />
    </div>
  );
};
