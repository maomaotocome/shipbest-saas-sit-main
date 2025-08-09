import { getTranslations } from "next-intl/server";

export const getMenuItems = async () => {
  const t = await getTranslations("admin.menu");
  return [
    {
      label: t("general"),
      items: [
        {
          icon: "Home",
          label: t("home"),
          href: "/admin",
        },
        {
          icon: "Users",
          label: t("users"),
          href: "/admin/users",
        },
        {
          icon: "Bell",
          label: t("notifications"),
          href: "/admin/notifications",
        },
        {
          icon: "FolderTree",
          label: t("oss"),
          href: "/admin/oss",
        },
        {
          icon: "Settings",
          label: t("settings"),
          href: "/admin/settings",
        },
      ],
    },
    {
      label: t("content"),
      items: [
        {
          icon: "Search",
          label: t("explore"),
          href: "/admin/explore",
        },
        {
          icon: "FileText",
          label: t("blog"),
          href: "#",
          children: [
            {
              icon: "FileEdit",
              label: t("posts"),
              href: "/admin/blog/posts",
            },
            {
              icon: "Tags",
              label: t("tags"),
              href: "/admin/blog/tags",
            },
            {
              icon: "FolderTree",
              label: t("categories"),
              href: "/admin/blog/categories",
            },
          ],
        },
      ],
    },
    {
      label: t("billing"),
      items: [
        {
          icon: "Store",
          label: t("providers"),
          href: "/admin/billing/payment-providers",
        },
        {
          icon: "Package",
          label: t("plans"),
          href: "/admin/billing/plans",
        },
        {
          icon: "Receipt",
          label: t("subscriptions"),
          href: "/admin/billing/subscriptions",
        },
        {
          icon: "ShoppingCart",
          label: t("purchases"),
          href: "/admin/billing/purchases",
        },
        {
          icon: "Handshake",
          label: t("affiliates"),
          href: "/admin/billing/affiliates",
        },
        {
          icon: "FileText",
          label: t("invoice"),
          href: "/admin/billing/invoice",
        },
      ],
    },
  ];
};
