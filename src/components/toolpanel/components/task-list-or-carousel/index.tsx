"use client";

import { getStaticDataAction } from "@/actions/staticData/get";
import { CarouselItem } from "@/components/common/mix-carousel";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { Carousel } from "./Carousel";
import { TaskList } from "./Task";
import { useTaskList } from "./Task/hooks";

// Hook for fetching demo data
function useDemoItems(type: "image" | "video" | "audio", enabled: boolean = true) {
  const locale = useLocale();

  const { data, isLoading, error } = useQuery({
    queryKey: ["demoItems", type, locale],
    queryFn: () => getStaticDataAction({ locale, key: "demo-items", type }),
    enabled,
  });

  // Return data, use default data if fetch fails
  const items = data?.items;
  return {
    items,
    isLoading,
    error,
  };
}

interface TaskListOrCarouselProps {
  className?: string;
  demoType?: "image" | "video" | "audio";
  demoInterval?: number;
  demoItems?: CarouselItem[];
}

export function TaskListOrCarousel({
  className,
  demoType = "image",
  demoInterval = 5000,
  demoItems,
}: TaskListOrCarouselProps) {
  const { data: session } = useSession();
  const { data: taskData, status: taskStatus } = useTaskList({ enabled: !!session });

  // Only call useDemoItems hook when demoItems is not provided
  const { items: fetchedDemoItems } = useDemoItems(demoType, !demoItems);

  // Use provided demoItems or data fetched from hook
  const finalDemoItems = demoItems || fetchedDemoItems || [];

  if (!session) {
    return (
      <div className={className}>
        <Carousel items={finalDemoItems} interval={demoInterval} className="h-full" />
      </div>
    );
  }

  const hasNoTasks = taskData?.pages.every((page) => page.items.length === 0) ?? true;
  const isTaskDataLoaded = taskStatus === "success";

  if (isTaskDataLoaded && hasNoTasks) {
    return (
      <div className={className}>
        <Carousel items={finalDemoItems} interval={demoInterval} className="h-full" />
      </div>
    );
  }

  return (
    <div className={className}>
      <TaskList className="h-full" />
    </div>
  );
}
