import { TaskListItem } from "@/types/tasks";
import { TaskRecallButton } from "./TaskRecallButton";

interface TaskActionsProps {
  task: TaskListItem;
  timeAgo: string;
  isEligibleForRecall: (task: TaskListItem) => boolean;
  isModelRecallable: boolean;
  recallTask: (taskId: string) => void;
  isRecalling: (taskId: string) => boolean;
}

export function TaskActions({ 
  task, 
  timeAgo, 
  isEligibleForRecall, 
  isModelRecallable, 
  recallTask, 
  isRecalling 
}: TaskActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <TaskRecallButton
        task={task}
        isEligibleForRecall={isEligibleForRecall}
        isModelRecallable={isModelRecallable}
        recallTask={recallTask}
        isRecalling={isRecalling}
      />
      <span className="text-muted-foreground text-xs">{timeAgo}</span>
    </div>
  );
}