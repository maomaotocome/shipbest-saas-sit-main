"use client";

import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { useState } from "react";
import BucketModal from "./BucketModal";
import { useColumns } from "./columns";
import { useBuckets } from "./hooks";

export default function OssAdminPage() {
  const t = useTranslations("admin.oss.buckets");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data: buckets, isLoading } = useBuckets();
  const columns = useColumns();

  const handleEdit = (id: string) => {
    setEditingId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setEditingId(null);
    setOpen(false);
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button onClick={() => setOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          {t("addBucket")}
        </Button>
      </div>

      <DataTable columns={columns} data={buckets || []} loading={isLoading} onEdit={handleEdit} />

      <BucketModal open={open} onClose={handleClose} bucketId={editingId} />
    </>
  );
}
