"use client";
import { SectionBackground } from "@/components/common/section-background";
import { cn } from "@/lib/utils";
import { ChevronDownCircle } from "lucide-react";
import { useState } from "react";

type FAQProps = {
  title: string;
  description: string;
  items: { question: string; answer: string }[];
  openOnMouseEnter?: boolean;
  expandAll?: boolean;
  columns?: {
    sm: 1 | 2;
    md: 1 | 2 | 3;
    lg: 1 | 2 | 3 | 4;
  };
  className?: string;
};

const FAQClient = (props: FAQProps) => {
  const {
    title,
    description,
    items,
    openOnMouseEnter = true,
    expandAll = false,
    columns = { sm: 1, md: 1, lg: 1 },
    className,
  } = props;
  const [openIndices, setOpenIndices] = useState<{ [key: number]: number | null }>({});

  const toggleAccordion = (itemIndex: number) => {
    setOpenIndices((prev) => ({
      ...prev,
      [itemIndex]: prev[itemIndex] === itemIndex ? null : itemIndex,
    }));
  };

  return (
    <section className={cn("relative py-24", className)}>
      <SectionBackground />
      <div className="container mx-auto w-full px-4 sm:px-8 xl:px-0">
        <h2 className="text-primary mb-8 text-center text-3xl font-bold">{title}</h2>
        <p className="mb-12 text-center text-black/80 dark:text-white/80">{description}</p>

        <div
          className={`grid grid-cols-1 gap-4 sm:grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg}`}
        >
          {items.map((item, itemIndex) => (
            <div key={itemIndex} className={`grid grid-cols-1 gap-4`}>
              <div
                key={itemIndex}
                className="overflow-hidden rounded-lg bg-white/50 backdrop-blur-sm dark:bg-black/30"
                onMouseEnter={() => !expandAll && openOnMouseEnter && toggleAccordion(itemIndex)}
                onMouseLeave={() => !expandAll && openOnMouseEnter && toggleAccordion(itemIndex)}
              >
                {expandAll ? (
                  <div className="flex w-full items-center justify-between p-4 text-left">
                    <h3 className="font-medium text-black dark:text-white">{item.question}</h3>
                  </div>
                ) : (
                  <button
                    className="flex w-full items-center justify-between p-4 text-left"
                    onClick={() => !openOnMouseEnter && toggleAccordion(itemIndex)}
                  >
                    <h3 className="font-medium text-black dark:text-white">{item.question}</h3>

                    <ChevronDownCircle
                      className={`h-5 w-5 transition-all duration-300 ${
                        openIndices[itemIndex] === itemIndex ? "rotate-180 transform" : ""
                      }`}
                    />
                  </button>
                )}

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    openIndices[itemIndex] === itemIndex || expandAll
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-4 pt-0 text-black/80 dark:text-white/80">{item.answer}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQClient;
