"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { WorkspaceSidebar } from "./sidebar";
import { WorkspaceArea } from "./WorkspaceArea";

interface MenuGroup {
  label?: string;
  items: MenuItem[];
}

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  children?: MenuItem[];
}

interface WorkspaceProps {
  children: React.ReactNode;
  params: {
    menuGroups?: MenuGroup[];
    projcectConfig?: {
      queryKey: string;
      title: string;
      fetchUrl: string;
      urlPrefix: string;
    };
    noPadding?: boolean;
    contentClassName?: string;
  };
}

export default function Workspace({ children, params }: WorkspaceProps) {
  const isMobile = useIsMobile();
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <WorkspaceSidebar menuGroups={params.menuGroups} projectsConfig={params.projcectConfig} />

        {/* Main content */}
        <main className={cn("flex-1", isMobile ? "w-full" : "")}>
          <WorkspaceArea
            className="h-full"
            noPadding={params.noPadding}
            contentClassName={params.contentClassName}
          >
            {children}
          </WorkspaceArea>
        </main>
      </div>
    </SidebarProvider>
  );
}
