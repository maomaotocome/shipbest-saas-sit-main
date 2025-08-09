import { DynamicParameterDisplay, useTaskParameterConfig } from "@/components/common/ai/DynamicParameterDisplay";
import {
  compactContainerRenderer,
  defaultParameterRenderer,
} from "@/components/common/ai/ParameterRenderers";
import { SubTask } from "@/db/generated/prisma";
import { Locale } from "@/i18n/locales";
import { TaskType } from "@/lib/constants";
import { formatDateTimeI18n } from "@/lib/utils";
import { JsonObject } from "@/types/json";
import { TaskListItem } from "@/types/tasks";
import { useTranslations as useIntlTranslations, useLocale, useTranslations } from "next-intl";

interface SubtaskTooltipContentProps {
  task: TaskListItem;
  subTask: SubTask;
  request: Record<string, unknown>;
  children?: React.ReactNode;
}

export function SubtaskTooltipContent({
  task,
  subTask,
  request,
  children,
}: SubtaskTooltipContentProps) {
  const t = useTranslations("ai.common.tooltip");
  const tTask = useIntlTranslations("task");
  const locale = useLocale() as Locale;

  const { parameters, modelMap } = useTaskParameterConfig({
    taskType: task.taskType as TaskType,
    metadata: (task.metadata as JsonObject) || {},
    locale,
  });

  return (
    <div className="max-w-[320px] min-w-[220px] space-y-1 text-xs break-words">
      <div>
        <b>{t("id")}:</b> {String(subTask.id)}
      </div>
      <div>
        <b>{t("type")}:</b> {tTask(`taskType.${task.taskType}`)}
      </div>
      <div>
        <b>{t("status")}:</b> {tTask(`status.${String(subTask.status).toLowerCase()}`)}
      </div>
      <div>
        <b>{t("createdAt")}:</b>{" "}
        {formatDateTimeI18n(new Date(subTask.createdAt ?? task.createdAt), locale)}
      </div>
      <div>
        <b>{t("updatedAt")}:</b>{" "}
        {formatDateTimeI18n(new Date(subTask.updatedAt ?? task.updatedAt), locale)}
      </div>

      <DynamicParameterDisplay
        parameters={parameters}
        request={request}
        modelMap={modelMap}
        customRenderer={defaultParameterRenderer}
        containerRenderer={compactContainerRenderer}
      />

      {children}
    </div>
  );
}
