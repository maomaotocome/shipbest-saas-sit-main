"use client";

import { SectionBackground } from "@/components/common/section-background";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
interface UsageStep {
  image?: string;
  title: string;
  description: string;
}

interface UsageProps {
  title: string;
  description: string;
  steps: UsageStep[];
}

// Default step design component with a more visually appealing design
const DefaultStepDesign: React.FC<{ stepNumber: number }> = ({ stepNumber }) => {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[hsl(var(--step-design-bg-from))] to-[hsl(var(--step-design-bg-to))] p-8">
      {/* Large "STEP" text in background */}
      <span className="absolute -top-10 -left-4 text-[5rem] font-black tracking-tighter text-[hsl(var(--step-design-text-label))] opacity-10 select-none md:-top-30 md:-left-12 md:text-[20rem]">
        step
      </span>

      {/* Step number */}
      <span className="absolute -right-4 -bottom-12 text-[8rem] font-bold text-[hsl(var(--step-design-text-number))] select-none md:-right-12 md:-bottom-48 md:text-[30rem]">
        {stepNumber}
      </span>
    </div>
  );
};

// Extract step item component separately to reduce redraws
const StepItem: React.FC<{
  step: UsageStep;
  index: number;
  isActive: boolean;
  showDescription: boolean;
  isLastStep: boolean;
  onClick: (index: number) => void;
}> = React.memo(({ step, index, isActive, showDescription, isLastStep, onClick }) => {
  return (
    <div
      className={`relative pl-6 transition-all duration-300 md:pl-8 ${
        isActive ? "" : "opacity-60"
      } rounded-sm hover:opacity-90 focus-visible:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--step-design-text-label))]`}
      onClick={() => onClick(index)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick(index);
          e.preventDefault();
        }
      }}
      aria-label={`Go to step ${index + 1}: ${step.title}`}
      aria-current={isActive ? "step" : undefined}
      style={{ cursor: "pointer" }}
    >
      {/* Timeline dot and line */}
      <div className="absolute top-2 left-0">
        {/* Dot */}
        <div
          className={`h-[7px] w-[7px] rounded-full transition-all duration-300 md:h-[9px] md:w-[9px] ${
            isActive
              ? "scale-125 bg-[hsl(var(--step-design-text-label))]"
              : "bg-[hsl(var(--step-design-text-label-inactive))]"
          }`}
        />
      </div>

      {/* Line segment (not shown for last item) */}
      {!isLastStep && (
        <div
          className="absolute top-[13px] left-[3px] w-[1px] bg-[hsl(var(--step-design-text-label-inactive))] md:top-[15px] md:left-[4px]"
          style={{
            height: "calc(100% - 6px)",
          }}
        />
      )}

      {/* Step content */}
      <div className="pb-6 md:pb-8">
        <h3
          className={`mb-1 text-base font-medium transition-colors duration-200 md:mb-2 md:text-lg ${
            isActive
              ? "text-[hsl(var(--step-design-text-label))]"
              : "text-[hsl(var(--step-design-text-label-inactive))]"
          }`}
        >
          {step.title}
        </h3>

        {/* Description - only show for current step */}
        <div className="h-4">
          <AnimatePresence>
            {isActive && showDescription && (
              <motion.p
                className="text-xs text-[hsl(var(--step-design-text-label))] md:text-sm"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{
                  willChange: "transform, opacity",
                  transform: "translateZ(0)",
                }}
              >
                {step.description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});

StepItem.displayName = "StepItem";

const UsageClient: React.FC<UsageProps> = ({ title, description, steps }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showDescription, setShowDescription] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);

  // Image preload logic - use useMemo to avoid recalculation
  const nextStepIndex = useMemo(
    () => (currentStep + 1) % steps.length,
    [currentStep, steps.length]
  );

  // Determine if image should be loaded
  const shouldLoadImage = useCallback(
    (index: number) => {
      return index === currentStep || index === nextStepIndex;
    },
    [currentStep, nextStepIndex]
  );

  // Use useCallback to reduce function rebuilds
  const handleStepClick = useCallback(
    (index: number) => {
      if (index === currentStep) return;

      setCurrentStep(index);
      setShowDescription(false);
      setAutoPlayEnabled(false);

      // Re-enable auto-play (optional)
      const timer = setTimeout(() => {
        setAutoPlayEnabled(true);
      }, 5000);

      return () => clearTimeout(timer);
    },
    [currentStep]
  );

  useEffect(() => {
    if (!autoPlayEnabled) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
      setShowDescription(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [steps.length, autoPlayEnabled]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDescription(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <section className="usage-section relative overflow-hidden py-8 backdrop-blur-sm md:py-17.5 lg:py-22.5 xl:py-27.5">
      <SectionBackground />
      <div className="container mx-auto">
        <h2 className="text-primary mb-4 px-8 text-center text-2xl font-bold md:mb-8 md:text-3xl">
          {title}
        </h2>
        <p className="mb-6 px-8 text-center text-sm text-black/80 md:mb-12 md:text-base dark:text-white/80">
          {description}
        </p>

        <div className="flex flex-col items-start gap-4 space-y-4 md:gap-8 md:space-y-6 lg:flex-row lg:space-y-0">
          {/* Left side - Image */}
          <div className="w-full lg:w-1/2">
            <div className="h-60 w-full overflow-hidden rounded-lg bg-[hsl(var(--background))] transition-colors duration-300 md:h-80 lg:h-140">
              <AnimatePresence mode="wait">
                {steps[currentStep].image ? (
                  <motion.img
                    key={currentStep}
                    src={steps[currentStep].image}
                    alt={steps[currentStep].title}
                    className="h-full w-full object-cover"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    loading="eager"
                    style={{
                      willChange: "transform, opacity",
                      transform: "translateZ(0)",
                    }}
                  />
                ) : (
                  <motion.div
                    key={currentStep}
                    className="h-full w-full"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{
                      willChange: "transform, opacity",
                      transform: "translateZ(0)",
                    }}
                  >
                    <DefaultStepDesign stepNumber={currentStep + 1} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Preload next image */}
              {steps.map((step, index) => {
                if (shouldLoadImage(index) && step.image && index !== currentStep) {
                  return (
                    <div key={`preload-${index}`} style={{ display: "none" }}>
                      <Image
                        unoptimized
                        src={step.image}
                        alt=""
                        aria-hidden="true"
                        width={1}
                        height={1}
                      />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Right side - Steps with timeline */}
          <div className="mt-4 w-full md:mt-0 lg:w-1/2">
            <div className="relative flex min-h-[15rem] items-center justify-center px-8 md:min-h-[25rem] lg:min-h-[35rem]">
              {/* Steps */}
              <div className="w-full space-y-0 px-4 md:px-0">
                {steps.map((step, index) => (
                  <StepItem
                    key={index}
                    step={step}
                    index={index}
                    isActive={index === currentStep}
                    showDescription={showDescription}
                    isLastStep={index === steps.length - 1}
                    onClick={handleStepClick}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UsageClient;
