import React from "react";
import { MediaItem } from "../../MediaPreviewDialog";
import { VideoBackground } from "./VideoBackground";
import { VideoPlayer } from "./VideoPlayer";

interface VideoRendererProps {
  media: MediaItem;
  mediaLoaded: boolean;
  onLoad: () => void;
}

export const VideoRenderer: React.FC<VideoRendererProps> = ({ media, mediaLoaded, onLoad }) => {
  return (
    <VideoBackground>
      <VideoPlayer src={media.url} mediaLoaded={mediaLoaded} onLoad={onLoad} />
    </VideoBackground>
  );
};
