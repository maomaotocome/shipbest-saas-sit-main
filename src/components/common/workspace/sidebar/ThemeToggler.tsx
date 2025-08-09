"use client";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
interface ThemeTogglerProps {
  collapsed?: boolean;
  className?: string;
}

export const ThemeToggler = ({ collapsed = false, className }: ThemeTogglerProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("workspace");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={cn(
          "relative flex h-8 cursor-pointer items-center justify-between rounded-full bg-gray-100 p-1 dark:bg-gray-700",
          collapsed ? "w-10" : "w-16",
          className
        )}
      >
        <span className="h-6 w-6" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "relative flex h-8 cursor-pointer items-center justify-between rounded-full bg-[hsl(var(--theme-toggler-bg))] p-1",
        collapsed ? "w-10" : "w-16",
        className
      )}
      title={t("sidebar.themeToggler.title")}
    >
      <span
        className={cn(
          "absolute flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--theme-toggler-thumb))] text-[hsl(var(--theme-toggler-thumb-text))] transition-all duration-300",
          theme === "dark" ? "translate-x-8" : "translate-x-0",
          collapsed && theme === "dark" && "translate-x-2"
        )}
      >
        {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </span>

      {!collapsed && (
        <>
          <Sun className="h-4 w-4 text-[hsl(var(--theme-toggler-text-muted))]" />
          <Moon className="h-4 w-4 text-[hsl(var(--theme-toggler-text-muted))]" />
        </>
      )}
    </button>
  );
};
