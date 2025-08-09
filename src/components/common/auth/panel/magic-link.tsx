"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProviderId } from "@/lib/auth/providers/enum";
import { rateLimitByIp } from "@/lib/limiter";
import { Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import toast from "react-hot-toast";
import { createSchemas } from "./types";

export const MagicLink = ({ redirectTo }: { redirectTo?: string }) => {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { emailSchema } = createSchemas(t);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    const result = emailSchema.safeParse(value);
    setError(result.success ? "" : result.error.errors[0].message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!error && email) {
      console.log("Sending magic link to:", email);
    }
    setIsLoading(true);
    try {
      await rateLimitByIp(2, 60000);
    } catch (error) {
      console.error("Rate limit exceeded:", error);
      toast.error(t("rateLimitExceeded"));
      return;
    }
    try {
      await signIn(ProviderId.RESEND, {
        redirectTo,
        email,
        redirect: false,
      });
      toast.success(t("magicLinkSent"));
      window.location.href = `/${locale}/magic-link-sent?email=${email}`;
    } catch (error) {
      toast.error(error as string);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-2">
        <Input
          id="magic-email"
          type="email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          placeholder="username@example.com"
          required
          disabled={isLoading}
          className="h-8 w-full rounded-full text-center text-sm md:h-20 md:text-2xl"
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>

      <Button
        type="submit"
        disabled={!!error || !email || isLoading}
        className="h-8 w-full rounded-full text-sm md:h-20 md:text-2xl"
      >
        <Mail className="mr-2 h-4 w-4 md:h-15 md:w-15" />
        {isLoading ? t("sendingMagicLink") : t("sendMagicLink")}
      </Button>
    </form>
  );
};
