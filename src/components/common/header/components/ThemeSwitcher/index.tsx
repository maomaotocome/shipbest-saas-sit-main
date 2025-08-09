"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRef } from "react";
import { ThemeSwitcherContent } from "./ThemeSwitcherContent";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { useThemeSwitcher } from "./useThemeSwitcher";

export const ThemeSwitcher = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    mounted,
    isOpen,
    setIsOpen,
    resolvedTheme,
    handleMouseEnter,
    handleMouseLeave,
    handleThemeToggle,
  } = useThemeSwitcher();

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  return (
    <div className="relative" ref={containerRef}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <span onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <ThemeToggleButton resolvedTheme={resolvedTheme} onToggle={handleThemeToggle} />
          </span>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 outline-hidden"
          align="end"
          side="left"
          alignOffset={0}
          sideOffset={15}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <ThemeSwitcherContent />
        </PopoverContent>
      </Popover>
    </div>
  );
};
