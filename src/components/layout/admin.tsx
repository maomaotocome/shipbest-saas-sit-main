import Workspace from "@/components/common/workspace";
import { Locale } from "@/i18n/locales";
import { isAdmin } from "@/lib/auth/utils";
import { getMetadata } from "@/lib/metadata";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getMenuItems } from "../../staticData/admin-menu";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    redirect(`/${locale}`);
  }
  return <Workspace params={{ menuGroups: await getMenuItems() }}>{children}</Workspace>;
}

type Props = {
  params: Promise<{ locale: Locale; uri?: string[] }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("admin.dashboard.metadata");
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "";

  return getMetadata({
    params: {
      title: `${t("title")} | ${siteName}`,
      description: t("description"),
      keywords: t("keywords"),
      uri: `${locale}/admin`,
      noIndex: true,
    },
  });
}
