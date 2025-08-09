import { Role } from "@/db/generated/prisma";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { isAdminEmail } from "./utils";
const prismaAdapter = PrismaAdapter(prisma);

export const customPrismaAdapter = {
  ...prismaAdapter,

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createUser: async (data: any) => {
    if (!prismaAdapter.createUser) {
      throw new Error("createUser is not defined");
    }
    const role = (await isAdminEmail(data.email)) ? Role.ADMIN : Role.USER;
    return prismaAdapter.createUser({ ...data, role });
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateUser: async (data: any) => {
    if (!prismaAdapter.updateUser) {
      throw new Error("updateUser is not defined");
    }
    const role =
      data.role === Role.USER && (await isAdminEmail(data.email)) ? Role.ADMIN : Role.USER;
    return prismaAdapter.updateUser({ ...data, role });
  },
};
