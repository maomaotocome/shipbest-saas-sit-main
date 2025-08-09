import { prisma } from "@/lib/prisma";

export async function getAllAuthors() {
  return prisma.blogAuthor.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getAuthorById(id: string) {
  return prisma.blogAuthor.findUnique({
    where: { id },
  });
}
