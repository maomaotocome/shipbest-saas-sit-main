"use client";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

export default function MagicLinkSent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const t = useTranslations("auth");

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">{t("magicLinkSentTitle")}</h1>
      <p className="mt-4 text-lg">
        {t("magicLinkSentDescription")} <strong>{email}</strong>
      </p>
    </div>
  );
}
