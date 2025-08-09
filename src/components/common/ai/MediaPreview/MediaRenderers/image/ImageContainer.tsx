import Image from "next/image";
import React from "react";

interface ImageContainerProps {
  src: string;
  alt: string;
  mediaLoaded: boolean;
  onLoad: () => void;
}

export const ImageContainer: React.FC<ImageContainerProps> = ({
  src,
  alt,
  mediaLoaded,
  onLoad,
}) => {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 opacity-50 rounded-tl-lg md:rounded-tr-none md:rounded-br-none md:rounded-bl-none rounded-tr-lg md:rounded-tl-lg" />
      <Image
        unoptimized
        src={src}
        alt={alt}
        fill
        className={`object-contain ${!mediaLoaded ? "invisible" : ""} rounded-tl-lg md:rounded-tr-none md:rounded-br-none md:rounded-bl-none rounded-tr-lg md:rounded-tl-lg relative z-10`}
        onLoad={onLoad}
        sizes="(max-width: 768px) 100vw, 65vw"
      />
    </div>
  );
};