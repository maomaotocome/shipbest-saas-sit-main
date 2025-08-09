"use client";
import { DataTable } from "@/components/common/data-table";
import Pagination from "@/components/common/pagination";
import { useCategories } from "@/components/pages/admin/blog/categories/use-categories";
import { usePosts } from "@/components/pages/admin/blog/posts/use-posts";
import { useTags } from "@/components/pages/admin/blog/tags/use-tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Locale } from "@/i18n/locales";
import { MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useColumns } from "./columns";
import PostModal from "./PostModal";

export default function PostsPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [titleInput, setTitleInput] = useState("");
  const [authorInput, setAuthorInput] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [searchAuthor, setSearchAuthor] = useState("");
  const pageSize = 10;

  const { data: posts, isLoading: postsLoading } = usePosts({
    page,
    pageSize,
    searchTitle,
    searchAuthor,
  });
  const { data: categories } = useCategories();
  const { data: tags } = useTags();
  const locale = useLocale();
  const t = useTranslations("admin.blog.posts");
  const columns = useColumns(locale as Locale, categories?.items || [], tags?.items || []);

  const isLoading = postsLoading || !categories || !tags;

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
    setSearchTitle(titleInput);
    setSearchAuthor(authorInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <Button onClick={() => setOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            {t("addPost")}
          </Button>
        </div>

        <div className="border-border bg-card mb-6 rounded-lg border p-4">
          <div className="mb-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title-search">{t("form.title")}:</Label>
              <Input
                id="title-search"
                placeholder={t("searchTitlePlaceholder")}
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author-search">{t("form.author")}:</Label>
              <Input
                id="author-search"
                placeholder={t("searchAuthorPlaceholder")}
                value={authorInput}
                onChange={(e) => setAuthorInput(e.target.value)}
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

        <div className="flex-1 overflow-auto">
          <DataTable
            columns={columns}
            data={posts?.items || []}
            loading={isLoading}
            onEdit={handleEdit}
          />
          {posts?.totalPages && posts.totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={posts.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      <PostModal open={open} onClose={handleClose} postId={editingId} />
    </>
  );
}
