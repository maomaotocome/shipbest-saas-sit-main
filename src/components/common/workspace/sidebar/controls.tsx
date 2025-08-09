import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Pin, PinOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { ThemeToggler } from "./ThemeToggler";

interface SidebarControlsProps {
  isPinned: boolean;
  onPinChange: (pinned: boolean) => void;
}

export function SidebarControls({ isPinned, onPinChange }: SidebarControlsProps) {
  const { state, isMobile } = useSidebar();
  const t = useTranslations("workspace");
  const isCollapsed = state === "collapsed";

  return (
    <div className={cn(isCollapsed ? "px-1" : "px-3", "-mx-1 py-1")}>
      <div className="flex items-center justify-between">
        <ThemeToggler collapsed={isCollapsed} className={cn(!isCollapsed ? "w-16" : "w-10")} />

        <div className="flex items-center">
          {!isMobile && !isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPinChange(!isPinned)}
              className="h-8 w-8 rounded-full"
              title={isPinned ? t("sidebar.unpin") : t("sidebar.pin")}
            >
              {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
