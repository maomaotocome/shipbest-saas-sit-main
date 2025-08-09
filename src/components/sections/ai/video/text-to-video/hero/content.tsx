"use client";

import UnifiedInvoker from "@/components/toolpanel/UnifiedInvoker";
import { ModelCategory, TaskType } from "@/lib/constants";
import { useTranslations } from "next-intl";

export default function HeroContent() {
  const t = useTranslations("ai.video.text-to-video.hero");
  return (
    <div className="container flex flex-col gap-8">
      <div className="flex flex-col items-center pt-8 pb-8 text-center">
        <h1 className="max-w-4xl text-7xl font-bold text-black dark:text-white">{t("title")}</h1>
      </div>
      <div>
        <UnifiedInvoker
          taskType={TaskType.ModelDirectInvocation}
          metadata={{ model_category: ModelCategory.TextToVideo }}
          demoType="video"
          demoInterval={5000}
          containerHeight="h-180"
        />
      </div>
    </div>
  );
}
