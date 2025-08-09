import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { TaskListItem } from "@/types/tasks";
import { RefreshCw } from "lucide-react";
import { useTranslations as useIntlTranslations } from "next-intl";

interface TaskRecallButtonProps {
  task: TaskListItem;
  isEligibleForRecall: (task: TaskListItem) => boolean;
  isModelRecallable: boolean;
  recallTask: (taskId: string) => void;
  isRecalling: (taskId: string) => boolean;
}

export function TaskRecallButton({ 
  task, 
  isEligibleForRecall, 
  isModelRecallable, 
  recallTask, 
  isRecalling 
}: TaskRecallButtonProps) {
  const tTask = useIntlTranslations("task");

  if (!isEligibleForRecall(task) || !isModelRecallable) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => recallTask(task.id)}
          disabled={isRecalling(task.id)}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={cn("h-3 w-3", isRecalling(task.id) && "animate-spin")} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tTask("recall.tooltip")}</p>
      </TooltipContent>
    </Tooltip>
  );
}