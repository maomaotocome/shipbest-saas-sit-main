"use client";
import { createNewCategory } from "@/actions/admin/blog/categories/categories";
import { updateCategoryAction } from "@/actions/admin/blog/categories/item";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { locales, type Locale } from "@/i18n/locales";
import { translateToAllLocales } from "@/services/blog/translation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  categoryId?: string | null;
}

interface FormData {
  slug: string;
  translations: {
    locale: Locale;
    name: string;
  }[];
}

const SUPPORTED_LANGUAGES = locales;

export default function CategoryModal({ open, onClose, categoryId }: CategoryModalProps) {
  const t = useTranslations("admin.blog.categories");
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, setValue } = useForm<FormData>();
  const [translating, setTranslating] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (categoryId) {
        return updateCategoryAction({
          where: { id: categoryId },
          data: {
            slug: data.slug,
            translations: {
              deleteMany: {},
              create: data.translations,
            },
          },
        });
      } else {
        return createNewCategory({
          data: {
            slug: data.slug,
            translations: {
              create: data.translations,
            },
          },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      onClose();
    },
  });

  const handleTranslate = async (fromLang: Locale) => {
    const sourceName = watch(`translations.${SUPPORTED_LANGUAGES.indexOf(fromLang)}.name`);
    if (!sourceName) return;

    setTranslating(true);
    try {
      const translations = await translateToAllLocales(sourceName, fromLang, SUPPORTED_LANGUAGES);
      translations.forEach(({ locale, text }) => {
        const index = SUPPORTED_LANGUAGES.indexOf(locale);
        setValue(`translations.${index}.name`, text);
      });
    } finally {
      setTranslating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{categoryId ? t("editCategory") : t("createCategory")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="slug">{t("form.slug")}</Label>
              <Input id="slug" {...register("slug", { required: true })} />
            </div>

            {SUPPORTED_LANGUAGES.map((locale, index) => (
              <div key={locale} className="flex items-end gap-4">
                <div className="flex-1">
                  <Label>{t("form.name", { locale: locale.toUpperCase() })}</Label>
                  <Input {...register(`translations.${index}.name`, { required: true })} />
                  <input
                    type="hidden"
                    {...register(`translations.${index}.locale`)}
                    value={locale}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={translating}
                  onClick={() => handleTranslate(locale)}
                >
                  {t("form.translateFrom", { locale: locale.toUpperCase() })}
                </Button>
              </div>
            ))}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {categoryId ? t("update") : t("create")}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
