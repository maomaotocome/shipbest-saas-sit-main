import { SubTask } from "@/db/generated/prisma";
import { Locale } from "@/i18n/locales";
import { TaskListItem } from "@/types/tasks";
import { useTranslations } from "next-intl";

interface MediaPreviewHeaderProps {
  task: TaskListItem;
  subTask: SubTask;
  locale: Locale;
}

export function MediaPreviewHeader({ task, subTask, locale }: MediaPreviewHeaderProps) {
  const tTask = useTranslations("task");

  return (
    <div>
      <h3 className="text-foreground mb-2 font-medium">{tTask("preview.taskInformation")}</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-muted-foreground">{tTask("preview.labels.id")}</div>
          <div className="font-mono">{String(subTask.id)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">{tTask("preview.labels.type")}</div>
          <div>{tTask(`taskType.${task.taskType}`)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">{tTask("preview.labels.status")}</div>
          <div>
            <span
              className={`rounded px-2 py-1 text-xs ${
                subTask.status === "COMPLETED"
                  ? "bg-green-100 text-green-800"
                  : subTask.status === "FAILED"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {tTask(`status.${String(subTask.status).toLowerCase()}`)}
            </span>
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">{tTask("preview.labels.created")}</div>
          <div className="text-xs">
            {new Date(subTask.createdAt ?? task.createdAt).toLocaleDateString(locale)}
          </div>
        </div>
      </div>
    </div>
  );
}