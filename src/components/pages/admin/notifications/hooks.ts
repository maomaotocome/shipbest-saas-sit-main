import { getNotificationDetail } from "@/actions/admin/notifications/detail";
import { getNotificationsList } from "@/actions/admin/notifications/get";
import { NotificationType } from "@/db/generated/prisma";
import { NotificationMessageDetail } from "@/types/notifications/index";
import { PaginatedResponse, PaginationParams } from "@/types/pagination";
import { useQuery } from "@tanstack/react-query";

interface UseNotificationsOptions extends PaginationParams {
  searchTitle?: string;
  type?: NotificationType;
}

export const useNotifications = ({
  page,
  pageSize,
  searchTitle,
  type,
}: UseNotificationsOptions) => {
  return useQuery<PaginatedResponse<NotificationMessageDetail>>({
    queryKey: ["notifications", page, pageSize, searchTitle, type],
    queryFn: () => getNotificationsList({ page, pageSize, searchTitle, type }),
  });
};

export const useNotificationDetail = (id: string) => {
  return useQuery<NotificationMessageDetail>({
    queryKey: ["notifications", id],
    queryFn: () => getNotificationDetail(id),
    enabled: !!id,
  });
};
