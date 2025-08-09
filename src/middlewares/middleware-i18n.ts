import { routing } from "@/i18n/routing";
import createIntlMiddleware from "next-intl/middleware";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import type { CustomMiddleware, MiddlewareFactory } from "./chain";
export const withI18nMiddleware: MiddlewareFactory = (next: CustomMiddleware) => {
  const intlMiddleware = createIntlMiddleware(routing);

  return async (request: NextRequest, event: NextFetchEvent, response: NextResponse) => {
    try {
      const pathname = request.nextUrl.pathname;
      const locale = pathname.split("/")[1] || routing.defaultLocale;

      if (pathname.startsWith("/api")) {
        return next(request, event, response);
      }

      const intlResponse = await intlMiddleware(request);

      if (intlResponse) {
        return intlResponse;
      }

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-locale", locale);
      const newRequest = new NextRequest(request.url, {
        ...request,
        headers: requestHeaders,
      });

      return next(newRequest, event, response);
    } catch (error) {
      return new NextResponse(error as string, { status: 500 });
    }
  };
};
