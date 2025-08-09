"use client";

import { createExploreItemAction } from "@/actions/admin/explore";
import { getPublicTasksForExploreAction } from "@/actions/admin/explore";
import { DataTable } from "@/components/common/data-table";
import Pagination from "@/components/common/pagination";
import { Dialog } from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import toast from "react-hot-toast";
import { PublicTasksTableProps, MediaItem } from "./types";
import { MediaDialog } from "./MediaDialog";
import { createColumns } from "./columns";
import { extractMediaItems } from "./utils";

export function PublicTasksTable({
  taskTypeFilter,
  searchFilter,
  page,
  setPage,
  pageSize,
}: PublicTasksTableProps) {
  const t = useTranslations("admin.explore.tasks");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["public-tasks", taskTypeFilter, searchFilter, page, pageSize],
    queryFn: () =>
      getPublicTasksForExploreAction({
        taskType: taskTypeFilter,
        search: searchFilter,
        page,
        pageSize,
      }),
  });

  const tasks = data?.tasks || [];
  const total = data?.total || 0;
  
  console.log("PublicTasksTable debug:", { data, tasks: tasks.length, total, pageSize });

  const addToExplore = useMutation({
    mutationFn: ({
      taskId,
      subTaskId,
      index,
    }: {
      taskId: string;
      subTaskId: string;
      index: number;
    }) => createExploreItemAction(taskId, subTaskId, index),
    onSuccess: () => {
      toast.success(t("addSuccess"));
      queryClient.invalidateQueries({ queryKey: ["public-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["explore-items"] });
      setSelectedTaskId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add to explore");
    },
  });

  const handleViewMediaObjects = async (task: Record<string, unknown>) => {
    const taskMediaItems = extractMediaItems(task);

    if (taskMediaItems.length === 0) {
      toast.error(t("noMediaFound"));
      return;
    }

    setMediaItems(taskMediaItems);
    setSelectedTaskId(String(task.id));
  };

  const columns = createColumns({
    t,
    locale,
    handleViewMediaObjects,
    addToExplore,
  });

  return (
    <>
      <Dialog>
        <DataTable columns={columns} data={tasks as Array<{ id: string }>} loading={isLoading} />
        <MediaDialog
          isOpen={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          mediaItems={mediaItems}
          addToExplore={addToExplore}
        />
      </Dialog>
      {(total > pageSize || tasks.length > 0) && (
        <div className="mt-4 flex justify-center">
          <Pagination
            totalPages={Math.ceil(total / pageSize)}
            currentPage={page}
            onPageChange={setPage}
          />
        </div>
      )}
    </>
  );
}