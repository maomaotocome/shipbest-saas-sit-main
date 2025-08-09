import { type Locale } from "@/i18n/locales";
import { translateToAllLocales } from "@/services/blog/translation";
import { PostWithRelations } from "@/types/blog";
import { useState } from "react";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { SUPPORTED_LANGUAGES } from "./constants";

export function usePostTranslation(
  watch: UseFormWatch<PostWithRelations>,
  setValue: UseFormSetValue<PostWithRelations>
) {
  const [translating, setTranslating] = useState(false);

  const handleTranslate = async (fromLang: Locale) => {
    const index = SUPPORTED_LANGUAGES.indexOf(fromLang);
    const sourceTitle = watch(`translations.${index}.title`);
    const sourceContent = watch(`translations.${index}.content`);
    if (!sourceTitle || !sourceContent) return;

    setTranslating(true);
    try {
      const [titleTranslations, contentTranslations] = await Promise.all([
        translateToAllLocales(sourceTitle, fromLang, SUPPORTED_LANGUAGES),
        translateToAllLocales(sourceContent, fromLang, SUPPORTED_LANGUAGES),
      ]);

      titleTranslations.forEach(({ locale, text }) => {
        const idx = SUPPORTED_LANGUAGES.indexOf(locale);
        setValue(`translations.${idx}.title`, text);
      });

      contentTranslations.forEach(({ locale, text }) => {
        const idx = SUPPORTED_LANGUAGES.indexOf(locale);
        setValue(`translations.${idx}.content`, text);
      });
    } finally {
      setTranslating(false);
    }
  };

  return {
    translating,
    handleTranslate,
  };
}
