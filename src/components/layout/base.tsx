import "@/app/globals.css";
import Providers from "@/components/providers/GlobalProviders";
import { locales, type Locale } from "@/i18n/locales";
import { getMetadata } from "@/lib/metadata";
import { getStaticData } from "@/staticData";
import { getLocale, getMessages } from "next-intl/server";
import { Lexend } from "next/font/google";
import { GoogleOneTap } from "../common/auth/google-one-tap";
import { CreditAward } from "../common/credit-award";
import { LocaleSwitchSuggest } from "../common/locale-switch-suggest";
import { UtmTracker } from "../common/utm-tracker";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const generateMetadata = async () => {
  const locale = (await getLocale()) as Locale;
  const { title, description, keywords } = await getStaticData({
    locale,
    key: "metadata",
    type: "base",
  });
  return await getMetadata({ params: { title, description, keywords } });
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = (await getLocale()) as Locale;
  const messages = await getMessages();
  const timeZone = process.env.NEXT_PUBLIC_TIME_ZONE || "UTC";
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${lexend.variable} bg-background text-foreground min-h-screen antialiased`}>
        <Providers messages={messages} locale={locale} timeZone={timeZone}>
          {children}
          <GoogleOneTap />
          <LocaleSwitchSuggest />
          <CreditAward />
          <UtmTracker />
        </Providers>
      </body>
    </html>
  );
}
