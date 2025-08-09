import { InfoTooltip } from "@/components/common/ai/InfoTooltip";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Hash } from "lucide-react";
import { useState } from "react";

interface NumberSelectorProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  description?: string;

  // Support two modes: discrete values array or range
  values?: number[]; // Discrete values array mode
  range?: { min: number; max: number; step: number }; // Range mode, default { min: 1, max: 10, step: 1 }

  // Display related
  unit?: string; // Unit, like "s", "px" etc.
  icon?: React.ComponentType<{ className?: string }>; // Icon component, default Hash
  showQuickButtons?: boolean; // Whether to show quick buttons, default when values is not undefined
  valuePosition?: "inline" | "badge"; // Value display position: inline(slider right) or badge(top right default)

  // Common properties
  required?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

export function NumberSelector({
  value,
  onChange,
  label,
  description,
  values,
  range = { min: 1, max: 10, step: 1 },
  unit = "",
  icon: IconComponent = Hash,
  showQuickButtons,
  valuePosition = "badge",
  required = false,
  collapsible = false,
  defaultCollapsed = false,
  className,
}: NumberSelectorProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // compute available values
  const availableValues = values || generateRangeValues(range);

  // ensure current value is in the available values range
  const currentValue = availableValues.includes(value) ? value : availableValues[0];

  // determine if the quick buttons should be shown
  const shouldShowQuickButtons = showQuickButtons ?? values !== undefined;

  // determine if the discrete mode is enabled
  const isDiscreteMode = values !== undefined;

  function generateRangeValues(range: { min: number; max: number; step: number }): number[] {
    const result: number[] = [];
    for (let i = range.min; i <= range.max; i += range.step) {
      result.push(i);
    }
    return result;
  }

  const handleSliderChange = (sliderValue: number[]) => {
    let newValue: number;

    if (values) {
      // discrete mode: get the value by index
      const index = sliderValue[0];
      newValue = availableValues[index];
    } else {
      // range mode: use the slider value directly
      newValue = sliderValue[0];
    }

    if (newValue !== undefined) {
      onChange(newValue);
    }
  };

  const formatValue = (val: number) => `${val}${unit}`;

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
          <Label htmlFor="number_selector" className="block text-left text-sm">
            {label}
            {required && <span className="text-red-500">*</span>}
          </Label>
          {description && <InfoTooltip content={description} />}
        </div>
        <div className="flex items-center gap-2">
          {/* show the current value in the badge position */}
          {valuePosition === "badge" && (
            <div className="bg-muted-foreground/10 rounded-md px-2 py-1">
              <span className="text-muted-foreground text-sm">{formatValue(currentValue)}</span>
            </div>
          )}
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
          {isDiscreteMode ? (
            <div className="space-y-2">
              {/* Desktop view - grid layout */}
              <div className="hidden grid-cols-2 gap-1.5 py-1 md:grid lg:grid-cols-3 xl:grid-cols-4">
                {availableValues.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(val);
                    }}
                    className={`rounded-md px-3 py-2 text-sm transition-colors ${
                      val === currentValue
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {formatValue(val)}
                  </button>
                ))}
              </div>

              {/* Mobile view - horizontal scroll */}
              <ScrollArea className="w-full whitespace-nowrap md:hidden">
                <div className="flex w-max space-x-1.5 p-2">
                  {availableValues.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(val);
                      }}
                      className={`rounded-md px-3 py-2 text-sm transition-colors ${
                        val === currentValue
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {formatValue(val)}
                    </button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          ) : (
            /* range mode: show the slider */
            <div className="flex items-center gap-3">
              <Slider
                id="number_selector"
                value={[currentValue]}
                onValueChange={handleSliderChange}
                min={range.min}
                max={range.max}
                step={range.step}
                className="h-8"
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                }}
              />
              {/* show the current value in the inline position */}
              {valuePosition === "inline" && (
                <span className="min-w-[3rem] text-center text-sm">
                  {formatValue(currentValue)}
                </span>
              )}
            </div>
          )}

          {/* show the quick buttons only in the range mode */}
          {shouldShowQuickButtons && !isDiscreteMode && (
            <div className="text-muted-foreground flex flex-wrap gap-1 text-xs">
              {availableValues.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(val);
                  }}
                  className={`rounded px-2 py-1 text-xs transition-colors ${
                    val === currentValue
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {formatValue(val)}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
