"use client";

import { useEffect, useRef, useState } from "react";

const VideoBackground = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videos = [
    "https://i.dreamega.io/1.webm",
    "https://i.dreamega.io/2.webm",
    "https://i.dreamega.io/3.webm",
    "https://i.dreamega.io/4.webm",
    "https://i.dreamega.io/5.webm",
    "https://i.dreamega.io/6.webm",
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
        setIsTransitioning(false);
      }, 1000); // 1 second black screen transition
    };

    video.addEventListener("ended", handleVideoEnd);
    return () => video.removeEventListener("ended", handleVideoEnd);
  }, [currentVideoIndex, videos.length]);

  return (
    <div className="absolute inset-0 h-full w-full">
      <div
        className={`absolute inset-0 h-full w-full bg-white transition-opacity duration-1000 dark:bg-black ${
          isTransitioning ? "opacity-100" : "opacity-0"
        }`}
      />
      <video
        ref={videoRef}
        src={videos[currentVideoIndex]}
        className="h-full w-full object-cover"
        autoPlay
        muted
        playsInline
      />
      <div className="absolute inset-0 h-full w-full bg-white/90 dark:bg-black/90" />
    </div>
  );
};

export default VideoBackground;
