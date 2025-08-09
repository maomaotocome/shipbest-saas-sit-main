import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { OptionRenderer } from "./OptionRenderer";
import { SelectOption } from "./types";

interface DiscreteButtonsProps {
  options: SelectOption[];
  currentValue: string;
  showImages: boolean;
  onSelect: (value: string) => void;
}

export function DiscreteButtons({
  options,
  currentValue,
  showImages,
  onSelect,
}: DiscreteButtonsProps) {
  return (
    <div className="space-y-2">
      {/* Desktop view - grid layout */}
      <div
        className={cn(
          "hidden gap-1.5 py-1 md:grid",
          showImages
            ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
            : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        )}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(option.value);
            }}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              showImages && "p-0",
              option.value === currentValue
                ? showImages
                  ? "bg-transparent"
                  : "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            <OptionRenderer
              option={option}
              isSelected={option.value === currentValue}
              size={showImages ? "large" : "medium"}
              showImages={showImages}
            />
          </button>
        ))}
      </div>

      {/* Mobile view - horizontal scroll */}
      <ScrollArea className="w-full whitespace-nowrap md:hidden">
        <div className="flex w-max space-x-1.5 p-2">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(option.value);
              }}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors",
                showImages && "min-w-[80px] p-0",
                option.value === currentValue
                  ? showImages
                    ? "bg-transparent"
                    : "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              <OptionRenderer
                option={option}
                isSelected={option.value === currentValue}
                size="medium"
                showImages={showImages}
              />
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
