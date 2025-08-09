import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Grid3X3, Search } from "lucide-react";
import Image from "next/image";
import { OptionRenderer } from "./OptionRenderer";
import { SelectOption } from "./types";

interface DialogSelectionProps {
  options: SelectOption[];
  currentValue: string;
  currentLabel: string;
  currentCover?: string;
  showImages: boolean;
  placeholder?: string;
  label: string;
  dialogOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (value: string) => void;
}

export function DialogSelection({
  options,
  currentValue,
  currentLabel,
  currentCover,
  showImages,
  placeholder,
  label,
  dialogOpen,
  onOpenChange,
  onSelect,
}: DialogSelectionProps) {
  return (
    <Dialog open={dialogOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between border-none focus:ring-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            {showImages && currentCover && (
              <Image
                src={currentCover}
                alt={currentLabel}
                width={24}
                height={24}
                className="h-6 w-6 rounded object-cover"
              />
            )}
            <span>{currentLabel || placeholder || `Select ${label}`}</span>
          </div>
          <Grid3X3 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            选择 {label}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div
            className={cn(
              "grid gap-3",
              showImages ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
            )}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className={cn(
                  "rounded-lg border-2 p-3 text-left transition-all hover:shadow-md",
                  showImages && "overflow-hidden p-0",
                  option.value === currentValue
                    ? showImages
                      ? "border-transparent bg-transparent"
                      : "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
