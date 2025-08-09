"use client";

import Image from "next/image";
import { FC, useCallback, useRef, useState } from "react";

interface ImageComparatorProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  onImageLoad?: (imageUrl: string) => void;
}

const ImageComparator: FC<ImageComparatorProps> = ({
                                                     beforeImage,
                                                     afterImage,
                                                     beforeLabel = "Before",
                                                     afterLabel = "After",
                                                     className,
                                                     onImageLoad,
                                                   }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const touchStartX = useRef<number>(0);

  const updateSliderPosition = useCallback((x: number) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const percentage = (x / containerRect.width) * 100;
    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  }, []);

  const handleSliderMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        updateSliderPosition(e.clientX - (containerRef.current?.getBoundingClientRect().left || 0));
      });
    },
    [updateSliderPosition]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      updateSliderPosition(e.clientX - (containerRef.current?.getBoundingClientRect().left || 0));

      const handleMouseMove = (e: MouseEvent) => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          updateSliderPosition(
            e.clientX - (containerRef.current?.getBoundingClientRect().left || 0)
          );
        });
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [updateSliderPosition]
  );

  const handleMouseLeave = useCallback(() => {
    setSliderPosition(50);
  }, []);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!containerRef.current) return;

      const touchX = e.touches[0].clientX;
      const containerRect = containerRef.current.getBoundingClientRect();
      const relativeX = touchX - containerRect.left;
      updateSliderPosition(relativeX);
    },
    [updateSliderPosition]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartX.current = 0;
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative ${className} overflow-hidden select-none`}
      onMouseMove={handleSliderMove}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* After Image - Fixed size */}
      <div className="relative h-full min-h-[300px] w-full">
        <Image 
          src={afterImage} 
          alt="After" 
          fill 
          className="object-cover" 
          priority 
          unoptimized 
          onLoad={() => onImageLoad?.(afterImage)}
        />
      </div>

      {/* Before Image - Only shows based on slider position */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          width: "100%",
          height: "100%",
        }}
      >
        <Image 
          src={beforeImage} 
          alt="Before" 
          fill 
          className="object-cover" 
          priority 
          unoptimized 
          onLoad={() => onImageLoad?.(beforeImage)}
        />
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 rounded bg-black/50 px-3 py-1 text-sm text-white">
        {beforeLabel}
      </div>
      <div className="absolute right-4 bottom-4 rounded bg-black/50 px-3 py-1 text-sm text-white">
        {afterLabel}
      </div>

      {/* Slider */}
      <div
        className="bg-background absolute top-0 bottom-0 w-1 cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white">
          <div className="h-4 w-1 bg-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default ImageComparator;
