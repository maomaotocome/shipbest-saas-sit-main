"use client";
import { getNotifications } from "@/actions/user/notifications/get";
import { getSystemNotifications } from "@/actions/user/notifications/get-system";
import { getUnreadNotificationCounts } from "@/actions/user/notifications/get-unread-count";
import { markNotificationAsRead } from "@/actions/user/notifications/read";
import { markAllNotificationsAsRead } from "@/actions/user/notifications/read-all";
import Pagination from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationType } from "@/db/generated/prisma";
import { NotificationItem } from "@/types/notifications";
import { PaginatedResponse } from "@/types/pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { NotificationCard } from "./NotificationCard";

export default function NotificationsPage() {
  const t = useTranslations("user.notifications");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"personalized" | "system">("personalized");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: notificationData, isLoading } = useQuery<PaginatedResponse<NotificationItem>>({
    queryKey: ["notifications", activeTab, page, pageSize],
    queryFn: () => {
      if (activeTab === "system") {
        return getSystemNotifications({ page, pageSize });
      } else {
        return getNotifications({ type: NotificationType.PERSONALIZED, page, pageSize });
      }
    },
  });

  const { data: countsData } = useQuery({
    queryKey: ["notification-counts"],
    queryFn: getUnreadNotificationCounts,
  });

  const notifications: NotificationItem[] = notificationData?.items || [];
  const totalPages = notificationData?.totalPages ?? 0;

  const markAsReadMutation = useMutation({
    mutationFn: (messageId: string) => markNotificationAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", activeTab, page, pageSize],
      });
      queryClient.invalidateQueries({ queryKey: ["notification-counts"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-counts"] });
    },
  });

  const getTranslation = (item: NotificationItem, field: "title" | "content"): string => {
    const translations = "message" in item ? item.message?.translations : item.translations;
    if (!translations) return "";
    const specific = translations.find((tr) => tr.locale === locale);
    return specific?.[field] ?? translations[0]?.[field] ?? "";
  };

  const renderCountBadge = (count: number | undefined) => {
    const displayCount = count ?? 0;
    if (displayCount === 0) return null;
    return (
      <span className="ml-2 inline-block rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-medium text-white">
        {displayCount > 99 ? "99+" : displayCount}
      </span>
    );
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "personalized" | "system");
    setPage(1);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button
          onClick={() => markAllAsReadMutation.mutate()}
          disabled={markAllAsReadMutation.isPending}
        >
          {t("markAllAsRead")}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="personalized">
            {t("tabs.personalized")}
            {renderCountBadge(countsData?.personalized)}
          </TabsTrigger>
          <TabsTrigger value="system">
            {t("tabs.system")}
            {renderCountBadge(countsData?.system)}
          </TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
          {isLoading && <div className="text-muted-foreground text-center">{t("loading")}</div>}

          {!isLoading && notifications.length === 0 && (
            <div className="text-muted-foreground text-center">{t("noData")}</div>
          )}

          {!isLoading && notifications.length > 0 && (
            <div className="space-y-4">
              {notifications.map((item) => (
                <NotificationCard
                  key={item.id}
                  item={item}
                  getTranslation={getTranslation}
                  markAsReadMutation={markAsReadMutation}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
