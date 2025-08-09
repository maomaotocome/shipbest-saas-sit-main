import Pricing from "@/components/common/pricing";
import { SectionBackground } from "@/components/common/section-background";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

export default async function PricingSection({
  headingLevel = 2,
  className,
}: {
  headingLevel?: 1 | 2;
  className?: string;
}) {
  const t = await getTranslations("pricing");

  return (
    <section className={cn("relative py-24", className)}>
      <SectionBackground />
      <div className="container mx-auto overflow-visible px-4 py-12 backdrop-blur-sm">
        {headingLevel === 1 ? (
          <h1 className="text-primary mb-8 text-center text-4xl font-bold">{t("sectionTitle")}</h1>
        ) : (
          <h2 className="text-primary mb-8 text-center text-3xl font-bold">{t("sectionTitle")}</h2>
        )}
        <p className="text-foreground/80 mb-12 text-center">{t("sectionDescription")}</p>
        <div className="space-y-8">
          <Pricing />
        </div>
      </div>
    </section>
  );
}
