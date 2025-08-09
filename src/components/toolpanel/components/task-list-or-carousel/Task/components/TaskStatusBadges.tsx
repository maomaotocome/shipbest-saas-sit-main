import { cn } from "@/lib/utils";
import { TaskListItem } from "@/types/tasks";
import { useTranslations as useIntlTranslations } from "next-intl";

interface TaskStatusBadgesProps {
  task: TaskListItem;
  title: string;
}

export function TaskStatusBadges({ task, title }: TaskStatusBadgesProps) {
  const tTask = useIntlTranslations("task");

  return (
    <div className="flex items-center gap-2">
      <span className="text-foreground text-sm font-medium break-words">{title}</span>
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-xs whitespace-nowrap",
          task.isPublic ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground"
        )}
      >
        {tTask(task.isPublic ? "public" : "private")}
      </span>
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-xs whitespace-nowrap",
          task.status === "COMPLETED"
            ? "bg-primary/10 text-primary"
            : task.status === "FAILED"
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-muted-foreground"
        )}
      >
        {tTask(`status.${String(task.status).toLowerCase()}`)}
      </span>
    </div>
  );
}