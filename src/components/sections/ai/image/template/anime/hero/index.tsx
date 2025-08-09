"use client";
import UnifiedInvoker from "@/components/toolpanel/UnifiedInvoker";
import { TaskType, TemplateType } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface HeroProps {
  templateType: TemplateType;
  titleKey?: string;
  descriptionKey?: string;
  className?: string;
}

export default function Hero({
  templateType,
  titleKey = "title",
  descriptionKey = "description",
  className,
}: HeroProps) {
  const t = useTranslations(`ai.image.template.${templateType}.hero`);

  return (
    <section className={cn("relative flex min-h-screen w-full items-center justify-center py-20", className)}>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_100%_50%_at_50%_0%,#000_30%,transparent_100%)]" />

      {/* Gradient Overlay */}
      <div className="via-background/30 to-background absolute inset-0 bg-gradient-to-b from-transparent" />

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="animate-blob animation-delay-2000 absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="animate-blob animation-delay-4000 absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <div className="relative container mx-auto flex h-full flex-col items-center justify-center px-4 text-center">
        <div className="w-full max-w-3xl">
          <h1 className="mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
            {t(titleKey)}
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-300 sm:text-xl md:text-2xl">
            {t(descriptionKey)}
          </p>
        </div>
        <div className="w-full">
          <UnifiedInvoker
            taskType={TaskType.Template}
            metadata={{ template_type: templateType }}
            demoType="image"
            demoInterval={5000}
            containerHeight="h-180"
          />
        </div>
      </div>
    </section>
  );
}
