import React from "react";

interface VideoPlayerProps {
  src: string;
  mediaLoaded: boolean;
  onLoad: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  mediaLoaded,
  onLoad,
}) => {
  return (
    <video
      src={src}
      controls
      autoPlay
      loop
      className={`h-full w-full object-contain ${!mediaLoaded ? "invisible" : ""} rounded-tl-lg md:rounded-tr-none md:rounded-br-none md:rounded-bl-none rounded-tr-lg md:rounded-tl-lg focus-visible:ring-0 focus-visible:outline-none relative z-10`}
      onLoadedData={onLoad}
    />
  );
};