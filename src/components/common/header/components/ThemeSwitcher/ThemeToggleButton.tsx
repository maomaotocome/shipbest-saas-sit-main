"use client";

import { Moon, Sun } from "lucide-react";

interface ThemeToggleButtonProps {
  resolvedTheme?: string;
  onToggle: () => void;
}

export const ThemeToggleButton = ({ resolvedTheme, onToggle }: ThemeToggleButtonProps) => {
  return (
    <button
      onClick={onToggle}
      className="hover:bg-accent hover:text-accent-foreground flex h-9 w-9 items-center justify-center rounded-lg p-2 outline-hidden focus:outline-hidden"
      aria-label="Theme settings"
    >
      {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
};
