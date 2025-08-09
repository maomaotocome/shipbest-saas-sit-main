import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationReadStatus, NotificationType } from "@/db/generated/prisma";
import { cn, formatDateTimeI18n } from "@/lib/utils";
import { NotificationItem } from "@/types/notifications";
import { UseMutationResult } from "@tanstack/react-query";
import { Bell, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

interface NotificationCardProps {
  item: NotificationItem;
  markAsReadMutation: UseMutationResult<unknown, Error, string, unknown>;
  getTranslation: (item: NotificationItem, field: "title" | "content") => string;
}

const CONTENT_LENGTH_THRESHOLD = 150;

export function NotificationCard({
  item,
  markAsReadMutation,
  getTranslation,
}: NotificationCardProps) {
  const t = useTranslations("user.notifications");
  const locale = useLocale();
  const isUnread = item.status === NotificationReadStatus.UNREAD;
  const [isExpanded, setIsExpanded] = useState(false);

  const messageId = "message" in item ? item.messageId : item.id;
  const notificationType = "message" in item ? item.message.type : item.type;
  const IconComponent = notificationType === NotificationType.SYSTEM ? Bell : User;

  const content = getTranslation(item, "content");
  const needsToggle = content.length > CONTENT_LENGTH_THRESHOLD;

  return (
    <Card
      className={cn(
        "mb-4 transition-all duration-200 ease-in-out",
        "hover:bg-accent hover:shadow-md",
        isUnread && "border-primary border-l-4 pl-3"
      )}
    >
      <CardHeader className="pt-4 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center">
            <IconComponent className="text-muted-foreground mr-2 h-5 w-5 flex-shrink-0" />
            <CardTitle className={cn("text-base leading-snug", isUnread && "font-semibold")}>
              {getTranslation(item, "title")}
            </CardTitle>
          </div>
          <p className="text-muted-foreground flex-shrink-0 pt-0.5 text-xs text-nowrap">
            {formatDateTimeI18n(new Date(item.createdAt), locale, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          </p>
        </div>
      </CardHeader>
      <CardContent className={cn(isUnread && "pl-3")}>
        <div
          className={cn(
            "text-muted-foreground overflow-hidden text-sm whitespace-pre-wrap transition-[max-height] duration-500 ease-in-out",
            needsToggle && !isExpanded ? "max-h-20" : "max-h-[1000px]"
          )}
        >
          {content}
        </div>
        {needsToggle && (
          <Button
            variant="link"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary mt-1 h-auto p-0 text-xs"
          >
            {isExpanded ? t("showLess") : t("showMore")}
          </Button>
        )}
      </CardContent>
      {isUnread && (
        <CardFooter className={cn("pt-2 pb-4", isUnread && "pl-3")}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAsReadMutation.mutate(messageId)}
            disabled={markAsReadMutation.isPending}
            className="mr-auto"
          >
            {t("markAsRead")}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
