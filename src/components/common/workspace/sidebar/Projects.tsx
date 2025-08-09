"use client";

import LoadingAnimate from "@/components/common/animate/loading-animate";
import {
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ProjectItem } from "@/types/workspace/project";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

interface ProjectsProps {
  title: string;
  fetchUrl: string;
  queryKey: string;
  urlPrefix: string;
}

export function Projects({ title, fetchUrl, queryKey, urlPrefix }: ProjectsProps) {
  const locale = useLocale();
  const t = useTranslations("workspace");
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(t("projects.fetchError"));
      }
      return response.json();
    },
  });

  if (isCollapsed) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarGroupContent className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center">
            <LoadingAnimate className="h-8 w-8" />
          </div>
        ) : error ? (
          <div className="text-destructive px-4 py-2 text-sm">
            {error instanceof Error ? error.message : error}
          </div>
        ) : items.length === 0 ? (
          <div className="text-muted-foreground px-4 py-2 text-sm">
            {t("projects.noItemsFound")}
          </div>
        ) : (
          <SidebarMenu>
            {items.map((item: ProjectItem, index: number) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuButton asChild>
                  <Link
                    href={`/${locale}${urlPrefix}/${item.id}`}
                    title={item.title}
                    className="w-full"
                  >
                    <span className="truncate">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}
      </SidebarGroupContent>
    </div>
  );
}
