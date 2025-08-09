import { Prisma } from "@/db/generated/prisma";
export enum SendNotificationMode {
  ALL = "ALL",
  SPECIFIC = "SPECIFIC",
}

export type SendNotificationBody =
  | { mode: SendNotificationMode.ALL }
  | {
      mode: SendNotificationMode.SPECIFIC;
      userIds: string[];
    };

export type NotificationDetailInclude = {
  translations: true;
  userStatuses: {
    include: {
      user: true;
    };
  };
};
export type NotificationMessageDetail = Prisma.NotificationMessageGetPayload<{
  include: NotificationDetailInclude;
}>;
