"use client";
import { SectionBackground } from "@/components/common/section-background";
import { cn } from "@/lib/utils";
import type { LucideProps } from "lucide-react";
import * as LucideIcons from "lucide-react";
import React from "react";

type FeatureItem = {
  title: string;
  description: string;
  icon: string;
};

type FeatureProps = {
  title: string;
  description: string;
  items: FeatureItem[];
  className?: string;
};

const FeaturesClient = (props: FeatureProps) => {
  const { title, description, items, className } = props;

  // Function to dynamically get icon component from Lucide
  const getLucideIcon = (iconName: string) => {
    // Get the icon from Lucide React
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>)[
      iconName
    ];

    if (Icon) {
      return <Icon className="h-7.5 w-7.5" />;
    }

    // Fallback to a default icon if not found
    console.warn(`Icon '${iconName}' not found in Lucide, using default.`);
    return <LucideIcons.Square className="h-7.5 w-7.5" />;
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden py-17.5 backdrop-blur-sm lg:py-22.5 xl:py-27.5",
        className
      )}
    >
      <SectionBackground />
      <div className="container mx-auto px-4 select-none sm:px-8 xl:px-0">
        <div className="mb-15">
          <h2 className="text-primary mb-8 text-center text-3xl font-bold">{title}</h2>
          <p className="text-foreground/80 mb-12 text-center">{description}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => {
            return (
              <div
                key={index}
                className="feature-card group rounded-lg p-7.5 shadow-[0_0_24px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-300 ease-in-out dark:shadow-[0_0_24px_rgba(255,255,255,0.1)]"
                style={{
                  backgroundColor: `hsl(var(--feature-card-bg) / var(--feature-card-bg-opacity))`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `hsl(var(--feature-card-bg) / var(--feature-card-hover-opacity))`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `hsl(var(--feature-card-bg) / var(--feature-card-bg-opacity))`;
                }}
              >
                <div className="bg-primary/10 text-primary group-hover:bg-primary dark:bg-primary/20 dark:text-primary/90 dark:group-hover:bg-primary mb-7.5 flex h-15 w-15 items-center justify-center rounded-[4px] transition-all duration-300 group-hover:text-white dark:group-hover:text-white">
                  {getLucideIcon(item.icon)}
                </div>
                <h3 className="group-hover:text-primary dark:group-hover:text-primary text-primary mb-5 text-lg font-semibold transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-body-2 text-foreground/80 transition-colors duration-300">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesClient;
