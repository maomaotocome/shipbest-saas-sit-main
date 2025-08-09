import ModelDetailPage from "@/components/pages/ai/models/shared/ModelDetailPage";
import { FluxDevModelCode } from "@/conifg/aigc/model-direct-invocation/text-to-image/models/flux-dev";
import { ModelCategory, TaskType } from "@/lib/constants";
import { getStaticData } from "@/staticData";
import { getLocale } from "next-intl/server";

export default async function FluxDevModelPage() {
  const locale = await getLocale();
  const modelData = await getStaticData({ locale, key: "models", type: "flux-dev" });

  return (
    <ModelDetailPage
      modelCode={FluxDevModelCode}
      modelName={modelData.title}
      modelDescription={modelData.description}
      modelCategory={ModelCategory.TextToImage}
      taskType={TaskType.ModelDirectInvocation}
      demoType="image"
      tryItOutTitle={modelData.tryItOutTitle}
      tryItOutDescription={modelData.tryItOutDescription}
      heroStrings={{
        tryNowButton: modelData.tryNowButton,
        viewDocumentationButton: modelData.viewDocumentationButton,
      }}
    />
  );
}
