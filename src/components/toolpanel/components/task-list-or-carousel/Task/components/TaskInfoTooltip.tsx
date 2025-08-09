import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DynamicParameterDisplay } from "@/components/common/ai/DynamicParameterDisplay";
import { ParameterConfig } from "@/conifg/aigc/types";
import { TaskListItem } from "@/types/tasks";
import { Info } from "lucide-react";
import { useTranslations as useIntlTranslations } from "next-intl";

interface TaskInfoTooltipProps {
  task: TaskListItem;
  parameters: ParameterConfig[];
  request: Record<string, unknown>;
  modelMap: Record<string, string>;
}

export function TaskInfoTooltip({ task, parameters, request, modelMap }: TaskInfoTooltipProps) {
  const tTask = useIntlTranslations("task");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="ml-1 inline-flex cursor-pointer align-middle">
          <Info className="h-3.5 w-3.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-w-[400px] min-w-[220px] space-y-1 text-xs break-words">
          <DynamicParameterDisplay
            parameters={parameters}
            request={request}
            modelMap={modelMap}
          />
          <div>
            <b>{tTask("tooltip.status")}:</b>{" "}
            {tTask(`status.${String(task.status).toLowerCase()}`)}
          </div>

          {task.subTasks && task.subTasks.length > 0 && (
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="pr-2 text-left">{tTask("tooltip.subTaskId")}</th>
                  <th className="text-left">{tTask("tooltip.subTaskStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {task.subTasks.map((st) => (
                  <tr key={st.id}>
                    <td className="pr-2">{st.id}</td>
                    <td>{tTask(`status.${String(st.status).toLowerCase()}`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}