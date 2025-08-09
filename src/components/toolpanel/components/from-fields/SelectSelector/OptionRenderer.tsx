import { cn } from "@/lib/utils";
import Image from "next/image";
import { OptionSize, SelectOption } from "./types";

interface OptionRendererProps {
  option: SelectOption;
  isSelected: boolean;
  size?: OptionSize;
  showImages: boolean;
}

export function OptionRenderer({
  option,
  isSelected,
  size = "medium",
  showImages,
}: OptionRendererProps) {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-8 w-8",
    large: "h-16 w-16",
  };

  // For large size with cover, render full-cover layout
  if (size === "large" && showImages && option.cover) {
    return (
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden rounded-md",
          isSelected && "ring-primary ring-1 ring-offset-1"
        )}
      >
        <Image src={option.cover} alt={option.label} fill className="object-cover" />
        {/* Bottom overlay with text */}
        <div className="absolute right-0 bottom-0 left-0 bg-black/60 p-2 backdrop-blur-sm">
          <span className="block truncate text-center text-xs font-medium text-white">
            {option.label}
          </span>
        </div>
      </div>
    );
  }

  // Default layout for other cases
  return (
    <div className="flex items-center gap-2">
      {showImages && option.cover && (
        <Image
          src={option.cover}
          alt={option.label}
          width={size === "large" ? 64 : size === "medium" ? 32 : 24}
          height={size === "large" ? 64 : size === "medium" ? 32 : 24}
          className={cn("rounded object-cover", sizeClasses[size])}
        />
      )}
      <span className={cn(size === "large" && "text-sm font-medium")}>{option.label}</span>
    </div>
  );
}
