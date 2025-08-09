export interface SelectOption {
  value: string;
  label: string;
  cover?: string;
}

export interface SelectSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  description?: string;

  // Control when to show as discrete buttons
  discreteThreshold?: number; // Show as discrete buttons when option count is less than this value, default is 5

  // Control when to show dialog for selection
  dialogThreshold?: number; // Show dialog when option count is greater than this value, default is 12

  // Icon and styling
  icon?: React.ComponentType<{ className?: string }>;

  // Common properties
  required?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;

  // Image display properties
  has_cover?: boolean; // Whether options have cover images
}

export type OptionSize = "small" | "medium" | "large";
