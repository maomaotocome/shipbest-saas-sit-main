"use client";

import { UserCreditsDisplay } from "@/components/common/user-credits";
import { useIsMobile } from "@/hooks/use-mobile";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { NotificationIcon } from "./NotificationIcon";
import { StudioButton } from "./StudioButton";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { UserMenu } from "./UserMenu";

export const Actions = () => {
  const isMobile = useIsMobile();
  return (
    <div className="flex items-center space-x-1 md:space-x-2">
      {!isMobile && <ThemeSwitcher />}
      {!isMobile && <LocaleSwitcher />}
      {!isMobile && <NotificationIcon />}
      {!isMobile && <UserCreditsDisplay variant="minimal" showAsLink={false} className="text-sm" />}
      <StudioButton />
      <UserMenu />
    </div>
  );
};
