"use client";

import { cn } from "@/lib/utils";
import HeroContent from "./content";
import VideoBackground from "./video-background";

interface HeroProps {
  className?: string;
}

export default function Hero({ className }: HeroProps) {
  return (
    <section className={cn("relative min-h-screen overflow-hidden", className)}>
      {/* Fixed Background with parallax effect */}
      <div
        className="fixed inset-0 -z-100 h-screen w-full overflow-hidden"
        style={{ clipPath: "inset(0 0 0 0)" }}
      >
        <VideoBackground />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex min-h-screen w-full justify-center pt-20">
        <HeroContent />
      </div>
    </section>
  );
}
