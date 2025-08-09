"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavigationItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: string | number;
  disabled?: boolean;
  children?: NavigationItem[];
}

interface NavigationGroup {
  label?: string;
  items: NavigationItem[];
}

interface NavigationProps {
  groups?: NavigationGroup[];
  className?: string;
}

const NavItem = ({ item, level = 0 }: { item: NavigationItem; level?: number }) => {
  const locale = useLocale();
  const pathname = usePathname();
  const { state } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);

  const isCollapsed = state === "collapsed";
  const isActive = pathname === `${item.href}` || pathname === `/${locale}${item.href}`;
  const isChildActive = item.children?.some(
    (child) => pathname === `${child.href}` || pathname === `/${locale}${child.href}`
  );
  const shouldShowActive = isActive || (isCollapsed && isChildActive);
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  // If this is a submenu item (level > 0), render as submenu
  if (level > 0) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton
          asChild
          isActive={shouldShowActive}
          className={cn(item.disabled && "cursor-not-allowed opacity-50")}
        >
          <Link href={item.disabled ? "#" : `/${locale}${item.href}`} title={item.label}>
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  // Main menu item
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild={!hasChildren}
        isActive={shouldShowActive}
        className={cn(
          item.disabled && "cursor-not-allowed opacity-50",
          hasChildren && "cursor-pointer"
        )}
        tooltip={isCollapsed ? item.label : undefined}
        onClick={hasChildren && !isCollapsed ? () => setIsOpen(!isOpen) : undefined}
      >
        {hasChildren ? (
          <div className="flex w-full items-center">
            <Icon className="h-4 w-4 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </>
            )}
          </div>
        ) : (
          <Link
            href={item.disabled ? "#" : `/${locale}${item.href}`}
            title={item.label}
            className="flex w-full items-center"
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        )}
      </SidebarMenuButton>

      {hasChildren && isOpen && !isCollapsed && (
        <SidebarMenuSub>
          {item.children?.map((child, index) => (
            <NavItem key={index} item={child} level={level + 1} />
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
};

export function Navigation({ groups = [], className = "" }: NavigationProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {groups.map((group, groupIndex) => (
        <SidebarGroup key={groupIndex}>
          {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item, index) => (
                <NavItem key={index} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </div>
  );
}
