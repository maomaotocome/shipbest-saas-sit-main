"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface SectionBackgroundProps {
  className?: string;
  count?: number;
  minSize?: number;
  maxSize?: number;
  opacity?: number;
  blur?: number;
}

export const GradientBlobs = ({
  className,
  count = 5,
  minSize = 300,
  maxSize = 500,
  opacity = 0.1,
  blur = 80,
}: SectionBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Array<{ x: number; y: number; size: number }>>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const newPositions = Array.from({ length: count }, () => {
      const size = Math.floor(Math.random() * (maxSize - minSize) + minSize);
      const x = Math.random() * (container.clientWidth - size);
      const y = Math.random() * (container.clientHeight - size);
      return { x, y, size };
    });

    setPositions(newPositions);
  }, [count, minSize, maxSize]);

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {positions.map((pos, index) => {
        const gradientIndex = (index % 5) + 1;
        return (
          <div
            key={index}
            className="absolute rounded-full"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              width: `${pos.size}px`,
              height: `${pos.size}px`,
              background: `radial-gradient(circle at center, hsl(var(--decoration-gradient-${gradientIndex}) / ${opacity}), transparent)`,
              filter: `blur(${blur}px)`,
            }}
          />
        );
      })}
    </div>
  );
};
