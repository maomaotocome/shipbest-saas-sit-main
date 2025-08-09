"use client";
import StudioPageLayout from "@/components/common/studio/StudioPageLayout";
import UnifiedInvoker from "@/components/toolpanel/UnifiedInvoker";
import { ModelCategory, TaskType } from "@/lib/constants";
import { useTranslations } from "next-intl";

export default function ImageToImagePage() {
  const t = useTranslations("ai.image.image-to-image.hero");

  return (
    <StudioPageLayout title={t("title")} description={t("description")}>
      <UnifiedInvoker
        taskType={TaskType.ModelDirectInvocation}
        metadata={{
          model_category: ModelCategory.ImageToImage,
        }}
        demoType="image"
        displayMode="page"
        containerHeight="max-h-90vh"
        className="h-full"
      />
    </StudioPageLayout>
  );
}
