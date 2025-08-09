import { NotificationReadStatus, Prisma } from "@/db/generated/prisma";

// Type for Personalized Notifications (from get.ts)
export type PersonalizedNotificationListItem = Prisma.NotificationMessageUserStatusGetPayload<{
  include: {
    message: {
      include: {
        translations: true;
      };
    };
  };
}>;

// Type for System Notifications (from get-system.ts)
export type SystemNotificationListItem = Prisma.NotificationMessageGetPayload<{
  include: {
    translations: true;
  };
}> & {
  status: NotificationReadStatus;
  userStatusId: string | null;
};

// Union type for components
export type NotificationItem = PersonalizedNotificationListItem | SystemNotificationListItem;
