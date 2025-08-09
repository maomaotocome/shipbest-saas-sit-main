"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelHeroProps {
  modelName: string;
  modelDescription: string;
  modelCode: string;
  className?: string;
  heroStrings?: {
    tryNowButton: string;
    viewDocumentationButton: string;
  };
}

export function ModelHero({
  modelName,
  modelDescription,
  modelCode,
  className,
  heroStrings,
}: ModelHeroProps) {
  return (
    <section className={cn("relative min-h-[60vh] w-full overflow-hidden", className)}>
      {/* Hero Background - 与全站风格一致 */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_100%_50%_at_50%_0%,#000_30%,transparent_100%)]" />

        {/* Gradient Overlay */}
        <div className="via-background/30 to-background absolute inset-0 bg-gradient-to-b from-transparent" />

        {/* Animated Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-blob absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="animate-blob animation-delay-2000 absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl" />
          <div className="animate-blob animation-delay-4000 absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex min-h-[60vh] w-full items-center justify-center py-20">
        <div className="container mx-auto flex h-full flex-col items-center justify-center px-4 text-center">
          <div className="w-full max-w-4xl">
            {/* Model Badge */}
            <Badge 
              variant="secondary" 
              className="mb-6 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
            >
              {modelCode}
            </Badge>

            {/* Model Name - 与全站风格一致的渐变标题 */}
            <h1 className="mb-6 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
              {modelName}
            </h1>

            {/* Model Description */}
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-600 dark:text-gray-300 sm:text-xl md:text-2xl leading-relaxed">
              {modelDescription}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                onClick={() => {
                  // Scroll to the tool section
                  const toolSection = document.querySelector('[data-model-tool-section]');
                  if (toolSection) {
                    toolSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                {heroStrings?.tryNowButton?.replace('{modelName}', modelName) || `Try ${modelName} Now`}
                <ChevronRightIcon className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                {heroStrings?.viewDocumentationButton || 'View Documentation'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}