import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Dice1 } from "lucide-react";
import { InfoTooltip } from "@/components/common/ai/InfoTooltip";

interface SeedSelectorProps {
  seed: number;
  onSeedChange: (value: number) => void;
  label: string;
  description?: string;
  required?: boolean;
  className?: string;
}

export function SeedSelector({
  seed,
  onSeedChange,
  label,
  description,
  required = false,
  className,
}: SeedSelectorProps) {
  const handleRandomSeed = () => {
    // Generate an unsigned 32-bit integer
    const randomSeed = Math.floor(Math.random() * 0xffffffff);
    onSeedChange(randomSeed);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numeric input
    if (!/^\d*$/.test(value)) return;

    const numValue = parseInt(value);
    if (isNaN(numValue)) return;

    // Ensure value is within valid range
    const validValue = Math.min(Math.max(numValue, 0), 0xffffffff);
    onSeedChange(validValue);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl p-3 shadow-md shadow-black/15 dark:shadow-white/20",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <Dice1 className="text-primary h-4 w-4" />
        <Label htmlFor="seed" className="block text-left text-sm">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        {description && <InfoTooltip content={description} />}
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={seed}
          onChange={handleInputChange}
          className="h-8 w-32 text-center"
        />
        <Button
          variant="outline"
          type="button"
          size="sm"
          onClick={handleRandomSeed}
          className="h-8 px-2"
        >
          <Dice1 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
