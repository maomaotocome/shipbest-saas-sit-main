import { Role, User } from "@/db/generated/prisma";
import { customPrismaAdapter } from "@/lib/auth/adapter";
import { ProviderId } from "@/lib/auth/providers/enum";
import { validateTurnstileToken } from "@/lib/trunslite";
import bcryptjs from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { isAdminEmail } from "../utils";
interface AdapterUser extends User {
  password: string;
}

export enum Action {
  SignIn = "signIn",
  SignUp = "signUp",
}

export const passwordProvider = CredentialsProvider({
  id: ProviderId.PASSWORD,
  name: ProviderId.PASSWORD,
  credentials: {
    email: { label: "Email", type: "text", placeholder: "username@example.com" },
    password: { label: "Password", type: "password" },
    action: { label: "Action", type: "text" },
    turnstileToken: { label: "Turnstile Token", type: "text" },
  },

  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      throw new Error("Please enter an email or password");
    }

    // Validate Turnstile token if provided
    if (process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY) {
      const token = credentials.turnstileToken as string;
      const isValid = token && (await validateTurnstileToken(token));
      if (!isValid) {
        throw new Error("Invalid Turnstile token");
      }
    }

    const { createUser, getUserByEmail } = customPrismaAdapter;
    const user = getUserByEmail && (await getUserByEmail(credentials.email as string));

    // Use action parameter to distinguish between login and registration
    if (credentials.action === Action.SignUp) {
      if (user) {
        throw new Error("User already exists");
      }
      return await createUser({
        email: credentials.email as string,
        password: bcryptjs.hashSync(credentials.password as string, 10),
        role: (await isAdminEmail(credentials.email as string)) ? Role.ADMIN : Role.USER,
        emailVerified: null,
      });
    }

    // Login logic
    const adapterUser = user as AdapterUser & { password: string };
    if (!adapterUser?.password) {
      throw new Error("No user found");
    }

    const passwordMatch = await bcryptjs.compare(
      credentials.password as string,
      adapterUser.password
    );

    if (
      !passwordMatch &&
      ("development" !== process.env.NODE_ENV || !(await isAdminEmail(credentials.email as string)))
    ) {
      throw new Error("Incorrect password");
    }

    return user as AdapterUser;
  },
});
