"use client";

import { DataTable } from "@/components/common/data-table";
import Pagination from "@/components/common/pagination";
import { ExploreItemStatus } from "@/db/generated/prisma";
import { useTranslations } from "next-intl";
import { useState } from "react";
import toast from "react-hot-toast";
import { useColumns } from "../columns";
import { useExploreItems, useBatchUpdateExploreItemStatus } from "../use-explore-items";
import { BatchActionsBar } from "./BatchActionsBar";
import { ExploreItemsTableProps } from "./types";

export function ExploreItemsTable({
  statusFilter,
  typeFilter,
  visibilityFilter,
  featuredFilter,
  page,
  setPage,
  pageSize,
}: ExploreItemsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const columns = useColumns();
  const t = useTranslations("admin.explore.items");
  
  const { data: items = [], isLoading } = useExploreItems({
    statusFilter,
    typeFilter,
    visibilityFilter,
    featuredFilter,
    page,
    pageSize,
  });

  const batchUpdate = useBatchUpdateExploreItemStatus();

  const handleBatchAction = (status: ExploreItemStatus, isVisible?: boolean) => {
    if (selectedIds.length === 0) return;
    
    batchUpdate.mutate(
      { ids: selectedIds, status, isVisible },
      {
        onError: (error) => {
          toast.error(error.message || "Failed to batch update");
        },
        onSuccess: () => {
          toast.success(t("batchUpdateSuccess"));
          setSelectedIds([]);
        },
      }
    );
  };

  return (
    <>
      <BatchActionsBar
        selectedIds={selectedIds}
        onBatchAction={handleBatchAction}
        isLoading={batchUpdate.isPending}
      />
      
      <DataTable 
        columns={columns} 
        data={items} 
        loading={isLoading}
        selectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
      
      {items.length >= pageSize && (
        <div className="mt-4 flex justify-center">
          <Pagination 
            totalPages={Math.ceil(items.length / pageSize)} 
            currentPage={page} 
            onPageChange={setPage} 
          />
        </div>
      )}
    </>
  );
}