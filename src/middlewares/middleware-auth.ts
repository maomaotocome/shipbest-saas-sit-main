import { Role } from "@/db/generated/prisma";
import { locales, type Locale } from "@/i18n/locales";
import { getToken } from "next-auth/jwt";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import type { CustomMiddleware, MiddlewareFactory } from "./chain";

const adminPaths = ["/admin"];
const userPaths = ["/user"];
const protectedPaths = ["/studio", ...adminPaths, ...userPaths];

function getProtectedRoutes(protectedPaths: string[], locales: Locale[]) {
  let protectedPathsWithLocale = [...protectedPaths];

  protectedPaths.forEach((route) => {
    locales.forEach(
      (locale) => (protectedPathsWithLocale = [...protectedPathsWithLocale, `/${locale}${route}`])
    );
  });
  protectedPathsWithLocale = [...protectedPathsWithLocale];
  return protectedPathsWithLocale;
}

export const withAuthMiddleware: MiddlewareFactory = (next: CustomMiddleware) => {
  return async (request: NextRequest, event: NextFetchEvent, response: NextResponse) => {
    const pathname = request.nextUrl.pathname;

    const protectedPathsWithLocale = getProtectedRoutes(protectedPaths, [...locales]);

    const isPublicPath = protectedPathsWithLocale.every((path) => !pathname.startsWith(path));

    if (isPublicPath) {
      return next(request, event, response);
    }
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NEXTAUTH_URL?.startsWith("https://") ?? true,
    });

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const adminPathsWithLocale = getProtectedRoutes(adminPaths, [...locales]);
    if (
      token.role !== Role.ADMIN &&
      adminPathsWithLocale.some((path) => pathname.startsWith(path))
    ) {
      const userUrl = new URL("/user", request.url);
      return NextResponse.redirect(userUrl);
    }

    return next(request, event, response);
  };
};
