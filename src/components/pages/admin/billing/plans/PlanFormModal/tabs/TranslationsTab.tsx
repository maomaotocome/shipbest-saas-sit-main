import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Prisma } from "@/db/generated/prisma";
import { type Locale, locales } from "@/i18n/locales";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toArray } from "./utils";

interface TranslationsTabProps {
  formData: Prisma.PlanUpdateInput;
  setFormData: React.Dispatch<React.SetStateAction<Prisma.PlanUpdateInput>>;
  locale: Locale;
}

export default function TranslationsTab({ formData, setFormData, locale }: TranslationsTabProps) {
  const t = useTranslations("admin.billing.plans.translationsTab");
  const [selectedLocale, setSelectedLocale] = useState<Locale>(locale);

  const getAllTranslations = () => {
    const updateTranslations = toArray(formData.translations?.update).map((t) => t.data);
    const createTranslations = toArray(formData.translations?.create);
    return [
      ...updateTranslations,
      ...createTranslations,
    ] as Prisma.PlanTranslationCreateWithoutPlanInput[];
  };

  const addTranslation = () => {
    const newTranslation: Prisma.PlanTranslationCreateWithoutPlanInput = {
      locale: selectedLocale,
      nickname: "",
      description: "",
      subtitle: "",
    };

    setFormData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        create: [newTranslation, ...toArray(prev.translations?.create)],
      },
    }));
  };

  const removeTranslation = (locale: Locale) => {
    setFormData((prev) => {
      const allTranslations = getAllTranslations();
      const translationToRemove = allTranslations.find((t) => t.locale === locale);

      if (!translationToRemove) {
        return prev;
      }

      // Check if the translation is in the create array
      const createTranslations = toArray(prev.translations?.create);
      const createIndex = createTranslations.findIndex((t) => t.locale === locale);

      if (createIndex !== -1) {
        // If it's a new translation, remove it from create array
        return {
          ...prev,
          translations: {
            ...prev.translations,
            create: createTranslations.filter((_, i) => i !== createIndex),
          },
        };
      } else {
        // If it's an existing translation, add it to delete array and remove it from update array
        return {
          ...prev,
          translations: {
            ...prev.translations,
            delete: [
              ...toArray(prev.translations?.delete),
              { planId_locale: { planId: prev.id as string, locale } },
            ],
            update: [
              ...toArray(prev.translations?.update).filter(
                (t) => t.where?.planId_locale?.locale !== locale
              ),
            ],
          },
        };
      }
    });
  };

  const updateTranslation = (locale: Locale, field: string, value: string) => {
    setFormData((prev) => {
      if (!prev.translations) {
        return prev;
      }
      const allTranslations = getAllTranslations();
      const translationToUpdate = allTranslations.find((t) => t.locale === locale);

      if (!translationToUpdate) {
        return prev;
      }

      // Check if the translation is in the create array
      const createTranslations = toArray(prev.translations?.create);
      const createIndex = createTranslations.findIndex(
        (t) => t.locale === translationToUpdate.locale
      );

      if (createIndex !== -1) {
        // Update in create array
        const updatedCreate = [...createTranslations];
        updatedCreate[createIndex] = { ...updatedCreate[createIndex], [field]: value };

        return {
          ...prev,
          translations: {
            ...prev.translations,
            create: updatedCreate,
          },
        };
      } else {
        // Update in update array
        const updateTranslations = toArray(prev.translations?.update);
        const updateIndex = updateTranslations.findIndex(
          (t) => t.where?.planId_locale?.locale === translationToUpdate.locale
        );

        if (updateIndex !== -1) {
          const updatedUpdate = [...updateTranslations];
          updatedUpdate[updateIndex] = {
            ...updatedUpdate[updateIndex],
            data: {
              ...updatedUpdate[updateIndex].data,
              [field]: value,
            },
          };

          return {
            ...prev,
            translations: {
              ...prev.translations,
              update: updatedUpdate,
            },
          };
        } else {
          // Add to update array
          return {
            ...prev,
            translations: {
              ...prev.translations,
              update: [
                ...updateTranslations,
                {
                  where: {
                    planId_locale: {
                      planId: prev.id as string,
                      locale: translationToUpdate.locale,
                    },
                  },
                  data: { [field]: value },
                },
              ],
            },
          };
        }
      }
    });
  };

  // Filter available locales
  const availableLocales = locales.filter((l) => {
    // Check if the locale exists in translations
    const translations = getAllTranslations();
    return !translations.some((t) => t && t.locale === l);
  });

  return (
    <div className="space-y-4">
      <div className="mb-6 flex items-end gap-4">
        <div className="flex-1">
          <Select
            value={selectedLocale}
            onValueChange={(value) => setSelectedLocale(value as Locale)}
            disabled={availableLocales.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectLanguage")} />
            </SelectTrigger>
            <SelectContent>
              {availableLocales.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={addTranslation} disabled={availableLocales.length === 0}>
          <PlusIcon className="mr-2 h-4 w-4" />
          {t("addTranslation")}
        </Button>
      </div>

      {!getAllTranslations().length ? (
        <div className="p-4 text-center">{t("noTranslations")}</div>
      ) : (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">{t("language")}</TableHead>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("subtitle")}</TableHead>
                <TableHead>{t("description")}</TableHead>
                <TableHead className="w-[80px]">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getAllTranslations().map((translation, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{translation.locale}</TableCell>
                  <TableCell>
                    <Input
                      value={translation.nickname || ""}
                      onChange={(e) =>
                        updateTranslation(translation.locale as Locale, "nickname", e.target.value)
                      }
                      placeholder={t("planName")}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={translation.subtitle || ""}
                      onChange={(e) =>
                        updateTranslation(translation.locale as Locale, "subtitle", e.target.value)
                      }
                      placeholder={t("planSubtitle")}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={translation.description || ""}
                      onChange={(e) =>
                        updateTranslation(
                          translation.locale as Locale,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder={t("planDescription")}
                      rows={2}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTranslation(translation.locale as Locale)}
                      disabled={getAllTranslations().length <= 1}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
