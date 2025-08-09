"use client";

import { DataTable } from "@/components/common/data-table";
import Pagination from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MagnifyingGlassIcon, Pencil1Icon, PlusIcon } from "@radix-ui/react-icons";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import NotificationModal from "./NotificationModal";
import { useColumns } from "./columns";
import { useNotifications } from "./hooks";

export default function Notifications() {
  const locale = useLocale();
  const t = useTranslations("admin.notifications");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [titleInput, setTitleInput] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const pageSize = 10;

  const { data: notifications, isLoading } = useNotifications({
    page,
    pageSize,
    searchTitle,
  });

  const handleEdit = (id: string) => {
    setEditingId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setEditingId(null);
    setOpen(false);
  };

  const handleSearch = () => {
    setSearchTitle(titleInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button onClick={() => setOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          {t("create")}
        </Button>
      </div>

      <div className="border-border bg-card mb-6 rounded-lg border p-4">
        <div className="mb-4">
          <div className="space-y-2">
            <Label htmlFor="title-search">{t("columns.title")}</Label>
            <div className="flex">
              <Input
                id="title-search"
                placeholder={t("searchTitlePlaceholder")}
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full sm:w-3/4"
              />
              <Button onClick={handleSearch} className="ml-2">
                <MagnifyingGlassIcon className="mr-2 h-4 w-4" />
                {t("search")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={useColumns(t, locale)}
        data={notifications?.items || []}
        loading={isLoading}
        customActions={(row) => (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(row.id)}>
              <Pencil1Icon className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      <div className="mt-4">
        <Pagination
          totalPages={notifications?.totalPages || 1}
          currentPage={page}
          onPageChange={setPage}
        />
      </div>

      <NotificationModal
        open={open}
        onClose={handleClose}
        notification={editingId ? notifications?.items.find((n) => n.id === editingId) : undefined}
      />
    </>
  );
}
