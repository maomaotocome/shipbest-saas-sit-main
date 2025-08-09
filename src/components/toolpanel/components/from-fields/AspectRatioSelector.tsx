import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AspectRatio } from "@/conifg/aigc/types";
import { cn } from "@/lib/utils";
import { JsonValue } from "@/types/json";
import { ChevronDown, ChevronUp, Maximize2, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { InfoTooltip } from "@/components/common/ai/InfoTooltip";

interface AspectRatioSelectorProps {
  aspectRatios: AspectRatio[];
  defaultValue: JsonValue;
  onAspectRatioChange: (value: JsonValue) => void;
  label?: string;
  description?: string;
  required?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  allowCustom?: boolean;
  customRange?: {
    w: { min: number; max: number; default?: number; step?: number };
    h: { min: number; max: number; default?: number; step?: number };
  };
  customRatioConvert?: ({ width, height }: { width: number; height: number }) => JsonValue;
}

export function AspectRatioSelector({
  aspectRatios,
  defaultValue,
  onAspectRatioChange,
  label,
  description,
  required = true,
  collapsible = false,
  className,
  defaultCollapsed = false,
  icon: IconComponent = Maximize2,
  allowCustom = false,
  customRange = {
    w: { min: 1, max: 24, step: 1 },
    h: { min: 1, max: 24, step: 1 },
  },
  customRatioConvert,
}: AspectRatioSelectorProps) {
  const t = useTranslations("ai.common");
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isCustom, setIsCustom] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio | null>(null);

  // Calculate default values for custom width and height
  const defaultWidth =
    customRange.w.default ?? Math.round((customRange.w.min + customRange.w.max) / 2);
  const defaultHeight =
    customRange.h.default ?? Math.round((customRange.h.min + customRange.h.max) / 2);
  const stepWidth = customRange.w.step ?? 1;
  const stepHeight = customRange.h.step ?? 1;

  const [customWidth, setCustomWidth] = useState(defaultWidth);
  const [customHeight, setCustomHeight] = useState(defaultHeight);
  const isHandlingCustomChange = useRef(false);

  useEffect(() => {
    // if is handling custom change, skip this update
    if (isHandlingCustomChange.current) {
      isHandlingCustomChange.current = false;
      return;
    }

    // Initialize selected ratio based on defaultValue
    if (typeof defaultValue === "string") {
      // Legacy string format, try to find matching aspect ratio or create from string
      const found = aspectRatios.find((ratio) => ratio.value === defaultValue);
      if (found) {
        setSelectedRatio(found);
        setIsCustom(false);
      } else {
        // Create custom ratio from string format like "16:9"
        const parts = defaultValue.split(":");
        if (parts.length === 2) {
          const w = parseInt(parts[0]);
          const h = parseInt(parts[1]);
          if (!isNaN(w) && !isNaN(h)) {
            setCustomWidth(w);
            setCustomHeight(h);
            setSelectedRatio({
              label: `Custom ${w}:${h}`,
              ratio: { w, h },
              value: defaultValue,
            });
            setIsCustom(true);
            return;
          }
        }
      }
    } else if (defaultValue && typeof defaultValue === "object" && "ratio" in defaultValue) {
      // New AspectRatio object format
      setSelectedRatio(defaultValue as unknown as AspectRatio);
      setIsCustom(false);
    } else if (!selectedRatio && aspectRatios.length > 0) {
      // only fallback to first ratio when no ratio is selected
      setSelectedRatio(aspectRatios[0]);
      setIsCustom(false);
    }
  }, [defaultValue, aspectRatios, selectedRatio]);

  const handleRatioChange = (ratio: AspectRatio) => {
    setSelectedRatio(ratio);
    setIsCustom(false);
    onAspectRatioChange(ratio.value);
  };

  const handleCustomChange = (width?: number, height?: number) => {
    const w = width ?? customWidth;
    const h = height ?? customHeight;

    const customRatio: AspectRatio = {
      label: `Custom ${w}:${h}`,
      ratio: { w, h },
      value: `${w}:${h}`,
    };
    setSelectedRatio(customRatio);
    setIsCustom(true);

    // Set flag to prevent useEffect re-initialization
    isHandlingCustomChange.current = true;

    // Use customRatioConvert if provided, otherwise return the ratio object
    if (customRatioConvert) {
      const convertedValue = customRatioConvert({ width: w, height: h });
      onAspectRatioChange(convertedValue);
    } else {
      onAspectRatioChange(customRatio.value);
    }
  };

  const handleCustomWidthChange = (values: number[]) => {
    setCustomWidth(values[0]);
    handleCustomChange(values[0], customHeight);
  };

  const handleCustomHeightChange = (values: number[]) => {
    setCustomHeight(values[0]);
    handleCustomChange(customWidth, values[0]);
  };

  const RatioIcon = ({
    ratio,
    isSelected,
  }: {
    ratio: { w: number; h: number };
    isSelected: boolean;
  }) => {
    const maxDimension = Math.max(ratio.w, ratio.h);
    const normalizedWidth = (ratio.w / maxDimension) * 24;
    const normalizedHeight = (ratio.h / maxDimension) * 24;

    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto"
      >
        <rect
          x={(32 - normalizedWidth) / 2}
          y={(32 - normalizedHeight) / 2}
          width={normalizedWidth}
          height={normalizedHeight}
          rx="2"
          strokeWidth="2"
          className={cn(
            "transition-colors duration-200",
            isSelected ? "stroke-primary" : "stroke-border group-hover:stroke-primary/50"
          )}
        />
      </svg>
    );
  };

  const displayLabel = label || t("aspectRatio");

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
          <Label htmlFor="aspect_ratio" className="block text-left text-sm">
            {displayLabel}
            {required && <span className="text-red-500">*</span>}
          </Label>
          {description && <InfoTooltip content={description} />}
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-muted-foreground/10 rounded-md px-2 py-1">
            <span className="text-muted-foreground text-sm">
              {selectedRatio?.label || t("aspectRatioSelector.notSelected")}
              {selectedRatio?.tip && (
                <span className="text-muted-foreground text-xs"> ({selectedRatio.tip})</span>
              )}
            </span>
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

          {/* Preset aspect ratios */}
          <div className="hidden grid-cols-9 gap-2 py-1 md:grid">
            {aspectRatios.map((ratio) => {
              const isSelected = !isCustom && selectedRatio?.value === ratio.value;

              const RatioButton = (
                <button
                  key={ratio.value}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRatioChange(ratio);
                  }}
                  className={cn(
                    "group relative flex flex-col items-center gap-2 transition-all duration-200",
                    isSelected ? "scale-105" : "hover:scale-105"
                  )}
                >
                  <RatioIcon ratio={ratio.ratio} isSelected={isSelected} />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {ratio.label}
                  </span>
                </button>
              );

              // Wrap with tooltip if tip exists
              if (ratio.tip) {
                return (
                  <Tooltip key={ratio.value}>
                    <TooltipTrigger asChild>{RatioButton}</TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">{ratio.tip}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return RatioButton;
            })}

            {/* Custom button */}
            {allowCustom && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCustom(true);
                  handleCustomChange(customWidth, customHeight);
                }}
                className={cn(
                  "group relative flex flex-col items-center gap-2 transition-all duration-200",
                  isCustom ? "scale-105" : "hover:scale-105"
                )}
              >
                {isCustom ? (
                  <RatioIcon ratio={{ w: customWidth, h: customHeight }} isSelected={true} />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-dashed">
                    <Settings
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isCustom ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                      )}
                    />
                  </div>
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    isCustom ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {isCustom ? `${customWidth}:${customHeight}` : t("aspectRatioSelector.custom")}
                </span>
              </button>
            )}
          </div>

          {/* Mobile scroll view */}
          <ScrollArea className="w-full whitespace-nowrap md:hidden">
            <div className="flex w-max space-x-2 p-2">
              {aspectRatios.map((ratio) => {
                const isSelected = !isCustom && selectedRatio?.value === ratio.value;

                const RatioButton = (
                  <button
                    key={ratio.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRatioChange(ratio);
                    }}
                    className={cn(
                      "group relative flex w-16 flex-col items-center gap-2 transition-all duration-200",
                      isSelected ? "scale-105" : "hover:scale-105"
                    )}
                  >
                    <RatioIcon ratio={ratio.ratio} isSelected={isSelected} />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {ratio.label}
                    </span>
                  </button>
                );

                // Wrap with tooltip if tip exists
                if (ratio.tip) {
                  return (
                    <Tooltip key={ratio.value}>
                      <TooltipTrigger asChild>{RatioButton}</TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">{ratio.tip}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return RatioButton;
              })}

              {/* Custom button for mobile */}
              {allowCustom && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCustom(true);
                    handleCustomChange(customWidth, customHeight);
                  }}
                  className={cn(
                    "group relative flex w-16 flex-col items-center gap-2 transition-all duration-200",
                    isCustom ? "scale-105" : "hover:scale-105"
                  )}
                >
                  {isCustom ? (
                    <RatioIcon ratio={{ w: customWidth, h: customHeight }} isSelected={true} />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-dashed">
                      <Settings
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isCustom
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-primary"
                        )}
                      />
                    </div>
                  )}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isCustom ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {isCustom ? `${customWidth}:${customHeight}` : t("aspectRatioSelector.custom")}
                  </span>
                </button>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Custom sliders - only show when custom is selected, removed the border/background */}
          {isCustom && allowCustom && (
            <div className="space-y-3 p-3">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">
                    {t("aspectRatioSelector.customWidth")}: {customWidth}
                  </Label>
                  <Slider
                    value={[customWidth]}
                    min={customRange.w.min}
                    max={customRange.w.max}
                    step={stepWidth}
                    onValueChange={handleCustomWidthChange}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm">
                    {t("aspectRatioSelector.customHeight")}: {customHeight}
                  </Label>
                  <Slider
                    value={[customHeight]}
                    min={customRange.h.min}
                    max={customRange.h.max}
                    step={stepHeight}
                    onValueChange={handleCustomHeightChange}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
