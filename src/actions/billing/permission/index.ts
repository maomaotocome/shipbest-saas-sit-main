"use server";

import { auth } from "@/lib/auth";
import { hasValidPrivateTaskPermission } from "@/services/billing/utils/permission";

export async function checkPrivateTaskPermission(): Promise<{
  hasPermission: boolean;
  isLoggedIn: boolean;
}> {
  const session = await auth();

  if (!session?.user) {
    return {
      hasPermission: false,
      isLoggedIn: false,
    };
  }

  const hasPermission = await hasValidPrivateTaskPermission(session.user.id);

  return {
    hasPermission,
    isLoggedIn: true,
  };
}
