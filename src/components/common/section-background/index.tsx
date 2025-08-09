import { cn } from "@/lib/utils";
import { GradientBlobs } from "./GradientBlobs";
interface SectionBackgroundProps {
  className?: string;
  backgroundType?: "gradient-blobs" | "none";
}

export const SectionBackground = ({
  className,
  backgroundType = "gradient-blobs",
}: SectionBackgroundProps) => {
  return (
    <div className={cn("absolute inset-0 -z-10", className)}>
      {backgroundType === "gradient-blobs" && <GradientBlobs />}
    </div>
  );
};
