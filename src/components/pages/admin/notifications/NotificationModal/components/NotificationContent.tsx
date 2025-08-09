import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Locale, locales } from "@/i18n/locales";
import { useTranslations } from "next-intl";
import { Translation } from "../types";

interface NotificationContentProps {
  translations: Translation[];
  activeLocale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onTranslationChange: (locale: string, field: "title" | "content", value: string) => void;
}

export function NotificationContent({
  translations,
  activeLocale,
  onLocaleChange,
  onTranslationChange,
}: NotificationContentProps) {
  const t = useTranslations("admin.notifications.modal");

  const getTranslation = (locale: string) => {
    return (
      translations.find((t) => t.locale === locale) || {
        locale,
        title: "",
        content: "",
      }
    );
  };

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-4">
          <h3 className="text-base font-semibold">{t("notificationContent")}</h3>

          <div className="flex flex-col gap-4 md:flex-row">
            {/* Left side - Language selection */}
            <div className="w-full md:w-1/4">
              <Label className="mb-2 block font-medium">{t("selectLanguage")}</Label>
              <div className="border-border bg-card rounded-md border">
                <div className="flex flex-col divide-y">
                  {locales.map((locale) => (
                    <button
                      key={locale}
                      className={`hover:bg-muted/50 p-3 text-left capitalize ${
                        activeLocale === locale ? "bg-muted font-medium" : ""
                      }`}
                      onClick={() => onLocaleChange(locale as Locale)}
                    >
                      {locale}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side - Title and content */}
            <div className="w-full space-y-4 md:w-3/4">
              <div className="space-y-2">
                <Label className="font-medium">{t("title")}</Label>
                <Input
                  value={getTranslation(activeLocale).title}
                  onChange={(e) => onTranslationChange(activeLocale, "title", e.target.value)}
                  placeholder={t("titlePlaceholder", { locale: activeLocale })}
                  className="border-input focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-medium">{t("content")}</Label>
                <Textarea
                  value={getTranslation(activeLocale).content}
                  onChange={(e) => onTranslationChange(activeLocale, "content", e.target.value)}
                  placeholder={t("contentPlaceholder", { locale: activeLocale })}
                  rows={8}
                  className="border-input focus:ring-ring min-h-[180px] resize-y"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
