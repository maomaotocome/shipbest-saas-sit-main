import { AuthDialog } from "@/components/common/auth/dialog";
import { PricingDialog } from "@/components/common/pricing/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUserPermission } from "@/hooks/use-user-permission";
import { cn } from "@/lib/utils";
import { Crown, Eye, EyeOff, ExternalLink, Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface TaskPrivacySelectorProps {
  isPublic: boolean;
  onPrivacyChange: (isPublic: boolean) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export function TaskPrivacySelector({
  isPublic,
  onPrivacyChange,
  label,
  required = false,
  className,
}: TaskPrivacySelectorProps) {
  const t = useTranslations("ai.common");
  const session = useSession();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);

  const { hasPrivateTaskPermission, isLoading } = useUserPermission();

  const displayLabel = label || t("taskVisibility");
  const canSetPrivate = session.data && hasPrivateTaskPermission;

  const handlePrivacyChange = (checked: boolean) => {
    // if user want to set private but not have permission
    if (!checked && !canSetPrivate) {
      if (!session.data) {
        setIsAuthDialogOpen(true);
      } else {
        setIsPricingDialogOpen(true);
      }
      return;
    }
    // just pass checked value, don't reverse it
    onPrivacyChange(checked);
  };

  const handleGetPermission = () => {
    if (!session.data) {
      setIsAuthDialogOpen(true);
    } else {
      setIsPricingDialogOpen(true);
    }
  };

  const handleOpenProfileSettings = () => {
    window.open("/user/profile", "_blank");
  };

  return (
    <>
      <div
        className={cn(
          "space-y-3 rounded-xl p-3 shadow-md shadow-black/15 dark:shadow-white/20",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isPublic ? (
              <Eye className="text-primary h-4 w-4" />
            ) : (
              <EyeOff className="text-primary h-4 w-4" />
            )}
            <Label className="block text-left text-sm">
              {displayLabel}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <span className="text-muted-foreground text-xs">
              ({isPublic ? t("publicTask") : t("privateTask")})
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {isPublic ? t("publicTaskDescription") : t("privateTaskDescription")}
              </span>
              {!isPublic && <Lock className="text-muted-foreground h-3 w-3" />}
            </div>
            <Switch checked={isPublic} onCheckedChange={handlePrivacyChange} disabled={isLoading} />
          </div>

          {!isPublic && canSetPrivate && (
            <div className="border-border border-t pt-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs">
                    {t("privateTaskProfileLink")}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenProfileSettings}
                  className="h-7 px-3 text-xs"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  {t("openProfileSettings")}
                </Button>
              </div>
            </div>
          )}

          {!canSetPrivate && (
            <div className="border-border border-t pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <span className="text-muted-foreground text-xs">
                    {!session.data ? t("loginRequired") : t("premiumFeature")}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetPermission}
                  className="h-7 px-3 text-xs"
                >
                  {!session.data ? t("login") : t("getPermission")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* dialog */}
      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
      <PricingDialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen} />
    </>
  );
}
