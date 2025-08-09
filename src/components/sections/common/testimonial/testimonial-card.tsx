import { Quote } from "lucide-react";
import Image from "next/image";

type TestimonialCardProps = {
  name: string;
  role: string;
  content: string;
  avatar: string;
};

const TestimonialCard = ({ name, role, content, avatar }: TestimonialCardProps) => {
  return (
    <div
      className="mx-4 w-[350px] rounded-lg bg-gradient-to-b from-[hsl(var(--testimonial-card-bg)_/_var(--testimonial-card-bg-opacity))] to-[hsl(var(--testimonial-card-bg)_/_0)] p-6 shadow-[0_0_12px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-300 ease-in-out select-none dark:shadow-[0_0_12px_rgba(255,255,255,0.1)]"
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `linear-gradient(to bottom, hsl(var(--testimonial-card-bg) / var(--testimonial-card-hover-opacity)), hsl(var(--testimonial-card-bg) / 0))`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `linear-gradient(to bottom, hsl(var(--testimonial-card-bg) / var(--testimonial-card-bg-opacity)), hsl(var(--testimonial-card-bg) / 0))`;
      }}
    >
      <div className="mb-4 flex items-center gap-4">
        <div className="relative h-12 w-12 overflow-hidden rounded-full">
          <Image src={avatar} alt={name} fill className="object-cover" />
        </div>
        <div>
          <div className="text-primary text-lg font-semibold">{name}</div>
          <p className="text-muted-foreground text-sm">{role}</p>
        </div>
      </div>
      <div className="relative">
        <Quote className="text-primary/20 absolute -top-2 -left-2 h-6 w-6" />
        <p className="text-body-2 text-foreground/80">{content}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;
