import { Locale } from "@/i18n/locales";
import { formatDistanceToNowI18n } from "@/lib/utils";
import { useEffect, useState } from "react";

export function useTaskTime(createdAt: string | Date, locale: Locale) {
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    const updateTimeAgo = async () => {
      try {
        const formattedTime = await formatDistanceToNowI18n(new Date(createdAt), locale);
        setTimeAgo(formattedTime);
      } catch (error) {
        console.error("Failed to format time:", error);
        // Fallback to basic formatting
        setTimeAgo(new Date(createdAt).toLocaleString(locale));
      }
    };

    updateTimeAgo();

    // Update time every minute
    const interval = setInterval(updateTimeAgo, 60000);

    return () => clearInterval(interval);
  }, [createdAt, locale]);

  return timeAgo;
}