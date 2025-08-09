import { formatDateTimeI18n } from "@/lib/utils";
import { NotificationMessageDetail } from "@/types/notifications/index";

function priorityToClass(priority: number | undefined): string {
  if (priority === undefined) return "bg-blue-100 text-blue-800";
  if (priority <= 10) return "bg-red-100 text-red-800";
  if (priority <= 30) return "bg-orange-100 text-orange-800";
  if (priority <= 70) return "bg-blue-100 text-blue-800";
  return "bg-green-100 text-green-800";
}

export const useColumns = (t: (key: string) => string, locale: string) => {
  return [
    {
      accessorKey: "translations",
      header: t("columns.title"),
      cell: (row: NotificationMessageDetail) => {
        const translations = row.translations;
        const title =
          translations.find((t) => t.locale === locale)?.title ||
          translations.find((t) => t.locale === "en")?.title ||
          "";
        return (
          <div className="max-w-xs truncate">
            {row.type === "SYSTEM" && (
              <span className="mr-2 rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-800">
                {t("columns.system")}
              </span>
            )}
            {title}
          </div>
        );
      },
    },
    {
      accessorKey: "priority",
      header: t("columns.priority"),
      cell: (row: NotificationMessageDetail) => {
        const priority = row.priority || 50;
        return (
          <span className={`rounded px-1.5 py-0.5 text-xs ${priorityToClass(priority)}`}>
            {priority}
          </span>
        );
      },
    },
    {
      accessorKey: "targetUserType",
      header: t("columns.targetUsers"),
      cell: (row: NotificationMessageDetail) => {
        if (row.type !== "SYSTEM") return t("columns.userTypes.all");

        switch (row.targetUserType) {
          case "NEW_USERS":
            return t("columns.userTypes.newUsers");
          case "EXISTING_USERS":
            return t("columns.userTypes.existingUsers");
          default:
            return t("columns.userTypes.all");
        }
      },
    },
    {
      accessorKey: "scheduledAt",
      header: t("columns.scheduledAt"),
      cell: (row: NotificationMessageDetail) => {
        if (!row.scheduledAt) return t("columns.scheduledStatus.immediate");
        return formatDateTimeI18n(new Date(row.scheduledAt), locale);
      },
    },
    {
      accessorKey: "expiresAt",
      header: t("columns.expiresAt"),
      cell: (row: NotificationMessageDetail) => {
        if (!row.expiresAt) return t("columns.expiryStatus.never");
        return formatDateTimeI18n(new Date(row.expiresAt), locale);
      },
    },
    {
      accessorKey: "createdAt",
      header: t("columns.createdAt"),
      cell: (row: NotificationMessageDetail) => {
        return formatDateTimeI18n(new Date(row.createdAt), locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        });
      },
    },
    {
      accessorKey: "userStatuses",
      header: t("columns.readStatus"),
      cell: (row: NotificationMessageDetail) => {
        const statuses = row.userStatuses;
        const total = statuses.length;
        const read = statuses.filter((s) => s.status === "READ").length;
        return (
          <div className="flex items-center">
            <div className="mr-2">
              {read}/{total}
            </div>
          </div>
        );
      },
    },
  ];
};
