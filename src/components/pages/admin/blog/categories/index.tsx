"use client";
import { DataTable } from "@/components/common/data-table";
import Pagination from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Locale } from "@/i18n/locales";
import { MagnifyingGlassIcon, Pencil1Icon, PlusIcon } from "@radix-ui/react-icons";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import CategoryModal from "./CategoryModal";
import { useColumns } from "./columns";
import { useCategories } from "./use-categories";

export default function Categories() {
  const t = useTranslations("admin.blog.categories");
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [slugSearch, setSlugSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [searchParams, setSearchParams] = useState<{ slug?: string; name?: string }>({});
  const pageSize = 20;

  const { data: categories, isLoading } = useCategories({
    page,
    pageSize,
    search: searchParams,
  });

  const columns = useColumns(locale);

  const handleEdit = (id: string) => {
    setEditingId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setEditingId(null);
    setOpen(false);
  };

  const handleSearch = () => {
    setSearchParams({
      slug: slugSearch || undefined,
      name: nameSearch || undefined,
    });
    setPage(1); // Reset page number to first page
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
          {t("createCategory")}
        </Button>
      </div>

      <div className="border-border bg-card mb-6 rounded-lg border p-4">
        <div className="mb-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="slug-search">{t("form.slug")}:</Label>
            <Input
              id="slug-search"
              placeholder={t("searchSlugPlaceholder")}
              value={slugSearch}
              onChange={(e) => setSlugSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name-search">{t("form.name", { locale: locale.toUpperCase() })}:</Label>
            <Input
              id="name-search"
              placeholder={t("searchNamePlaceholder")}
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSearch} className="w-full sm:w-auto">
            <MagnifyingGlassIcon className="mr-2 h-4 w-4" />
            {t("search")}
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={categories?.items || []}
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
          totalPages={categories?.totalPages || 1}
          currentPage={page}
          onPageChange={setPage}
        />
      </div>

      <CategoryModal open={open} onClose={handleClose} categoryId={editingId} />
    </>
  );
}
