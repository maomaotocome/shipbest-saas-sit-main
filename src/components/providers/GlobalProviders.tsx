"use client";

import { type Locale } from "@/i18n/locales";
import { queryClient } from "@/lib/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

interface NestedMessages {
  [key: string]: string | NestedMessages;
}
export interface ClientProvidersProps {
  children: React.ReactNode;
  messages: NestedMessages;
  locale: Locale;
  timeZone: string;
}

export default function GlobalProviders({
  children,
  messages,
  locale,
  timeZone,
}: ClientProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <NextIntlClientProvider messages={messages} locale={locale} timeZone={timeZone}>
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster position="bottom-right" />
          </QueryClientProvider>
        </NextIntlClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
