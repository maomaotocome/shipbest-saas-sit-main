import Workspace from "@/components/common/workspace";
import { Locale } from "@/i18n/locales";
import { getUser } from "@/lib/auth/utils";
import { getMetadata } from "@/lib/metadata";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getMenuItems } from "../../staticData/user-menu";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  if (!user) {
    redirect("/");
  }
  return <Workspace params={{ menuGroups: await getMenuItems() }}>{children}</Workspace>;
}

type Props = {
  params: Promise<{ locale: Locale; uri?: string[] }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("user.dashboard.metadata");
  return getMetadata({
    params: {
      title: t("title") + " | " + process.env.NEXT_PUBLIC_SITE_NAME,
      description: t("description"),
      keywords: t("keywords"),
      uri: `${locale}/user`,
      noIndex: true,
    },
  });
}
