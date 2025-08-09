"use client";

import { getUserSettings, updateUserSettings, type UserSettings } from "@/actions/user/setttings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const USER_SETTINGS_KEY = ["user", "settings"] as const;

export function useUserSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: USER_SETTINGS_KEY,
    queryFn: getUserSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateSettingsMutation = useMutation({
    mutationFn: updateUserSettings,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: USER_SETTINGS_KEY });
        toast.success("Settings updated successfully");
      } else {
        toast.error(result.error || "Failed to update settings");
      }
    },
    onError: (error) => {
      console.error("Failed to update settings:", error);
      toast.error("Failed to update settings");
    },
  });

  const updateSettings = (settings: Partial<UserSettings>) => {
    updateSettingsMutation.mutate(settings);
  };

  return {
    settings,
    isLoading,
    updateSettings,
    isUpdating: updateSettingsMutation.isPending,
  };
}