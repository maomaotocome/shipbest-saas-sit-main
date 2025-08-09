import FAQ from "@/components/sections/common/faq";
import Pricing from "@/components/sections/common/pricing";
import Testimonials from "@/components/sections/common/testimonial";
import Usage from "@/components/sections/common/usage";
import UnifiedInvoker from "@/components/toolpanel/UnifiedInvoker";
import { DemoType } from "@/components/toolpanel/UnifiedInvoker/types";
import { ModelCategory, TaskType } from "@/lib/constants";
import { ModelHero } from "./ModelHero";

interface ModelDetailPageProps {
  modelCode: string;
  modelName: string;
  modelDescription: string;
  modelCategory: ModelCategory;
  taskType: TaskType;
  demoType: DemoType;
  tryItOutTitle: string;
  tryItOutDescription: string;
  heroStrings?: {
    tryNowButton: string;
    viewDocumentationButton: string;
  };
}

export default function ModelDetailPage({
  modelCode,
  modelName,
  modelDescription,
  modelCategory,
  taskType,
  demoType,
  tryItOutTitle,
  tryItOutDescription,
  heroStrings,
}: ModelDetailPageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <ModelHero modelName={modelName} modelDescription={modelDescription} modelCode={modelCode} heroStrings={heroStrings} />

      {/* AI Tool Section */}
      <section className="container mx-auto mb-16 py-8 md:py-16" data-model-tool-section>
        <div className="mb-8">
          <h2 className="text-2xl font-bold">{tryItOutTitle}</h2>
          <p className="text-muted-foreground text-sm">{tryItOutDescription}</p>
        </div>
        <div className="h-[70vh] min-h-[600px]">
          <UnifiedInvoker
            taskType={taskType}
            metadata={{
              model_category: modelCategory,
              model: modelCode,
            }}
            demoType={demoType}
            displayMode="section"
            containerHeight="h-full"
            fixedModel={modelCode}
            hideModelSelector={true}
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-16">
        <FAQ type={modelCode} />
      </section>

      {/* Usage Section */}
      <section className="mb-16">
        <Usage type={modelCode} />
      </section>

      {/* Testimonials Section */}
      <section className="mb-16">
        <Testimonials type={modelCode} />
      </section>

      {/* Pricing Section */}
      <section className="mb-16">
        <Pricing className="bg-background" />
      </section>
    </div>
  );
}
