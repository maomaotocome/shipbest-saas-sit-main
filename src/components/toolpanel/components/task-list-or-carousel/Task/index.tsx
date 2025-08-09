import { MediaPreviewProvider } from "@/components/common/ai/MediaPreview/MediaPreviewProvider";
import { RecreateTaskProvider } from "@/components/common/ai/RecreateTaskProvider";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Plane } from "lucide-react";
import { useTranslations } from "next-intl";
import { TaskItem } from "./Item";
import { useTaskList } from "./hooks";

interface TaskListProps {
  className?: string;
}

export function TaskList({ className }: TaskListProps) {
  const t = useTranslations("ai.common");
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useTaskList();

  if (status === "pending") {
    return (
      <div
        className={cn(
          "flex h-full flex-col items-center justify-center rounded-xl shadow-md shadow-black/15 dark:shadow-white/20",
          className
        )}
      >
        {t("loading")}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className={cn(
          "flex h-full flex-col items-center justify-center rounded-xl shadow-md shadow-black/15 dark:shadow-white/20",
          className
        )}
      >
        {t("errorLoading")}
      </div>
    );
  }

  return (
    <MediaPreviewProvider>
      <RecreateTaskProvider>
        <div
          className={cn(
            "flex h-full flex-col rounded-xl shadow-md shadow-black/15 dark:shadow-white/20",
            className
          )}
        >
          <div className="flex items-center gap-1.5 p-2">
            <Plane className="text-primary h-4 w-4" />
            <Label htmlFor="num_images" className="block text-left text-sm">
              {t("taskList")}
            </Label>
          </div>

          <ScrollArea
            className="flex-1 overflow-auto px-2"
            onScroll={(e) => {
              const scrollArea = e.target as HTMLDivElement;
              if (scrollArea.scrollTop + scrollArea.clientHeight >= scrollArea.scrollHeight) {
                fetchNextPage();
              }
              e.stopPropagation();
            }}
          >
            {data?.pages.map((page, i) => (
              <div key={i} className="flex flex-col gap-1">
                {page.items.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            ))}
            {hasNextPage && (
              <div className="flex justify-center py-2">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="text-muted-foreground hover:text-primary text-sm"
                >
                  {isFetchingNextPage ? t("loadingMore") : t("loadMore")}
                </button>
              </div>
            )}
          </ScrollArea>
        </div>
      </RecreateTaskProvider>
    </MediaPreviewProvider>
  );
}
