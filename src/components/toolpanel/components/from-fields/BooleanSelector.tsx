import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ToggleLeft } from "lucide-react";
import { InfoTooltip } from "@/components/common/ai/InfoTooltip";

interface BooleanSelectorProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;

  // Icons and styles
  icon?: React.ComponentType<{ className?: string }>;

  // Common properties
  required?: boolean;
  className?: string;
}

export function BooleanSelector({
  value,
  onChange,
  label,
  description,
  icon: IconComponent = ToggleLeft,
  required = false,
  className,
}: BooleanSelectorProps) {
  const handleToggle = (checked: boolean) => {
    onChange(checked);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl p-3 shadow-md shadow-black/15 dark:shadow-white/20",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <IconComponent className="text-primary h-4 w-4" />
        <Label htmlFor="boolean_selector" className="block text-left text-sm">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        {description && <InfoTooltip content={description} />}
      </div>

      <Switch id="boolean_selector" checked={value} onCheckedChange={handleToggle} />
    </div>
  );
}
