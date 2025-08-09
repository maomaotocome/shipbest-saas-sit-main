"use server";

import { auth } from "@/lib/auth";
import { hasValidPrivateTaskPermission } from "@/services/billing/utils/permission";

export async function permission() {
  try {
    const session = await auth();
    if (!session)
      return {
        permission: {
          private_task: false,
          studio: false,
        },
      };

    const hasPermission = await hasValidPrivateTaskPermission(session.user.id);

    return {
      permission: {
        private_task: hasPermission,
        studio: hasPermission,
      },
    };
  } catch (error) {
    console.error("Error checking private task permission:", error);
    return {
      permission: {
        private_task: false,
        studio: false,
      },
    };
  }
}
