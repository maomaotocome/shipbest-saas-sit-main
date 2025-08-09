import { chain } from "@/middlewares/chain";
import { withAuthMiddleware } from "@/middlewares/middleware-auth";
import { withI18nMiddleware } from "@/middlewares/middleware-i18n";

export default chain([withAuthMiddleware, withI18nMiddleware]);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|ads.txt|about|contact|privacy-policy|terms-and-conditions).*)",
  ],
};
