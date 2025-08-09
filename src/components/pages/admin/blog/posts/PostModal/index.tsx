"use client";
import { useAllCategories } from "@/components/pages/admin/blog/categories/use-categories";
import { useAllTags } from "@/components/pages/admin/blog/tags/use-tags";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { type Locale } from "@/i18n/locales";
import { CategoryWithTranslations, PostWithRelations, TagWithTranslations } from "@/types/blog";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { SUPPORTED_LANGUAGES } from "./constants";
import { PostModalProps } from "./types";
import { usePostForm } from "./use-post-form";
import { usePostTranslation } from "./use-post-translation";

export default function PostModal({ open, onClose, postId }: PostModalProps) {
  const t = useTranslations("admin.blog.posts");
  const locale = useLocale() as Locale;
  const [activeTab, setActiveTab] = useState<Locale>(locale);
  const { data: categories } = useAllCategories();
  const { data: tags } = useAllTags();

  const { register, handleSubmit, watch, setValue, mutation, errors } = usePostForm(
    postId,
    onClose
  );

  const { translating, handleTranslate } = usePostTranslation(watch, setValue);

  const onSubmit = (data: PostWithRelations) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", errors);

    // Validate that at least one translation has content
    const hasValidTranslation = data.translations.some(
      (trans) => trans.title?.trim() && trans.content?.trim()
    );

    if (!hasValidTranslation) {
      toast.error(t("form.atLeastOneTranslation"));
      return;
    }

    if (!data.slug?.trim()) {
      toast.error(t("form.slugEmptyError"));
      return;
    }

    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="flex h-[90vh] max-w-4xl flex-col">
        <DialogHeader>
          <DialogTitle>{postId ? t("editPost") : t("createPost")}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col overflow-hidden p-2"
        >
          <div className="flex-shrink-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="slug">{t("form.slug")}</Label>
                <Input
                  id="slug"
                  {...register("slug", { required: t("form.slugRequired") })}
                  className={errors.slug ? "border-red-500" : ""}
                />
                {errors.slug && <p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>}
              </div>
              <div>
                <Label htmlFor="coverImageUrl">{t("form.coverImage")}</Label>
                <Input id="coverImageUrl" {...register("coverImageUrl")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("form.category")}</Label>
                <Select
                  value={watch("categoryId") ?? undefined}
                  onValueChange={(value) => setValue("categoryId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category: CategoryWithTranslations) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.translations.find((t) => t.locale === locale)?.name ||
                          category.slug}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("form.tags")}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {watch("tags")?.length > 0
                        ? `${watch("tags").length} ${t("form.selectedTags")}`
                        : t("form.selectTags")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[200px]">
                    {tags?.map((tag: TagWithTranslations) => (
                      <DropdownMenuCheckboxItem
                        key={tag.id}
                        checked={watch("tags")?.some(
                          (t: { tag: { id: string } }) => t.tag.id === tag.id
                        )}
                        onCheckedChange={(checked) => {
                          const currentTags = watch("tags") || [];
                          if (checked) {
                            setValue("tags", [...currentTags, { tag, postId: "", tagId: tag.id }]);
                          } else {
                            setValue(
                              "tags",
                              currentTags.filter(
                                (t: { tag: { id: string } }) => t.tag.id !== tag.id
                              )
                            );
                          }
                        }}
                      >
                        {tag.translations.find((t) => t.locale === locale)?.name || tag.slug}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as Locale)}
            className="mt-4 flex flex-1 flex-col"
          >
            <div className="flex flex-shrink-0 items-center justify-between">
              <TabsList>
                {SUPPORTED_LANGUAGES.map((locale) => (
                  <TabsTrigger key={locale} value={locale}>
                    {locale.toUpperCase()}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button
                type="button"
                variant="outline"
                disabled={translating}
                onClick={() => handleTranslate(activeTab)}
              >
                {t("form.translateFrom", { locale: activeTab.toUpperCase() })}
              </Button>
            </div>

            {SUPPORTED_LANGUAGES.map((locale, index) => (
              <TabsContent key={locale} value={locale} className="flex flex-1 flex-col">
                <div className="flex flex-1 flex-col space-y-4">
                  <div className="flex-shrink-0">
                    <Label>{t("form.title")}</Label>
                    <Input
                      {...register(`translations.${index}.title`)}
                      placeholder={t("form.titlePlaceholder")}
                    />
                  </div>
                  <div className="min-h-0 flex-1">
                    <Label>{t("form.content")}</Label>
                    <div className="h-[calc(100%-2rem)]">
                      <Textarea
                        className="h-full resize-none"
                        placeholder={t("form.contentPlaceholder")}
                        {...register(`translations.${index}.content`)}
                      />
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Label>{t("form.metadata")}</Label>
                    <Input {...register(`translations.${index}.metadata`)} />
                  </div>
                  <input
                    type="hidden"
                    {...register(`translations.${index}.locale`)}
                    value={locale}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-4 flex flex-shrink-0 justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              onClick={() => {
                console.log("Submit button clicked", { isPending: mutation.isPending });
              }}
            >
              {mutation.isPending ? t("form.saving") : postId ? t("update") : t("create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
