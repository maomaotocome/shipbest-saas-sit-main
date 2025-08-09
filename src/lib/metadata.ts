"use server";
import { defaultLocale, Locale, locales } from "@/i18n/locales";
import { Metadata } from "next";
import { getLocale } from "next-intl/server";

interface GenerateMetadataParams {
  params: {
    title: string;
    description: string;
    keywords: string;
    coverImageUrl?: string;
    uri?: string;
    noIndex?: boolean;
  };
}

export async function getMetadata({
  params: { title, description, keywords, coverImageUrl, uri, noIndex = false },
}: GenerateMetadataParams): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  return {
    title: title,
    description: description,
    keywords: keywords,
    robots: noIndex ? "noindex" : undefined,
    ...(uri && {
      alternates: {
        canonical: `${siteUrl}${locale === defaultLocale ? "" : "/" + locale}${uri !== "" && uri !== "/" ? uri : "/"}`,
        languages: locales
          .filter((l) => l !== locale)
          .reduce(
            (acc, l) => ({
              ...acc,
              [l]: `${siteUrl}${l === defaultLocale ? "" : "/" + l}${uri !== "" ? uri : "/"}`,
            }),
            {}
          ),
      },
    }),
    openGraph: {
      title: title,
      description: description,
      ...(uri && {
        url: `${siteUrl}${locale === defaultLocale ? "" : "/" + locale}${uri !== "" ? "/" + uri : "/"}`,
      }),
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || "Example",
      images: [
        {
          url: coverImageUrl || `${siteUrl}/images/og-image.webp`,
          width: 1200,
          height: 630,
          alt: process.env.NEXT_PUBLIC_SITE_NAME || "Example",
        },
      ],
      locale: locale,
      type: "website",
    },
    twitter: {
      site: process.env.NEXT_PUBLIC_TWITTER_ID || "@example",
      card: "summary_large_image",
      title: title,
      description: description,
      images: [coverImageUrl || `${siteUrl}/images/og-image.webp`],
    },
  };
}
