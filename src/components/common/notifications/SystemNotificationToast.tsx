"use client";

// Import real actions and types
import {
  getLatestUnreadSystemToastAction,
  markSystemNotificationAsReadAction,
  SystemToastNotification, // Import the real return type
} from "@/actions/user/notifications/system-toast";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocalStorage } from "usehooks-ts";

// Define constants for localStorage key and TTL (1 hour)
const COOLDOWN_STORAGE_KEY = "systemToastCooldownUntil";
const ONE_HOUR_MS = 60 * 60 * 1000;

export const SystemNotificationToast = () => {
  const { status } = useSession();
  const [shownToastIds, setShownToastIds] = useState<Set<string>>(new Set());
  const [cooldownUntil, setCooldownUntil] = useLocalStorage(COOLDOWN_STORAGE_KEY, "");

  // Check if we're currently in cooldown period
  const isCoolingDown = cooldownUntil ? new Date(cooldownUntil) > new Date() : false;

  // Use real action and type in useQuery
  const { data: notification } = useQuery<SystemToastNotification | null>({
    // Use real type
    queryKey: ["latestSystemNotification"],
    queryFn: getLatestUnreadSystemToastAction, // Use real action
    // Enable query only if authenticated AND not in cooldown period
    enabled: status === "authenticated" && !isCoolingDown,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    // Important: We might need to refetch manually or invalidate this query
    // if we want a *new* notification to appear *after* the cooldown expires,
    // without requiring a page reload. This depends on desired UX.
    // For now, it refetches based on staleTime if enabled.
  });

  // Setup mutation for marking as read
  const markAsReadMutation = useMutation({
    mutationFn: markSystemNotificationAsReadAction, // Use real action
    onError: (error) => {
      // Log error if marking as read fails (as decided)
      console.error("Failed to mark system toast as read:", error);
    },
    // No onSuccess needed as UI update (dismiss) happens immediately
  });

  // Helper function to set cooldown
  const setCooldown = useCallback(() => {
    const cooldownEnd = new Date(Date.now() + ONE_HOUR_MS);
    setCooldownUntil(cooldownEnd.toISOString());
  }, [setCooldownUntil]);

  useEffect(() => {
    if (notification && status === "authenticated" && !shownToastIds.has(notification.id)) {
      toast.custom(
        (t) => (
          <div
            className={`${t.visible ? "animate-enter" : "animate-leave"} bg-card ring-opacity-5 pointer-events-auto relative w-full max-w-md rounded-lg shadow-lg ring-1 ring-black`}
          >
            <button
              onClick={() => {
                if (t.id) toast.dismiss(t.id);
                // Set cooldown when closed manually
                setCooldown();
              }}
              className="text-muted-foreground hover:text-card-foreground focus:ring-ring absolute top-2 right-2 rounded-md p-1 focus:ring-2 focus:outline-none"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="p-4 pr-8">
              <p className="text-card-foreground text-base font-semibold">{notification.title}</p>
              <p className="text-muted-foreground mt-1 text-sm">{notification.content}</p>
            </div>
            <div className="border-border mt-2 border-t px-4 py-2">
              <div className="flex justify-end">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    // Immediately dismiss
                    if (t.id) toast.dismiss(t.id);
                    // Trigger the mutation in the background
                    markAsReadMutation.mutate(notification.id);
                    // Trigger mutation AND set cooldown
                    setCooldown();
                  }}
                  // Disable button while mutation is pending (optional but good practice)
                  disabled={markAsReadMutation.isPending}
                >
                  Mark Read
                </Button>
              </div>
            </div>
          </div>
        ),
        {
          id: `system-notification-${notification.id}`,
          duration: Infinity,
        }
      );
      setShownToastIds((prevIds) => new Set(prevIds).add(notification.id));
    }
  }, [notification, status, shownToastIds, markAsReadMutation, setCooldown]); // Add mutation and setCooldown to dependency array

  return null;
};
