import Workspace from "@/components/common/workspace";
import { getTranslations } from "next-intl/server";
import { getMenuItems } from "../pages/playground/menu";
export default async function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTranslations("playground");

  return (
    <div className="h-screen overflow-hidden">
      <Workspace
        params={{
          menuGroups: await getMenuItems(),
          projcectConfig: {
            title: t("chat.title"),
            fetchUrl: "/api/playground/history",
            queryKey: "chat-history",
            urlPrefix: "/playground",
          },
          noPadding: true,
        }}
      >
        {children}
      </Workspace>
    </div>
  );
}
