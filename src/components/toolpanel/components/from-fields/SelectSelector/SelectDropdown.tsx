import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OptionRenderer } from "./OptionRenderer";
import { SelectOption } from "./types";

interface SelectDropdownProps {
  options: SelectOption[];
  currentValue: string;
  placeholder?: string;
  label: string;
  showImages: boolean;
  onSelect: (value: string) => void;
}

export function SelectDropdown({
  options,
  currentValue,
  placeholder,
  label,
  showImages,
  onSelect,
}: SelectDropdownProps) {
  return (
    <Select value={currentValue} onValueChange={onSelect}>
      <SelectTrigger className="border-none focus:ring-0" onClick={(e) => e.stopPropagation()}>
        <SelectValue placeholder={placeholder || `Select ${label}`}>
          {currentValue && (
            <OptionRenderer
              option={options.find((opt) => opt.value === currentValue)!}
              isSelected={true}
              size="small"
              showImages={showImages}
            />
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <OptionRenderer
              option={option}
              isSelected={option.value === currentValue}
              size="small"
              showImages={showImages}
            />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
