import { Button } from "@/components/ui/button";
import { ProviderId } from "@/lib/auth/providers/enum";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { MagicLink } from "./magic-link";
import { AuthPanelProps } from "./types";

export const AuthPanel = ({ redirectTo, onOpenChange }: AuthPanelProps) => {
  const t = useTranslations("auth");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn(ProviderId.GOOGLE, { redirectTo });
      onOpenChange?.(false);
    } catch (error) {
      toast.error(t("googleSignInError"));
      console.error("Google sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-2 p-4 md:p-10">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">{t("welcome")}</h2>
        <p className="text-muted-foreground text-sm">{t("enterEmailToStart")}</p>
      </div>
      <div>
        <MagicLink redirectTo={redirectTo} />
      </div>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">{t("orContinueWith")}</span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={handleGoogleSignIn}
        className="h-8 w-full rounded-full text-sm md:h-20 md:text-2xl"
      >
        <FcGoogle className="mr-2 h-4 w-4" />
        {t("continueWithGoogle")}
      </Button>
    </div>
  );
};
