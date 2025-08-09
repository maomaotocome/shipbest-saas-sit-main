"use client";
import StudioPageLayout from "@/components/common/studio/StudioPageLayout";
import UnifiedInvoker from "@/components/toolpanel/UnifiedInvoker";
import { ModelCategory, TaskType } from "@/lib/constants";
import { useTranslations } from "next-intl";

export default function ImageToVideoPage() {
  const t = useTranslations("ai.video.image-to-video.hero");

  return (
    <StudioPageLayout title={t("title")} description={t("description")}>
      <UnifiedInvoker
        taskType={TaskType.ModelDirectInvocation}
        metadata={{ model_category: ModelCategory.ImageToVideo }}
        demoType="video"
        displayMode="page"
        containerHeight="max-h-90vh"
        className="h-full"
      />
    </StudioPageLayout>
  );
}
