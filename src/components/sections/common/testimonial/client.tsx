"use client";
import { SectionBackground } from "@/components/common/section-background";
import { Marquee } from "@/components/magicui/marquee";
import { cn } from "@/lib/utils";
import TestimonialCard from "./testimonial-card";

type TestimonialProps = {
  title: string;
  description: string;
  items: {
    name: string;
    role: string;
    content: string;
    avatar: string;
  }[];
  className?: string;
};

const TestimonialClient = (props: TestimonialProps) => {
  const { title, description, items, className } = props;

  // Split items into two groups
  const firstRow = items.slice(0, Math.ceil(items.length / 2));
  const secondRow = items.slice(Math.ceil(items.length / 2));

  return (
    <section className={cn("relative py-24", className)}>
      <SectionBackground />
      <div className="container mx-auto text-center">
        <div className="mb-15">
          <h2 className="text-primary mb-8 text-center text-3xl font-bold">{title}</h2>
          <p className="mb-12 text-center text-black/80 dark:text-white/80">{description}</p>
        </div>

        <div className="relative space-y-2">
          {/* Left gradient overlay */}
          <div
            className="pointer-events-none absolute top-0 left-0 z-10 h-full w-[100px]"
            style={{
              background: `linear-gradient(to right, 
                hsl(var(--testimonial-bg) / 100) 0%,
                hsl(var(--testimonial-bg) / 0) 100%
              )`,
            }}
          />

          {/* Right gradient overlay */}
          <div
            className="pointer-events-none absolute top-0 right-0 z-10 h-full w-[100px]"
            style={{
              background: `linear-gradient(to left, 
                hsl(var(--testimonial-bg) / 100) 0%,
                hsl(var(--testimonial-bg) / 0) 100%
              )`,
            }}
          />

          {/* First row - scrolls left */}
          <Marquee className="py-2" pauseOnHover repeat={2}>
            {firstRow.map((item, index) => (
              <TestimonialCard key={index} {...item} />
            ))}
          </Marquee>

          {/* Second row - scrolls right */}
          <Marquee className="py-2" pauseOnHover repeat={2} reverse>
            {secondRow.map((item, index) => (
              <TestimonialCard key={index} {...item} />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
};

export default TestimonialClient;
