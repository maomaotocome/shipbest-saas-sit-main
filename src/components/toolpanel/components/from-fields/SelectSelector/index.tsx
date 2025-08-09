import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, List } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { InfoTooltip } from "@/components/common/ai/InfoTooltip";
import { DialogSelection } from "./DialogSelection";
import { DiscreteButtons } from "./DiscreteButtons";
import { SelectDropdown } from "./SelectDropdown";
import { SelectSelectorProps } from "./types";

export function SelectSelector({
  value,
  onChange,
  label,
  options,
  placeholder,
  description,
  discreteThreshold = 5,
  dialogThreshold = 12,
  icon: IconComponent = List,
  required = false,
  collapsible = false,
  defaultCollapsed = false,
  className,
  has_cover = false,
}: SelectSelectorProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Ensure current value is in options, use first option if not found
  const currentValue = options.find((opt) => opt.value === value)?.value || options[0]?.value || "";
  const currentLabel = options.find((opt) => opt.value === currentValue)?.label || "";
  const currentCover = options.find((opt) => opt.value === currentValue)?.cover;

  // Determine which mode to use based on option count and has_cover
  const useDiscreteMode = options.length <= discreteThreshold;
  const useDialogMode = options.length > dialogThreshold;
  const showImages = has_cover && options.some((opt) => opt.cover);

  const handleChange = (newValue: string) => {
    onChange(newValue);
    setDialogOpen(false);
  };

  return (
    <div
      className={cn(
        "space-y-2 rounded-xl p-2 shadow-md shadow-black/15 dark:shadow-white/20",
        className
      )}
      onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <IconComponent className="text-primary h-4 w-4" />
          <Label htmlFor="select_selector" className="block text-left text-sm">
            {label}
            {required && <span className="text-red-500">*</span>}
          </Label>
          {description && <InfoTooltip content={description} />}
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-muted-foreground/10 rounded-md px-2 py-1">
            <div className="flex items-center gap-2">
              {showImages && currentCover && (
                <Image
                  src={currentCover}
                  alt={currentLabel}
                  width={16}
                  height={16}
                  className="h-4 w-4 rounded object-cover"
                />
              )}
              <span className="text-muted-foreground text-sm">{currentLabel}</span>
            </div>
          </div>
          {collapsible && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(!isCollapsed);
              }}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}

          {useDiscreteMode && (
            <DiscreteButtons
              options={options}
              currentValue={currentValue}
              showImages={showImages}
              onSelect={handleChange}
            />
          )}

          {!useDiscreteMode && useDialogMode && (
            <DialogSelection
              options={options}
              currentValue={currentValue}
              currentLabel={currentLabel}
              currentCover={currentCover}
              showImages={showImages}
              placeholder={placeholder}
              label={label}
              dialogOpen={dialogOpen}
              onOpenChange={setDialogOpen}
              onSelect={handleChange}
            />
          )}

          {!useDiscreteMode && !useDialogMode && (
            <SelectDropdown
              options={options}
              currentValue={currentValue}
              placeholder={placeholder}
              label={label}
              showImages={showImages}
              onSelect={handleChange}
            />
          )}
        </>
      )}
    </div>
  );
}

// Re-export types for convenience
export type { SelectOption, SelectSelectorProps } from "./types";
