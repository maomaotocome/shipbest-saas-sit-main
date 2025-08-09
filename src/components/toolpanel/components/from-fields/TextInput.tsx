import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { useState } from "react";
import { InfoTooltip } from "@/components/common/ai/InfoTooltip";

interface PromptInputProps {
  title: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  description?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  text_max_length?: number;
}

export function TextInput({
  title,
  value,
  onChange,
  required = false,
  placeholder,
  description,
  collapsible = false,
  defaultCollapsed = false,
  className,
  text_max_length = 8192,
}: PromptInputProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

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
          <MessageSquare className="text-primary h-4 w-4" />
          <Label htmlFor="prompt" className="block text-left text-sm">
            {title}
            {required && <span className="text-red-500">*</span>}
          </Label>
          {description && <InfoTooltip content={description} />}
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
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        )}
      </div>
      {!isCollapsed && (
        <Textarea
          id="prompt"
          name="prompt"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || title}
          rows={3}
          className="max-h-[120px] min-h-[60px] border-none text-sm focus:ring-0"
          onClick={(e) => e.stopPropagation()}
          maxLength={text_max_length}
        />
      )}
    </div>
  );
}
