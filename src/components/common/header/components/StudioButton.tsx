"use client";

import { AuthDialog } from "@/components/common/auth/dialog";
import { PricingDialog } from "@/components/common/pricing/dialog";
import { Button } from "@/components/ui/button";
import { useUserPermission } from "@/hooks";
import { Link } from "@/i18n/routing";
import { Palette } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export const StudioButton = () => {
  const t = useTranslations("header");
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const session = useSession();

  const { hasStudioPermission, isLoading } = useUserPermission();

  const handleStudioClick = () => {
    if (session.status !== "authenticated") {
      setIsAuthDialogOpen(true);
      return;
    }

    if (!hasStudioPermission) {
      setIsPricingDialogOpen(true);
      return;
    }
  };

  // if user is logged in and has permission, render Link
  if (session.status === "authenticated" && hasStudioPermission) {
    return (
      <Link href="/studio">
        <Button
          variant="default"
          size="default"
          className="flex transform items-center gap-2 rounded-full text-sm font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
          disabled={isLoading}
        >
          <Palette className="h-4 w-4" />
          <span className="hidden md:block">{t("nav.studio")}</span>
        </Button>
      </Link>
    );
  }

  // otherwise, render Button with click handler
  return (
    <>
      <Button
        variant="default"
        size="default"
        className="flex transform items-center gap-2 rounded-full text-sm font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
        onClick={handleStudioClick}
        disabled={isLoading}
      >
        <Palette className="h-4 w-4" />
        <span className="hidden md:block">{t("nav.studio")}</span>
      </Button>

      {/* dialogs */}
      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
      <PricingDialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen} />
    </>
  );
};
