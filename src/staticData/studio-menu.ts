import { getTranslations } from "next-intl/server";

export const getMenuItems = async () => {
  const t = await getTranslations("studio.menu");
  return [
    {
      items: [
        {
          icon: "Home",
          label: t("home"),
          href: "/studio",
        },
      ],
    },
    {
      label: t("image"),
      items: [
        {
          icon: "Image",
          label: t("text-to-image"),
          href: "/studio/text-to-image",
        },
        {
          icon: "ImageIcon",
          label: t("image-to-image"),
          href: "/studio/image-to-image",
        },
        {
          icon: "Palette",
          label: t("stylize-anime"),
          href: "/studio/stylize-anime",
        },
      ],
    },
    {
      label: t("video"),
      items: [
        {
          icon: "Video",
          label: t("image-to-video"),
          href: "/studio/image-to-video",
        },
        {
          icon: "Film",
          label: t("text-to-image"),
          href: "/studio/text-to-image",
        },
      ],
    },
  ];
};
