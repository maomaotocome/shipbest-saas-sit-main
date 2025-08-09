import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { NotificationType } from "@/db/generated/prisma";
import { Locale, locales } from "@/i18n/locales";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BasicSettings } from "./components/BasicSettings";
import { NotificationContent } from "./components/NotificationContent";
import { UserSelection } from "./components/UserSelection";
import { NotificationModalProps, Translation, User } from "./types";
import { fetchUsers } from "./utils";
export default function NotificationModal({ open, onClose, notification }: NotificationModalProps) {
  const t = useTranslations("admin.notifications.modal");

  const [translations, setTranslations] = useState<Translation[]>(
    locales.map((locale) => ({
      locale,
      title: notification?.translations?.find((t) => t.locale === locale)?.title ?? "",
      content: notification?.translations?.find((t) => t.locale === locale)?.content ?? "",
    }))
  );

  const [type, setType] = useState<string>(notification?.type || NotificationType.PERSONALIZED);
  const [priority, setPriority] = useState<number>(notification?.priority || 50);
  const [scheduledAt, setScheduledAt] = useState<string>(
    notification?.scheduledAt
      ? typeof notification.scheduledAt === "string"
        ? notification.scheduledAt.slice(0, 16)
        : new Date(notification.scheduledAt).toISOString().slice(0, 16)
      : ""
  );
  const [expiresAt, setExpiresAt] = useState<string>(
    notification?.expiresAt
      ? typeof notification.expiresAt === "string"
        ? notification.expiresAt.slice(0, 16)
        : new Date(notification.expiresAt).toISOString().slice(0, 16)
      : ""
  );
  const [targetUserType, setTargetUserType] = useState<string>(
    notification?.targetUserType || "ALL"
  );

  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    notification?.userStatuses?.map((status) => status.userId) || []
  );
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [activeLocale, setActiveLocale] = useState<Locale>(locales[0]);
  const queryClient = useQueryClient();

  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", search, page, pageSize],
    queryFn: async () => {
      try {
        return await fetchUsers(search, page, pageSize);
      } catch (e) {
        console.error("Failed to fetch users:", e);
        throw e;
      }
    },
    enabled: open && type === NotificationType.PERSONALIZED,
  });

  const users: User[] = usersData?.data || [];
  const totalPages = usersData?.totalPages || 1;

  useEffect(() => {
    setTranslations(
      locales.map((locale) => ({
        locale,
        title: notification?.translations?.find((t) => t.locale === locale)?.title ?? "",
        content: notification?.translations?.find((t) => t.locale === locale)?.content ?? "",
      }))
    );

    setType(notification?.type || NotificationType.PERSONALIZED);
    setPriority(notification?.priority || 50);
    setScheduledAt(
      notification?.scheduledAt
        ? typeof notification.scheduledAt === "string"
          ? notification.scheduledAt.slice(0, 16)
          : new Date(notification.scheduledAt).toISOString().slice(0, 16)
        : ""
    );
    setExpiresAt(
      notification?.expiresAt
        ? typeof notification.expiresAt === "string"
          ? notification.expiresAt.slice(0, 16)
          : new Date(notification.expiresAt).toISOString().slice(0, 16)
        : ""
    );
    setTargetUserType(notification?.targetUserType || "ALL");

    if (notification?.userStatuses?.length) {
      setSelectedUsers(notification.userStatuses.map((status) => status.userId));
    } else {
      setSelectedUsers([]);
    }
  }, [notification]);

  const saveNotification = async () => {
    try {
      if (type === "PERSONALIZED" && selectedUsers.length === 0) {
        toast.error(t("errors.personalizedNoUser"));
        return;
      }

      const hasValidTranslation = locales.some((locale) => {
        const translation = getTranslation(locale);
        return translation.title.trim() !== "" && translation.content.trim() !== "";
      });

      if (!hasValidTranslation) {
        toast.error(t("errors.needTitleContent"));
        return;
      }

      const requestBody = {
        type,
        priority,
        scheduledAt: scheduledAt || null,
        expiresAt: expiresAt || null,
        targetUserType,
        userIds: type === "PERSONALIZED" ? selectedUsers : undefined,
        translations: locales.map((locale) => ({
          locale,
          title: getTranslation(locale).title,
          content: getTranslation(locale).content,
        })),
      };

      const response = await fetch(
        notification ? `/api/admin/notifications/${notification.id}` : "/api/admin/notifications",
        {
          method: notification ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || t("errors.unknownError");
        toast.error(
          notification
            ? t("errors.updateFailed", { message: errorMessage })
            : t("errors.createFailed", { message: errorMessage })
        );
        return;
      }

      toast.success(notification ? t("success.updated") : t("success.created"));
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(t("errors.unknownError"));
    }
  };

  const handleTranslationChange = (locale: string, field: "title" | "content", value: string) => {
    setTranslations((prev) =>
      prev.map((t) => (t.locale === locale ? { ...t, [field]: value } : t))
    );
  };

  const getTranslation = (locale: string) => {
    return (
      translations.find((t) => t.locale === locale) || {
        locale,
        title: "",
        content: "",
      }
    );
  };

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId]);
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelectedUsers = [...selectedUsers];
      users.forEach((user) => {
        if (!selectedUsers.includes(user.id)) {
          newSelectedUsers.push(user.id);
        }
      });
      setSelectedUsers(newSelectedUsers);
    } else {
      const currentPageIds = users.map((user) => user.id);
      setSelectedUsers((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    }
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((id) => id !== userId));
  };

  const isSystemNotification = type === "SYSTEM";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {notification ? t("editTitle") : t("createTitle")}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh] pr-4">
          <div className="space-y-6 p-2">
            <BasicSettings
              type={type}
              priority={priority}
              scheduledAt={scheduledAt}
              expiresAt={expiresAt}
              targetUserType={targetUserType}
              onTypeChange={setType}
              onPriorityChange={setPriority}
              onScheduledAtChange={setScheduledAt}
              onExpiresAtChange={setExpiresAt}
              onTargetUserTypeChange={setTargetUserType}
            />

            {!isSystemNotification && (
              <UserSelection
                selectedUsers={selectedUsers}
                onUserSelect={handleUserSelect}
                onSelectAll={handleSelectAll}
                onRemoveUser={removeSelectedUser}
                onClearSelection={() => setSelectedUsers([])}
                search={searchInput}
                onSearchChange={setSearchInput}
                onSearch={() => {
                  setSearch(searchInput);
                  setPage(1);
                }}
                page={page}
                onPageChange={setPage}
                users={users}
                isLoading={isLoading}
                error={error}
                totalPages={totalPages}
              />
            )}

            <NotificationContent
              translations={translations}
              activeLocale={activeLocale}
              onLocaleChange={setActiveLocale}
              onTranslationChange={handleTranslationChange}
            />
          </div>
        </ScrollArea>

        <Separator className="my-2" />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="border-input hover:bg-muted">
            {t("cancel")}
          </Button>
          <Button
            onClick={saveNotification}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {t("saveNotification")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
