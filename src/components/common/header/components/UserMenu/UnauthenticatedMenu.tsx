"use client";
import { ProviderId } from "@/lib/auth/providers/enum";
import { Lock } from "lucide-react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FcGoogle } from "react-icons/fc";

interface UnauthenticatedMenuProps {
  onAuthClick: () => void;
  onClose: () => void;
}

export const UnauthenticatedMenu = ({ onAuthClick, onClose }: UnauthenticatedMenuProps) => {
  const t = useTranslations("header.userMenu");

  const handleGoogleSignIn = async () => {
    onClose();
    await signIn(ProviderId.GOOGLE, { popup: true });
  };

  return (
    <div className="bg-popover border-border absolute right-0 mt-2 w-64 rounded-md border shadow-lg">
      <div className="p-4">
        <h3 className="mb-2 text-sm font-medium">{t("welcome")}</h3>
        <p className="text-muted-foreground mb-4 text-sm">{t("signInToAccessAccount")}</p>
        <button
          onClick={handleGoogleSignIn}
          className="hover:bg-accent hover:text-accent-foreground mb-2 flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm"
        >
          <FcGoogle className="mr-2 h-4 w-4" />
          {t("signInWithGoogle")}
        </button>
        <button
          onClick={onAuthClick}
          className="hover:bg-accent hover:text-accent-foreground mb-2 flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm"
        >
          <Lock className="mr-2 h-4 w-4" />
          {t("signIn")} / {t("signUp")}
        </button>
      </div>
    </div>
  );
};
