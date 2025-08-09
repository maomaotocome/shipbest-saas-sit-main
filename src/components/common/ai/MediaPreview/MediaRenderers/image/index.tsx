import React from "react";
import { MediaItem } from "../../MediaPreviewDialog";
import { ImageContainer } from "./ImageContainer";

interface ImageRendererProps {
  media: MediaItem;
  mediaLoaded: boolean;
  onLoad: () => void;
}

export const ImageRenderer: React.FC<ImageRendererProps> = ({ media, mediaLoaded, onLoad }) => {
  return (
    <ImageContainer
      src={media.url}
      alt={media.fileName ?? "image"}
      mediaLoaded={mediaLoaded}
      onLoad={onLoad}
    />
  );
};
