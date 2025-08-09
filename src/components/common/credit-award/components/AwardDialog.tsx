import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditSource } from "@/db/generated/prisma";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useState } from "react";
import Turnstile from "react-turnstile";
interface AwardDialogProps {
  showDialog: boolean;
  canClaimNewUser: boolean;
  canClaimDaily: boolean;
  loading: boolean;
  error: string | null;
  success: boolean;
  setTurnstileToken: (token: string) => void;
  setSelectedAwardType: (type: CreditSource) => void;
  handleDeclineToday: () => void;
  handleDeclineForever: () => void;
  handleLater: () => void;
}

export function AwardDialog({
  showDialog,
  canClaimNewUser,
  canClaimDaily,
  loading,
  error,
  success,
  setTurnstileToken,
  setSelectedAwardType,
  handleDeclineToday,
  handleDeclineForever,
  handleLater,
}: AwardDialogProps) {
  const t = useTranslations("billing");
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme as "light" | "dark";
  const [showTurnstile, setShowTurnstile] = useState(false);

  const handleButtonClick = (type: CreditSource) => {
    setSelectedAwardType(type);
    setShowTurnstile(true);
  };

  const handleTurnstileVerify = (token: string) => {
    setTurnstileToken(token);
  };

  const handleDialogClose = () => {
    handleLater();
  };

  return (
    <Dialog open={showDialog} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("award.title")}</DialogTitle>
        </DialogHeader>
        <div className="flex w-full flex-col items-center gap-4">
          <div className="relative">
            <Image
              src="/images/billing/credit-award.svg"
              alt="Credit Award"
              width={256}
              height={256}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-muted-foreground text-center text-6xl font-bold">
                {canClaimDaily && process.env.NEXT_PUBLIC_CREDIT_DAILY_LOGIN_AWARD_AMOUNT}
                {canClaimNewUser && process.env.NEXT_PUBLIC_CREDIT_NEW_USER_AWARD_AMOUNT}
              </p>
              <div className="text-accent bg-accent/20 mt-2 rounded-full p-2 text-center text-sm">
                {t("award.credits")}
              </div>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-center text-sm">
          {canClaimNewUser
            ? t("award.newUserDescription")
            : canClaimDaily
              ? t("award.dailyLoginDescription")
              : ""}
        </p>
        <div className="mb-10 space-y-4">
          <div className="flex justify-center gap-4">
            {canClaimNewUser && (
              <Button
                onClick={() => handleButtonClick(CreditSource.NEW_USER_AWARD)}
                disabled={loading || showTurnstile}
                className="w-auto px-4"
              >
                {loading ? t("award.loading") : t("award.claim_new_user")}
              </Button>
            )}
            {canClaimDaily && (
              <Button
                onClick={() => handleButtonClick(CreditSource.DAILY_LOGIN_AWARD)}
                disabled={loading || showTurnstile}
                className="w-auto px-4"
              >
                {loading ? t("award.loading") : t("award.claim_daily")}
              </Button>
            )}
          </div>
          {showTurnstile && (
            <div className="flex w-full items-center justify-center">
              <Turnstile
                className="w-full"
                size="flexible"
                sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || ""}
                onVerify={handleTurnstileVerify}
                theme={theme}
              />
            </div>
          )}
          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-500">{t("award.success")}</div>}
        </div>
        <DialogFooter>
          <div className="flex w-full justify-end gap-2 text-sm">
            <Button
              variant="outline"
              size="sm"
              className="border-none shadow-none"
              onClick={handleDeclineForever}
            >
              {t("award.decline_forever")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-none shadow-none"
              onClick={handleDeclineToday}
            >
              {t("award.decline_today")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-none shadow-none"
              onClick={handleLater}
            >
              {t("award.later")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
