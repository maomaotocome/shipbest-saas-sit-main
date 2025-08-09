import { User } from "@/db/generated/prisma";
import { nodemailerProvider, resendProvider } from "@/lib/auth/providers/email";
import NextAuth, { DefaultSession, NextAuthConfig } from "next-auth";
import { customPrismaAdapter } from "./adapter";
import { googleOneTapProvider, googleProvider } from "./providers/google";
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: User & DefaultSession["user"];
  }
  export interface AdapterUser extends User {
    x: string;
  }
}

export const authOptions: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: customPrismaAdapter,
  providers: [
    googleOneTapProvider,
    googleProvider,
    ...(resendProvider ? [resendProvider] : []),
    ...(nodemailerProvider ? [nodemailerProvider] : []),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        return {
          ...session,
          user: {
            ...session.user,
            role: token.role,
            id: token.sub,
            image: token.picture,
            locale: token.locale,
            createdAt: token.createdAt,
          },
        };
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        return {
          ...token,
          ...session?.user,
          image: session?.user?.image,
          role: session?.user?.role,
          locale: session?.user?.locale,
          createdAt: session?.user?.createdAt,
        };
      }

      if (user) {
        return {
          ...token,
          uid: user.id,
          image: user.image,
          role: (user as User).role,
          locale: (user as User).locale,
          createdAt: (user as User).createdAt,
        };
      }
      return token;
    },
  },
};
export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
