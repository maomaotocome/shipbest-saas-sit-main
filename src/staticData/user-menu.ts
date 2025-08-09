import { getTranslations } from "next-intl/server";

export const getMenuItems = async () => {
  const t = await getTranslations("user.menu");
  return [
    {
      items: [
        {
          icon: "Home",
          label: t("home"),
          href: "/user",
        },
      ],
    },
    {
      label: t("account"),
      items: [
        {
          icon: "Coins",
          label: t("credits"),
          href: "/user/credits",
        },
        {
          icon: "Users",
          label: t("teams"),
          href: "/user/teams",
        },
        {
          icon: "Bell",
          label: t("notifications"),
          href: "/user/notifications",
        },
        {
          icon: "FolderOpen",
          label: t("library"),
          href: "/user/library",
        },
        {
          icon: "User",
          label: t("profile"),
          href: "/user/profile",
        },
      ],
    },
    {
      label: t("billing"),
      items: [
        {
          icon: "FileText",
          label: t("invoice"),
          href: "/user/invoices",
        },
        {
          icon: "CreditCard",
          label: t("subscriptions"),
          href: "/user/subscriptions",
        },
        {
          icon: "Handshake",
          label: t("affiliates"),
          href: "/user/affiliates",
        },
        {
          icon: "ShoppingCart",
          label: t("purchases"),
          href: "/user/purchases",
        },
      ],
    },
  ];
};
