"use client";
import { updateTagAction } from "@/actions/admin/blog/tags/item";
import { createNewTagAction } from "@/actions/admin/blog/tags/tags";
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

interface TagModalProps {
  open: boolean;
  onClose: () => void;
  tagId?: string | null;
}

interface FormData {
  slug: string;
  translations: {
    locale: Locale;
    name: string;
  }[];
}

const SUPPORTED_LANGUAGES = locales;

export default function TagModal({ open, onClose, tagId }: TagModalProps) {
  const t = useTranslations("admin.blog.tags");
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, setValue } = useForm<FormData>();
  const [translating, setTranslating] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (tagId) {
        return updateTagAction({
          where: { id: tagId },
          data: {
            slug: data.slug,
            translations: {
              deleteMany: {},
              create: data.translations,
            },
          },
        });
      } else {
        return createNewTagAction({
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
      queryClient.invalidateQueries({ queryKey: ["blog-tags"] });
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
          <DialogTitle>{tagId ? t("editTag") : t("createTag")}</DialogTitle>
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
                {tagId ? t("update") : t("create")}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
