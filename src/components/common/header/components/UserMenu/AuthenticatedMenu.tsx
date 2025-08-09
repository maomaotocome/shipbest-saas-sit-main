import { STORAGE_KEYS } from "@/components/common/credit-award/constants";
import { UserCreditsDisplay } from "@/components/common/user-credits";
import { Switch } from "@/components/ui/switch";
import { Bell, LogOut, Settings, User } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

interface AuthenticatedMenuProps {
  session: Session;
  onClose: () => void;
}

export const AuthenticatedMenu = ({ session, onClose }: AuthenticatedMenuProps) => {
  const t = useTranslations("header.userMenu");
  const locale = useLocale();
  const [showAwardSwitcher, setShowAwardSwitcher] = useState(false);
  const [isAwardEnabled, setIsAwardEnabled] = useState(false);
  const [foreverDeclined, setForeverDeclined] = useLocalStorage(
    STORAGE_KEYS.FOREVER_AWARD_DECLINED_FLAG,
    ""
  );

  useEffect(() => {
    setShowAwardSwitcher(foreverDeclined === "true");
    setIsAwardEnabled(false);
  }, [foreverDeclined]);

  const handleAwardToggle = () => {
    if (isAwardEnabled) {
      setIsAwardEnabled(false);
      setForeverDeclined("true");
    } else {
      setIsAwardEnabled(true);
      setForeverDeclined("");
      setTimeout(() => {
        setShowAwardSwitcher(false);
      }, 300);
    }
  };

  return (
    <div className="border-border bg-popover absolute right-0 mt-2 w-64 rounded-md border shadow-lg select-none">
      <div className="border-border border-b p-4">
        <div className="flex items-center space-x-3">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt="User avatar"
              className="h-10 w-10 rounded-full"
              width={40}
              height={40}
            />
          ) : (
            <User className="h-10 w-10" />
          )}
          <div className="flex flex-col">
            <span className="font-medium">{session.user.name}</span>
            <span className="text-muted-foreground text-sm">{session.user.email}</span>
          </div>
        </div>
      </div>
      <div className="py-2">
        {/* Credit display */}
        <UserCreditsDisplay variant="default" onClick={onClose} />

        <div className="bg-border my-2 h-px" />

        <Link
          href={`/${locale}/user`}
          className="hover:bg-accent hover:text-accent-foreground flex items-center px-4 py-2 text-sm"
          onClick={onClose}
        >
          <User className="mr-2 h-4 w-4" />
          <span>{t("accountSettings")}</span>
        </Link>

        {session.user.role === "ADMIN" && (
          <Link
            href={`/${locale}/admin`}
            className="hover:bg-accent hover:text-accent-foreground flex items-center px-4 py-2 text-sm"
            onClick={onClose}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>{t("adminDashboard")}</span>
          </Link>
        )}

        <div className="bg-border my-2 h-px" />
        {showAwardSwitcher && (
          <>
            <div className="flex items-center justify-between px-4 py-2 text-sm">
              <Bell className="mr-2 h-4 w-4" />
              <span>{t("enableAwardNotifications")}</span>
              <div className="ml-auto">
                <Switch checked={isAwardEnabled} onCheckedChange={handleAwardToggle} />
              </div>
            </div>
            <div className="bg-border my-2 h-px" />
          </>
        )}
        <button
          onClick={() => {
            onClose();
            signOut();
          }}
          className="hover:bg-accent hover:text-accent-foreground flex w-full items-center px-4 py-2 text-left text-sm"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("signOut")}</span>
        </button>
      </div>
    </div>
  );
};
