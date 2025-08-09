"use client";

import { useUserCredits } from "@/hooks/use-user-credits";
import { cn } from "@/lib/utils";
import { Coins } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

interface UserCreditsDisplayProps {
  /** custom class name */
  className?: string;
  /** whether to display as a link, default true */
  showAsLink?: boolean;
  /** custom link address, default to credits page */
  href?: string;
  /** click callback */
  onClick?: () => void;
  /** display style variant */
  variant?: "default" | "compact" | "minimal";
  /** whether to display icon, default true */
  showIcon?: boolean;
  /** custom label text, if not provided, use internationalized text */
  label?: string;
  /** whether to auto refresh, default false */
  autoRefresh?: boolean;
  /** refresh interval (milliseconds), default 30000 (30 seconds) */
  refreshInterval?: number;
  /** whether to enable query, default true */
  enabled?: boolean;
}

export const UserCreditsDisplay = ({
  className,
  showAsLink = true,
  href,
  onClick,
  variant = "default",
  showIcon = true,
  label,
  autoRefresh = false,
  refreshInterval = 30000,
  enabled = true,
}: UserCreditsDisplayProps) => {
  const locale = useLocale();
  const { data: session } = useSession();
  const t = useTranslations("credit");

  // use React Query to get credits data
  const {
    data: userCredits,
    isLoading: creditsLoading,
    error,
  } = useUserCredits({
    enabled,
    refetchInterval: autoRefresh ? refreshInterval : undefined,
  });

  const defaultHref = `/${locale}/user/credits`;
  const finalHref = href || defaultHref;
  const displayLabel = label || t("title");

  const getVariantStyles = () => {
    switch (variant) {
      case "compact":
        return "flex items-center space-x-1 text-xs";
      case "minimal":
        return "flex items-center space-x-1";
      default:
        return "flex items-center justify-between text-sm";
    }
  };

  if (!session) {
    return null;
  }

  const renderContent = () => {
    const baseClasses = cn(
      getVariantStyles(),
      variant === "default" && "hover:bg-accent hover:text-accent-foreground px-4 py-2",
      className
    );

    const iconElement = showIcon && (
      <Coins className={cn("h-4 w-4", variant === "default" ? "mr-2" : "mr-1")} />
    );

    const labelElement = variant !== "minimal" && (
      <span className={variant === "compact" ? "text-xs" : ""}>{displayLabel}</span>
    );

    const creditsElement = (
      <div
        className={cn(
          "font-medium",
          variant === "default" ? "text-primary" : "text-foreground",
          variant === "compact" && "text-xs"
        )}
      >
        {creditsLoading ? (
          <span className="text-muted-foreground">{t("loading")}</span>
        ) : error ? (
          <span className="text-muted-foreground" title={t("error")}>
            {t("unavailable")}
          </span>
        ) : userCredits ? (
          <span>{userCredits.totalCredits.toLocaleString()}</span>
        ) : (
          <span className="text-muted-foreground">{t("unavailable")}</span>
        )}
      </div>
    );

    if (variant === "default") {
      return (
        <div className={baseClasses}>
          <div className="flex items-center">
            {iconElement}
            {labelElement}
          </div>
          {creditsElement}
        </div>
      );
    }

    return (
      <div className={baseClasses}>
        {iconElement}
        {labelElement}
        {creditsElement}
      </div>
    );
  };

  if (showAsLink) {
    return (
      <Link
        href={finalHref}
        className={cn(
          variant === "default" && "hover:bg-accent hover:text-accent-foreground",
          "block"
        )}
        onClick={onClick}
        title={t("viewDetails")}
      >
        {renderContent()}
      </Link>
    );
  }

  return (
    <div
      className={cn(
        variant === "default" &&
          onClick &&
          "hover:bg-accent hover:text-accent-foreground cursor-pointer",
        "block"
      )}
      onClick={onClick}
      title={onClick ? t("viewDetails") : undefined}
    >
      {renderContent()}
    </div>
  );
};
