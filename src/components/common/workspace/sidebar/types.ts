import type { LucideProps } from "lucide-react";

export interface MenuItem {
  icon: string;
  label: string;
  href: string;
  children?: MenuItem[];
}

export interface ProcessedMenuItem {
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  label: string;
  href: string;
  children?: ProcessedMenuItem[];
}

export interface MenuGroup {
  label?: string;
  items: MenuItem[];
}

export interface NavigationGroup {
  label?: string;
  items: ProcessedMenuItem[];
}

export interface SidebarClientProps {
  menuGroups?: MenuGroup[];
  projectsConfig?: {
    title: string;
    fetchUrl: string;
    queryKey: string;
    urlPrefix: string;
  };
}
