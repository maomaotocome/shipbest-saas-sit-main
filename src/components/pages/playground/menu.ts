import { getTranslations } from "next-intl/server";

export const getMenuItems = async () => {
  const t = await getTranslations("playground");
  return [
    {
      items: [
        {
          icon: "New",
          label: t("new"),
          href: "/playground/",
        },
        {
          icon: "History",
          label: t("history"),
          href: "/playground/history",
        },
      ],
    },
  ];
};
