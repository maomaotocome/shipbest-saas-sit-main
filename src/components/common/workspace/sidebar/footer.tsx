import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ChevronUp, Home, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

interface FooterContentProps {
  onDropdownOpenChange?: (open: boolean) => void;
}

export function FooterContent({ onDropdownOpenChange }: FooterContentProps) {
  const t = useTranslations("workspace");
  const { data: session } = useSession();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const locale = useLocale();

  return (
    <div className="h-16 px-2 py-2">
      <div className="relative h-full select-none">
        <HoverCard onOpenChange={onDropdownOpenChange} openDelay={50} closeDelay={150}>
          <HoverCardTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "flex h-full w-full items-center gap-3 rounded-lg p-2 focus:outline-none focus-visible:ring-0",
                isCollapsed && "lg:justify-center"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={session?.user?.image || "/images/logo.png"}
                  alt={t("sidebar.userAvatar")}
                />
                <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{session?.user?.name}</span>
                    <span className="text-muted-foreground text-xs">{session?.user?.email}</span>
                  </div>
                  <div className="flex w-full items-center justify-end">
                    <ChevronUp className="h-4 w-4" />
                  </div>
                </>
              )}
            </Button>
          </HoverCardTrigger>
          <HoverCardContent align="end" className="w-56 p-1">
            <div className="space-y-1">
              <Link
                href={`/${locale}`}
                className="hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-sm px-2 py-1.5 text-sm"
              >
                <Home className="h-4 w-4" />
                <span>{t("sidebar.home")}</span>
              </Link>
              <button
                className="text-destructive hover:bg-accent hover:text-destructive focus:bg-accent focus:text-destructive flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-sm focus:outline-none"
                onClick={() => signOut({ callbackUrl: `/${locale}` })}
              >
                <LogOut className="h-4 w-4" />
                <span>{t("sidebar.logout")}</span>
              </button>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
}
