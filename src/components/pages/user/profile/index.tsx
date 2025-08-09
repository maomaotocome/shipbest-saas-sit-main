"use client";
import { Switch } from "@/components/ui/switch";
import { useUserSettings } from "@/hooks/use-user-settings";
import { useTranslations } from "next-intl";
export default function ProfilePage() {
  const privacyT = useTranslations("user.profile.privacy");
  const { settings, updateSettings, isLoading, isUpdating } = useUserSettings();

  const handlePrivacyChange = (checked: boolean) => {
    updateSettings({ isPublicDefault: checked });
  };

  return (
    <div className="container mx-auto py-6">
      {/* Privacy Settings Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">{privacyT("title")}</h2>
        <div className="max-w-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label htmlFor="public-default" className="text-sm font-medium">
                {privacyT("publicDefault")}
              </label>
              <p className="text-sm text-gray-600">
                {privacyT("publicDefaultDescription")}
              </p>
            </div>
            <Switch
              id="public-default"
              checked={settings?.isPublicDefault ?? true}
              onCheckedChange={handlePrivacyChange}
              disabled={isLoading || isUpdating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
