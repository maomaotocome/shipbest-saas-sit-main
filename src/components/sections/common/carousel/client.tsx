"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

interface SlideData {
  image: string;
  title: string;
  description: string;
}

interface CarouselClientProps {
  slides: SlideData[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

const CarouselClient: React.FC<CarouselClientProps> = ({
  slides = [],
  autoPlay = true,
  interval = 5000,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoPlay || !slides.length) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
    }
    if (isRightSwipe) {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
    }
  };

  // Safety check for empty slides
  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div
      ref={carouselRef}
      className={cn("relative h-[50vh] w-full overflow-hidden", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative h-full w-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute top-0 left-0 h-full w-full bg-cover bg-center bg-no-repeat transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}
      </div>

      {/* Slide Content */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="max-w-2xl rounded-md bg-black/50 p-6 text-center text-white select-none">
          <h2 className="mb-2 text-3xl font-bold">{slides[currentIndex].title}</h2>
          <p className="text-lg">{slides[currentIndex].description}</p>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`h-2.5 w-2.5 cursor-pointer rounded-full border-none p-0 transition-colors duration-300 ${
              index === currentIndex ? "bg-white" : "bg-white/50 hover:bg-white/80"
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CarouselClient;
