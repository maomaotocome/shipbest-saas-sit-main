import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon } from "@radix-ui/react-icons";
import { formatDateI18n } from "@/lib/utils";
import { UseMutationResult } from "@tanstack/react-query";

interface CreateColumnProps {
  t: (key: string) => string;
  locale: string;
  handleViewMediaObjects: (task: Record<string, unknown>) => void;
  addToExplore: UseMutationResult<unknown, Error, {
    taskId: string;
    subTaskId: string;
    index: number;
  }, unknown>;
}

export const createColumns = ({ t, locale, handleViewMediaObjects, addToExplore }: CreateColumnProps) => [
  {
    header: t("table.taskId"),
    accessorKey: "id",
    cell: (task: Record<string, unknown>) => (
      <div className="font-mono text-sm">{String(task.id).slice(0, 8)}...</div>
    ),
  },
  {
    header: t("table.taskType"),
    accessorKey: "taskType",
    cell: (task: Record<string, unknown>) => (
      <Badge variant="outline">{String(task.taskType)}</Badge>
    ),
  },
  {
    header: t("table.subTasks"),
    accessorKey: "subTasks",
    cell: (task: Record<string, unknown>) => (
      <div className="text-sm">
        {(task.subTasks as Array<Record<string, unknown>>).length} {t("table.completed")}
      </div>
    ),
  },
  {
    header: t("table.availableMedia"),
    accessorKey: "media",
    cell: (task: Record<string, unknown>) => {
      const mediaCount = (task.subTasks as Array<Record<string, unknown>>).reduce(
        (count: number, subTask: Record<string, unknown>) => {
          const response = (subTask.response as Record<string, unknown>) || {};
          const imageCount = Array.isArray(response.images) ? response.images.length : 0;
          const videoCount = Array.isArray(response.videos) ? response.videos.length : 0;
          return count + imageCount + videoCount;
        },
        0
      );

      const alreadyInExplore = (task.exploreItems as Array<Record<string, unknown>>).length;

      return (
        <div className="space-y-1">
          <div className="text-sm">
            {mediaCount} {t("table.mediaItems")}
          </div>
          {alreadyInExplore > 0 && (
            <div className="text-muted-foreground text-xs">
              {alreadyInExplore} {t("table.alreadyAdded")}
            </div>
          )}
        </div>
      );
    },
  },
  {
    header: t("table.createdAt"),
    accessorKey: "createdAt",
    cell: (task: Record<string, unknown>) => (
      <div className="text-sm">{formatDateI18n(new Date(String(task.createdAt)), locale)}</div>
    ),
  },
  {
    header: t("table.actions"),
    accessorKey: "actions",
    cell: (task: Record<string, unknown>) => (
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleViewMediaObjects(task)}
          disabled={addToExplore.isPending}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          {t("table.addToExplore")}
        </Button>
      </DialogTrigger>
    ),
  },
];