/** @type {import('next-sitemap').IConfig} */

const exclude = [
  "/api/*",
  "/_next/*",
  "/_static/*",
  "/_error/*",
  "/_redirects/*",
  "/admin/*",
  "/user/*",
  "/auth/*",
  "/playground/*",
  "/share/*",
];
const locales = ["en", "de", "fr", "es", "it", "pt", "ru", "zh", "zh-HK"];
const defaultLocale = "en";
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: exclude,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: exclude,
      },
    ],
  },
  alternateRefs: [
    {
      href: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
      hreflang: defaultLocale,
    },
    ...locales.map((locale) => ({
      href: process.env.NEXT_PUBLIC_SITE_URL + "/" + locale,
      hreflang: locale,
    })),
  ],
};
