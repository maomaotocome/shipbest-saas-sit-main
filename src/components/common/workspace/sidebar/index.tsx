"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Home } from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarControls } from "./controls";
import { FooterContent } from "./footer";
import { HeaderContent } from "./header";
import { Navigation } from "./navigation";
import { Projects } from "./projects";
import type {
  MenuGroup,
  MenuItem,
  NavigationGroup,
  ProcessedMenuItem,
  SidebarClientProps,
} from "./types";

export function WorkspaceSidebar({ menuGroups, projectsConfig }: SidebarClientProps) {
  const [navigationGroups, setNavigationGroups] = useState<NavigationGroup[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [shouldCollapseAfterDropdown, setShouldCollapseAfterDropdown] = useState(false);
  const { state, setOpen } = useSidebar();

  // Add mouse event handlers
  const handleMouseEnter = () => {
    if (state === "collapsed") {
      setOpen(true);
    }
    setShouldCollapseAfterDropdown(false);
  };

  const handleMouseLeave = () => {
    // Don't collapse if pinned or if dropdown menu is open
    if (state === "expanded" && !isPinned && !isDropdownOpen) {
      setOpen(false);
    } else if (state === "expanded" && !isPinned && isDropdownOpen) {
      // Mark that we should collapse after dropdown closes
      setShouldCollapseAfterDropdown(true);
    }
  };

  const handleDropdownOpenChange = (open: boolean) => {
    setIsDropdownOpen(open);

    // If dropdown is closing and we should collapse, do it now
    if (!open && shouldCollapseAfterDropdown && state === "expanded" && !isPinned) {
      setOpen(false);
      setShouldCollapseAfterDropdown(false);
    }
  };

  useEffect(() => {
    const processMenuGroups = async (groups: MenuGroup[]) => {
      const processItem = async (item: MenuItem): Promise<ProcessedMenuItem> => {
        try {
          const icons = await import("lucide-react");
          const IconComponent = icons[item.icon as keyof typeof icons];

          const processedItem: ProcessedMenuItem = {
            label: item.label,
            href: item.href,
            icon: (IconComponent || Home) as ProcessedMenuItem["icon"],
            children: undefined,
          };

          if (item.children) {
            processedItem.children = await Promise.all(item.children.map(processItem));
          }

          return processedItem;
        } catch (error) {
          console.error(`Failed to load icon: ${item.icon}`, error);
          return {
            label: item.label,
            href: item.href,
            icon: Home,
            children: item.children ? await Promise.all(item.children.map(processItem)) : undefined,
          };
        }
      };

      const processedGroups: NavigationGroup[] = await Promise.all(
        groups.map(async (group) => ({
          label: group.label,
          items: await Promise.all(group.items.map(processItem)),
        }))
      );

      setNavigationGroups(processedGroups);
    };

    if (menuGroups && menuGroups.length > 0) {
      processMenuGroups(menuGroups);
    }
  }, [menuGroups]);

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SidebarHeader>
          <HeaderContent />
        </SidebarHeader>

        <SidebarContent className="flex flex-col overflow-y-auto">
          <div className="flex-none">
            <Navigation groups={navigationGroups} />
          </div>

          {projectsConfig && (
            <div className="min-h-0 flex-1">
              <SidebarGroup>
                <Projects
                  title={projectsConfig.title}
                  fetchUrl={projectsConfig.fetchUrl}
                  queryKey={projectsConfig.queryKey}
                  urlPrefix={projectsConfig.urlPrefix}
                />
              </SidebarGroup>
            </div>
          )}
        </SidebarContent>

        <SidebarFooter className="mt-auto px-1">
          <SidebarControls isPinned={isPinned} onPinChange={setIsPinned} />
          <FooterContent onDropdownOpenChange={handleDropdownOpenChange} />
        </SidebarFooter>
      </Sidebar>

      <SidebarTrigger className="absolute top-2 right-2 flex items-center justify-center md:hidden" />
    </>
  );
}
