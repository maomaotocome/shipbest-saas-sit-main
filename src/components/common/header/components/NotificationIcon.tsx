"use client";

import { getUnreadNotificationCounts } from "@/actions/user/notifications/get-unread-count";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";

export const NotificationIcon = () => {
  const { status } = useSession();
  const locale = useLocale();
  const { data: unreadData } = useQuery({
    queryKey: ["unreadNotificationCounts"],
    queryFn: getUnreadNotificationCounts,
    enabled: status === "authenticated",
  });

  // Only render the icon for authenticated users
  if (status !== "authenticated") {
    return null;
  }

  // Use the total count directly from the API response
  const count = unreadData?.personalized ?? 0;

  const handleClick = () => {
    window.location.href = `/${locale}/user/notifications`;
  };

  return (
    <button
      onClick={handleClick}
      aria-label="View notifications"
      className="hover:bg-accent hover:text-accent-foreground relative flex h-9 w-9 items-center justify-center rounded-lg p-2"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <Badge
          variant="destructive" // Use a destructive variant for attention
          className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full p-1 text-xs"
        >
          {count > 99 ? "99+" : count}
        </Badge>
      )}
    </button>
  );
};
