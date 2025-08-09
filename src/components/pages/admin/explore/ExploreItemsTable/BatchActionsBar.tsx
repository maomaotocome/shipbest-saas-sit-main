"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExploreItemStatus } from "@/db/generated/prisma";
import {
  CheckIcon,
  Cross2Icon,
  EyeClosedIcon,
} from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";

interface BatchActionsBarProps {
  selectedIds: string[];
  onBatchAction: (status: ExploreItemStatus, isVisible?: boolean) => void;
  isLoading?: boolean;
}

export function BatchActionsBar({
  selectedIds,
  onBatchAction,
  isLoading = false,
}: BatchActionsBarProps) {
  const t = useTranslations("admin.explore.items");

  if (selectedIds.length === 0) return null;

  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {t("selectedCount", { count: selectedIds.length })}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            {t("batchActions")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onBatchAction(ExploreItemStatus.APPROVED, true)}>
            <CheckIcon className="mr-2 h-4 w-4" />
            {t("batchApprove")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onBatchAction(ExploreItemStatus.REJECTED, false)}>
            <Cross2Icon className="mr-2 h-4 w-4" />
            {t("batchReject")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onBatchAction(ExploreItemStatus.HIDDEN, false)}>
            <EyeClosedIcon className="mr-2 h-4 w-4" />
            {t("batchHide")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}