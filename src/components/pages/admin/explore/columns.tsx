import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExploreItem, ExploreItemStatus } from "@/db/generated/prisma";
import {
  CheckIcon,
  Cross2Icon,
  DotsHorizontalIcon,
  EyeClosedIcon,
  EyeOpenIcon,
  StarFilledIcon,
  StarIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { formatDateI18n } from "@/lib/utils";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  useDeleteExploreItem,
  useUpdateExploreItemFeatured,
  useUpdateExploreItemStatus,
} from "./use-explore-items";

// Status badge component
function StatusBadge({ status }: { status: ExploreItemStatus }) {
  const t = useTranslations("admin.explore.items");
  
  const statusConfig = {
    [ExploreItemStatus.PENDING]: { color: "bg-yellow-100 text-yellow-800", text: t("status.pending") },
    [ExploreItemStatus.APPROVED]: { color: "bg-green-100 text-green-800", text: t("status.approved") },
    [ExploreItemStatus.REJECTED]: { color: "bg-red-100 text-red-800", text: t("status.rejected") },
    [ExploreItemStatus.HIDDEN]: { color: "bg-gray-100 text-gray-800", text: t("status.hidden") },
  };
  
  const config = statusConfig[status];
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
}

// Preview cell component
function PreviewCell({ item }: { item: ExploreItem }) {
  return (
    <div className="relative h-16 w-16 overflow-hidden rounded">
      {item.type === "image" ? (
        <Image
          src={item.publicUrl}
          alt="Preview"
          fill
          className="object-cover"
        />
      ) : (
        <video
          src={item.publicUrl}
          className="h-full w-full object-cover"
          muted
          loop
        />
      )}
    </div>
  );
}

// Info cell component
function InfoCell({ item }: { item: ExploreItem }) {
  return (
    <div className="space-y-1">
      <div className="text-sm font-medium">{item.type.toUpperCase()}</div>
      <div className="text-xs text-muted-foreground">
        {item.width} × {item.height}
      </div>
      <div className="text-xs text-muted-foreground">
        Task: {item.taskId.slice(0, 8)}...
      </div>
    </div>
  );
}

// Visibility toggle cell component
function VisibilityCell({ item }: { item: ExploreItem }) {
  const updateStatus = useUpdateExploreItemStatus();
  
  const handleToggle = () => {
    updateStatus.mutate(
      { id: item.id, status: item.status, isVisible: !item.isVisible },
      {
        onError: (error) => {
          toast.error(error.message || "Failed to update visibility");
        },
      }
    );
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={updateStatus.isPending}
    >
      {item.isVisible ? (
        <EyeOpenIcon className="h-4 w-4" />
      ) : (
        <EyeClosedIcon className="h-4 w-4" />
      )}
    </Button>
  );
}

// Featured toggle cell component
function FeaturedCell({ item }: { item: ExploreItem }) {
  const updateFeatured = useUpdateExploreItemFeatured();
  
  const handleToggle = () => {
    updateFeatured.mutate(
      { id: item.id, featured: !item.featured },
      {
        onError: (error) => {
          toast.error(error.message || "Failed to update featured status");
        },
      }
    );
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={updateFeatured.isPending}
    >
      {item.featured ? (
        <StarFilledIcon className="h-4 w-4 text-yellow-500" />
      ) : (
        <StarIcon className="h-4 w-4" />
      )}
    </Button>
  );
}

// Actions cell component
function ActionsCell({ item }: { item: ExploreItem }) {
  const t = useTranslations("admin.explore.items");
  const updateStatus = useUpdateExploreItemStatus();
  const deleteItem = useDeleteExploreItem();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleStatusChange = (status: ExploreItemStatus, isVisible?: boolean) => {
    updateStatus.mutate(
      { id: item.id, status, isVisible },
      {
        onError: (error) => {
          toast.error(error.message || "Failed to update status");
        },
        onSuccess: () => {
          toast.success(t("actions.updateSuccess"));
        },
      }
    );
  };

  const handleDelete = () => {
    deleteItem.mutate(item.id, {
      onError: (error) => {
        toast.error(error.message || "Failed to delete item");
      },
      onSuccess: () => {
        toast.success(t("actions.deleteSuccess"));
      },
    });
    setShowDeleteDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={updateStatus.isPending || deleteItem.isPending}>
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => handleStatusChange(ExploreItemStatus.APPROVED, true)}
          >
            <CheckIcon className="mr-2 h-4 w-4" />
            {t("actions.approve")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusChange(ExploreItemStatus.REJECTED, false)}
          >
            <Cross2Icon className="mr-2 h-4 w-4" />
            {t("actions.reject")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusChange(ExploreItemStatus.HIDDEN, false)}
          >
            <EyeClosedIcon className="mr-2 h-4 w-4" />
            {t("actions.hide")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive"
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            {t("actions.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteDialog.description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {t("deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const useColumns = () => {
  const t = useTranslations("admin.explore.items");
  const locale = useLocale();
  
  return [
    {
      header: t("table.preview"),
      accessorKey: "preview",
      cell: (item: ExploreItem) => <PreviewCell item={item} />,
    },
    {
      header: t("table.info"),
      accessorKey: "info",
      cell: (item: ExploreItem) => <InfoCell item={item} />,
    },
    {
      header: t("table.status"),
      accessorKey: "status",
      cell: (item: ExploreItem) => <StatusBadge status={item.status} />,
    },
    {
      header: t("table.visibility"),
      accessorKey: "isVisible",
      cell: (item: ExploreItem) => <VisibilityCell item={item} />,
    },
    {
      header: t("table.featured"),
      accessorKey: "featured",
      cell: (item: ExploreItem) => <FeaturedCell item={item} />,
    },
    {
      header: t("table.createdAt"),
      accessorKey: "createdAt",
      cell: (item: ExploreItem) => (
        <div className="text-sm">
          {formatDateI18n(new Date(item.createdAt), locale)}
        </div>
      ),
    },
    {
      header: t("table.actions"),
      accessorKey: "actions",
      cell: (item: ExploreItem) => <ActionsCell item={item} />,
    },
  ];
};