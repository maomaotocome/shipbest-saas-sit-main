import { customPrismaAdapter } from "@/lib/auth/adapter";
import { ProviderId } from "@/lib/auth/providers/enum";
import { OAuth2Client } from "google-auth-library";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

export const GOOGLE_ONETAP_PROVIDER_ID = ProviderId.GOOGLE_ONE_TAP;
const googleAuthClient = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export const googleProvider = Google({
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});

export const googleOneTapProvider = CredentialsProvider({
  type: "credentials",
  id: GOOGLE_ONETAP_PROVIDER_ID,
  name: GOOGLE_ONETAP_PROVIDER_ID,
  credentials: {
    credential: { type: "text" },
  },
  async authorize(credentials) {
    const token = credentials!.credential as string;
    const ticket = await googleAuthClient.verifyIdToken({
      idToken: token,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Cannot extract payload from signin token");
    }
    const { email, sub, name, picture: image, email_verified, exp: expiresAt } = payload;
    if (!email) {
      throw new Error("Google account must have an email");
    }
    const { createUser, updateUser, getUserByAccount, getUserByEmail, linkAccount } =
      customPrismaAdapter;

    // Find or create user
    let user = getUserByEmail && (await getUserByEmail(email));

    if (!user) {
      // Create new user - use custom adapter to handle role assignment
      user = await createUser({
        email,
        name: name ?? null,
        image: image ?? null,
        emailVerified: email_verified ? new Date() : null,
      });
    } else {
      // Update existing user info
      user =
        updateUser &&
        (await updateUser({
          ...user,
          name: name ?? user.name,
          image: image ?? user.image,
          emailVerified: email_verified ? new Date() : user.emailVerified,
        }));
    }

    // Handle account linking
    const existingAccount =
      getUserByAccount &&
      (await getUserByAccount({
        provider: googleProvider.id,
        providerAccountId: sub,
      }));

    if (!existingAccount && user && linkAccount) {
      await linkAccount({
        userId: user.id,
        provider: googleProvider.id,
        providerAccountId: sub,
        type: googleProvider.type,
        access_token: token,
        expires_at: expiresAt, // Use actual expiration time
        token_type: "bearer",
        scope:
          "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
        id_token: token,
      });
    }

    return user || null;
  },
});
