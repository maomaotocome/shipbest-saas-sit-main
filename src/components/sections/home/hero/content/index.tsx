import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { FC } from "react";

interface HeroContentProps {
  className?: string;
}

const HeroContent: FC<HeroContentProps> = ({ className }) => {
  const t = useTranslations("home.hero");

  return (
    <div className={cn("relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 pt-10 text-center sm:pt-12", className)}>
      <h1 className="text-primary text-5xl font-bold sm:text-6xl md:text-7xl">{t("title")}</h1>

      <p className="text-muted-foreground mt-6 text-2xl sm:text-3xl md:text-5xl">
        {t("description")}
      </p>

      <div className="mt-10 flex gap-4">
        <button className="bg-primary text-primary-foreground rounded-full px-8 py-3 font-medium transition-opacity hover:opacity-90">
          {t("getStarted")}
        </button>
        <button className="text-secondary-foreground hover:bg-accent bg-secondary rounded-full px-8 py-3 font-medium transition-colors">
          {t("learnMore")}
        </button>
      </div>
    </div>
  );
};

export default HeroContent;
