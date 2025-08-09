import { getStaticDataAction } from "@/actions/staticData/get";
import { createAndRunTaskAction } from "@/actions/tasks/create";
import { listTasks } from "@/actions/tasks/list";
import { recallTaskAction } from "@/actions/tasks/recall";
import { checkTaskStatus } from "@/actions/tasks/status";
import { TaskStatus } from "@/db/generated/prisma";
import { TaskListItem } from "@/types/tasks";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

// Shared timeout constant for polling and recall eligibility
const TASK_TIMEOUT_THRESHOLD = 3 * 60 * 1000; // 3 minutes


interface UseTaskListOptions {
  enabled?: boolean;
}

export function useTaskList(options: UseTaskListOptions = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();
  const pollingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const dataRef = useRef<typeof data>(undefined);
  const pollStatusRef = useRef<((taskIds: string[]) => void) | undefined>(undefined);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["tasks"],
    queryFn: ({ pageParam }) => listTasks({ cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled,
  });

  const { mutate: pollStatus } = useMutation({
    mutationFn: checkTaskStatus,
    onSuccess: (updatedTasks) => {
      queryClient.setQueryData<{ pages: { items: TaskListItem[] }[] }>(["tasks"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            items: page.items.map((task) => {
              const updatedTask = updatedTasks.find((t) => t.id === task.id);
              return updatedTask ? { ...task, ...updatedTask } : task;
            }),
          })),
        };
      });
    },
  });

  // update refs
  useEffect(() => {
    dataRef.current = data;
    pollStatusRef.current = pollStatus;
  }, [data, pollStatus]);

  useEffect(() => {
    const checkPendingTasks = () => {
      const currentData = dataRef.current;
      const currentPollStatus = pollStatusRef.current;

      if (!currentData || !currentPollStatus) return;

      const tasks = currentData.pages.flatMap((page) => page.items) ?? [];
      const pendingTasks = tasks.filter(
        (task) =>
          task.status !== TaskStatus.COMPLETED &&
          new Date().getTime() - new Date(task.createdAt).getTime() < TASK_TIMEOUT_THRESHOLD
      );

      if (pendingTasks.length > 0) {
        currentPollStatus(pendingTasks.map((task) => task.id));
      }
    };

    // check pending tasks immediately
    checkPendingTasks();

    // set timer, check every 10 seconds
    pollingTimeoutRef.current = setInterval(checkPendingTasks, 10000);

    return () => {
      if (pollingTimeoutRef.current) {
        clearInterval(pollingTimeoutRef.current);
      }
    };
  }, []); // empty dependency array, only start polling when component mounts

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  };
}

export function useTaskType() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["taskTypes"],
    queryFn: () => getStaticDataAction({ key: "tasks", type: "aigc" }),
  });
  return {
    data,
    isLoading,
    error,
  };
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  const { mutate: createTask, isPending } = useMutation({
    mutationFn: createAndRunTaskAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return {
    createTask,
    isPending,
  };
}

export function useTaskRecall() {
  const [recallingTasks, setRecallingTasks] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { mutate: recallTask } = useMutation({
    mutationFn: recallTaskAction,
    onSuccess: (result) => {
      if (result.success) {
        console.log("Task recalled successfully:", result);
        // Refresh task list after successful recall
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } else {
        console.error("Failed to recall task:", result.error);
      }
    },
    onError: (error) => {
      console.error("Error recalling task:", error);
    },
  });

  const handleRecallTask = (taskId: string) => {
    setRecallingTasks((prev) => new Set([...prev, taskId]));

    recallTask(taskId, {
      onSettled: () => {
        setRecallingTasks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
      },
    });
  };

  const isRecalling = (taskId: string) => recallingTasks.has(taskId);

  // Check if task is eligible for recall (timed out and not successful)
  // Note: Model recallable check is handled at the component level
  const isEligibleForRecall = (task: TaskListItem) => {
    if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.FAILED) return false;

    // Check if exceeded expected polling time
    const createdTime = new Date(task.createdAt).getTime();
    const currentTime = new Date().getTime();
    const timeElapsed = currentTime - createdTime;

    return timeElapsed > TASK_TIMEOUT_THRESHOLD;
  };

  return {
    recallTask: handleRecallTask,
    isRecalling,
    isEligibleForRecall,
    recallingTasks,
  };
}
