"use client";
import StudioPageLayout from "@/components/common/studio/StudioPageLayout";
import UnifiedInvoker from "@/components/toolpanel/UnifiedInvoker";
import { TaskType, TemplateType } from "@/lib/constants";
import { useTranslations } from "next-intl";

export default function StylizeAnimePage() {
  const t = useTranslations("ai.image.stylize-anime.hero");

  return (
    <StudioPageLayout title={t("title")} description={t("description")}>
      <UnifiedInvoker
        taskType={TaskType.Template}
        metadata={{ template_type: TemplateType.StylizedAnimeImage }}
        demoType="image"
        displayMode="page"
        containerHeight="max-h-90vh"
        className="h-full"
      />
    </StudioPageLayout>
  );
}
