"use server";

import { Role } from "@/db/generated/prisma";
import { auth } from ".";

export async function isAdminEmail(email: string) {
  const adminEmails = process.env.PRESET_ADMIN_EMAILS?.split(",") || [];
  return adminEmails.includes(email);
}

export async function isAdmin() {
  const session = await auth();
  if (!session?.user) {
    return false;
  }
  return session.user.role === Role.ADMIN;
}

export async function getUser() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session.user;
}
export async function isAuthenticated() {
  const session = await auth();
  return !!session?.user;
}
