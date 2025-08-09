"use client";
import { DataTable } from "@/components/common/data-table";
import Pagination from "@/components/common/pagination";
import { useTags } from "@/components/pages/admin/blog/tags/use-tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Locale } from "@/i18n/locales";
import { MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useColumns } from "./columns";
import TagModal from "./TagModal";

export default function TagsPage() {
  const t = useTranslations("admin.blog");
  const locale = useLocale() as Locale;
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [slugInput, setSlugInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [searchSlug, setSearchSlug] = useState("");
  const [searchName, setSearchName] = useState("");
  const pageSize = 10;

  const { data, isLoading } = useTags({
    page,
    pageSize,
    searchSlug,
    searchName,
  });

  const columns = useColumns(locale);

  // Only render after component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEdit = (id: string) => {
    setEditingId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setEditingId(null);
    setOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = () => {
    setSearchSlug(slugInput);
    setSearchName(nameInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("tags.title")}</h1>
          <Button onClick={() => setOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            {t("tags.addTag")}
          </Button>
        </div>

        <div className="border-border bg-card mb-6 rounded-lg border p-4">
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug-search">{t("tags.form.slug")}:</Label>
              <Input
                id="slug-search"
                placeholder={t("tags.searchSlugPlaceholder")}
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name-search">{t("tags.form.name").replace("{locale}", "")}:</Label>
              <Input
                id="name-search"
                placeholder={t("tags.searchNamePlaceholder")}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSearch} className="px-4">
              <MagnifyingGlassIcon className="mr-2 h-4 w-4" />
              {t("tags.search")}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <DataTable
            columns={columns}
            data={data?.items || []}
            loading={isLoading}
            onEdit={handleEdit}
          />
          {data && data.totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={data.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
      <TagModal open={open} onClose={handleClose} tagId={editingId} />
    </>
  );
}
