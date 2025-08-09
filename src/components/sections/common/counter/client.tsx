"use client";
import { SectionBackground } from "@/components/common/section-background";
import { cn } from "@/lib/utils";
import React from "react";
import CounterItem from "./CounterItem";
import Divider from "./Divider";
//define prop types
type CounterProps = {
  title: string;
  description: string;
  items: { label: string; number: number; more?: boolean; unit?: string }[];
  divider?: boolean;
  duration?: number;
  className?: string;
};

const CounterClient = (props: CounterProps) => {
  const { title, description, items, divider = true, duration = 500, className } = props;

  return (
    <section
      className={cn(
        "relative overflow-hidden pt-17.5 pb-17.5 backdrop-blur-sm lg:pb-22.5 xl:pb-27.5",
        className
      )}
    >
      <SectionBackground />
      <div className="container mx-auto px-4 select-none sm:px-8 xl:px-0">
        <h2 className="text-primary mb-8 text-center text-3xl font-bold">{title}</h2>
        <p className="mb-12 text-center text-base text-black/80 sm:text-lg dark:text-white/80">
          {description}
        </p>

        <div className="flex flex-col items-center justify-center gap-7.5 sm:flex-row lg:gap-12.5 xl:gap-17.5">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {divider && index > 0 && <Divider />}
              <CounterItem
                number={item.number}
                label={item.label}
                more={item.more}
                unit={item.unit}
                duration={duration}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CounterClient;
