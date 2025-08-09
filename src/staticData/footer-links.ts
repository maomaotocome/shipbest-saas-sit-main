"use client";

import { useLocale, useTranslations } from "next-intl";

export interface FooterLink {
  href: string;
  label: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export const useFooterLinks = () => {
  const locale = useLocale();
  const t = useTranslations("footer.links");

  return [
    {
      title: t("videoTools.title"),
      links: [
        { href: `/${locale}/video/ai-video-generator`, label: t("videoTools.aiVideoGenerator") },
        { href: `/${locale}/video/image-to-video`, label: t("videoTools.imageToVideo") },
        { href: `/${locale}/video/video-to-video`, label: t("videoTools.videoToVideo") },
        {
          href: `/${locale}/video/consistent-character`,
          label: t("videoTools.consistentCharacter"),
        },
        { href: `/${locale}/video/video-enhancer`, label: t("videoTools.videoEnhancer") },
      ],
    },
    {
      title: t("videoModels.title"),
      links: [
        { href: `/${locale}/models/kling-ai`, label: t("videoModels.klingAi") },
        { href: `/${locale}/models/runway`, label: t("videoModels.runway") },
        { href: `/${locale}/models/vidu-ai`, label: t("videoModels.viduAi") },
        { href: `/${locale}/models/luma-ai`, label: t("videoModels.lumaAi") },
        { href: `/${locale}/models/pixverse-ai`, label: t("videoModels.pixverseAi") },
      ],
    },
    {
      title: t("company.title"),
      links: [
        { href: `/about`, label: t("company.aboutUs") },
        { href: `/contact`, label: t("company.contactUs") },
        { href: `/pricing`, label: t("company.pricing") },
        { href: `/community`, label: t("company.community") },
        { href: `/resources`, label: t("company.resources") },
        { href: `/terms-and-conditions`, label: t("company.termsAndConditions") },
        { href: `/privacy-policy`, label: t("company.privacyPolicy") },
      ],
    },
  ] as FooterSection[];
};
