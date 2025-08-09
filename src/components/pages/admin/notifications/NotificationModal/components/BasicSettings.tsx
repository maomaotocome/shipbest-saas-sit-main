import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NotificationType } from "@/db/generated/prisma";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";

interface BasicSettingsProps {
  type: string;
  priority: number;
  scheduledAt: string;
  expiresAt: string;
  targetUserType: string;
  onTypeChange: (value: string) => void;
  onPriorityChange: (value: number) => void;
  onScheduledAtChange: (value: string) => void;
  onExpiresAtChange: (value: string) => void;
  onTargetUserTypeChange: (value: string) => void;
}

export function BasicSettings({
  type,
  priority,
  scheduledAt,
  expiresAt,
  targetUserType,
  onTypeChange,
  onPriorityChange,
  onScheduledAtChange,
  onExpiresAtChange,
  onTargetUserTypeChange,
}: BasicSettingsProps) {
  const t = useTranslations("admin.notifications.modal");
  const isSystemNotification = type === "SYSTEM";

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-4">
          <h3 className="text-base font-semibold">{t("basicSettings")}</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-medium">{t("notificationType")}</Label>
                <Select
                  value={type}
                  onValueChange={(value) => {
                    onTypeChange(value);
                    if (value === "SYSTEM") {
                      onTargetUserTypeChange("ALL");
                    }
                  }}
                >
                  <SelectTrigger className="border-input focus:ring-ring">
                    <SelectValue placeholder={t("notificationType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NotificationType.PERSONALIZED}>
                      {t("notificationTypes.personalized")}
                    </SelectItem>
                    <SelectItem value={NotificationType.SYSTEM}>
                      {t("notificationTypes.system")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isSystemNotification && (
                <div className="space-y-2">
                  <Label htmlFor="priority" className="font-medium">
                    {t("priority")}
                  </Label>
                  <Input
                    id="priority"
                    type="number"
                    min="0"
                    max="100"
                    value={priority}
                    onChange={(e) => onPriorityChange(Number(e.target.value))}
                    className="border-input focus:ring-ring w-24"
                  />
                  <p className="text-muted-foreground text-xs">{t("priorityHelp")}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt" className="font-medium">
                  {t("scheduledTime")}
                </Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => onScheduledAtChange(e.target.value)}
                  className="border-input focus:ring-ring"
                />
                <p className="text-muted-foreground text-xs">{t("scheduledTimeHelp")}</p>
              </div>

              {isSystemNotification && (
                <div className="space-y-2">
                  <Label htmlFor="expiresAt" className="font-medium">
                    {t("expiryTime")}
                  </Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => onExpiresAtChange(e.target.value)}
                    className="border-input focus:ring-ring"
                  />
                  <p className="text-muted-foreground text-xs">{t("expiryTimeHelp")}</p>
                </div>
              )}
            </div>
          </div>

          {isSystemNotification && (
            <div className="mt-2">
              <div className="max-w-xs space-y-2">
                <Label className="font-medium">{t("targetUsers")}</Label>
                <Select value={targetUserType} onValueChange={onTargetUserTypeChange}>
                  <SelectTrigger className="border-input focus:ring-ring">
                    <SelectValue placeholder={t("targetUsers")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{t("userGroup.all")}</SelectItem>
                    <SelectItem value="NEW_USERS">{t("userGroup.new")}</SelectItem>
                    <SelectItem value="EXISTING_USERS">{t("userGroup.existing")}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">
                  {targetUserType === "ALL"
                    ? t("targetUsersHelp.all")
                    : targetUserType === "NEW_USERS"
                      ? t("targetUsersHelp.new")
                      : t("targetUsersHelp.existing")}
                </p>
              </div>
            </div>
          )}

          <div className="pt-2">
            {isSystemNotification ? (
              <div className="bg-muted flex items-start space-x-2 rounded-md p-3 text-sm">
                <InfoCircledIcon className="text-muted-foreground mt-0.5 h-5 w-5 flex-shrink-0" />
                <span className="text-muted-foreground">{t("systemNoticeHelp")}</span>
              </div>
            ) : (
              <div className="bg-muted flex items-start space-x-2 rounded-md p-3 text-sm">
                <InfoCircledIcon className="text-muted-foreground mt-0.5 h-5 w-5 flex-shrink-0" />
                <span className="text-muted-foreground">{t("personalizedNoticeHelp")}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
