import { ParameterConfig } from "@/conifg/aigc/types";
import { TaskListItem } from "@/types/tasks";
import { TaskStatusBadges } from "./TaskStatusBadges";
import { TaskInfoTooltip } from "./TaskInfoTooltip";
import { TaskActions } from "./TaskActions";

interface TaskHeaderProps {
  task: TaskListItem;
  title: string;
  timeAgo: string;
  parameters: ParameterConfig[];
  request: Record<string, unknown>;
  modelMap: Record<string, string>;
  isEligibleForRecall: (task: TaskListItem) => boolean;
  isModelRecallable: boolean;
  recallTask: (taskId: string) => void;
  isRecalling: (taskId: string) => boolean;
}

export function TaskHeader({ 
  task, 
  title, 
  timeAgo, 
  parameters, 
  request, 
  modelMap, 
  isEligibleForRecall, 
  isModelRecallable, 
  recallTask, 
  isRecalling 
}: TaskHeaderProps) {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <TaskStatusBadges task={task} title={title} />
        <TaskInfoTooltip
          task={task}
          parameters={parameters}
          request={request}
          modelMap={modelMap}
        />
      </div>
      <TaskActions
        task={task}
        timeAgo={timeAgo}
        isEligibleForRecall={isEligibleForRecall}
        isModelRecallable={isModelRecallable}
        recallTask={recallTask}
        isRecalling={isRecalling}
      />
    </div>
  );
}