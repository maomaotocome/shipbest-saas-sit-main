import { Prisma, Role } from "@/db/generated/prisma";
import { type Locale } from "@/i18n/locales";
import { prisma } from "@/lib/prisma";
import { paginatePrismaQuery } from "@/lib/utils";
import { ModelDelegate, PaginatedResponse, PaginationParams } from "@/types/pagination";

export type UserListItem = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    emailVerified: true;
    image: true;
    role: true;
  };
}>;

interface GetUsersParams extends PaginationParams {
  search?: string;
  searchName?: string;
  searchEmail?: string;
}

export async function getAllUsers({
  search,
  searchName,
  searchEmail,
  page,
  pageSize,
}: GetUsersParams): Promise<PaginatedResponse<UserListItem>> {
  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
      { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
      { id: { contains: search, mode: Prisma.QueryMode.insensitive } },
    ];
  } else {
    const andConditions: Prisma.UserWhereInput[] = [];
    if (searchName) {
      andConditions.push({
        name: { contains: searchName, mode: Prisma.QueryMode.insensitive },
      });
    }
    if (searchEmail) {
      andConditions.push({
        email: { contains: searchEmail, mode: Prisma.QueryMode.insensitive },
      });
    }
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }
  }

  const prismaArgs: Omit<Prisma.UserFindManyArgs, "skip" | "take"> = {
    where,
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
    },
  };

  return paginatePrismaQuery<UserListItem, Prisma.UserCountArgs, Prisma.UserFindManyArgs>(
    prisma.user as unknown as ModelDelegate<
      Prisma.UserCountArgs,
      Prisma.UserFindManyArgs,
      UserListItem
    >,
    { page, pageSize },
    prismaArgs
  );
}

export async function updateUserLocale(id: string, locale: Locale) {
  return prisma.user.update({
    where: { id },
    data: { locale },
  });
}

export async function updateUserRole(id: string, role: Role) {
  return prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
    },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
    },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
    },
  });
}
