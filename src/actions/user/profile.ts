"use server";

import { getUser, isAuthenticated } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";
import bcryptjs from "bcryptjs";
import { z } from "zod";
// Validate request body for updating user info
const updateUserSchema = z.object({
  name: z.string().optional(),
  image: z.string().url().optional(),
});

// Validate request body for updating password
const updatePasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

// Get user info
export async function getProfile() {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }

  try {
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    if (!profile) {
      throw new Error("User not found");
    }

    return profile;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Internal server error");
  }
}

export async function updateProfile(data: z.infer<typeof updateUserSchema>) {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }

  try {
    const result = updateUserSchema.safeParse(data);

    if (!result.success) {
      throw new Error("Invalid request data");
    }

    const { name, image } = result.data;

    const updateData: { name?: string; image?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image;

    if (Object.keys(updateData).length === 0) {
      throw new Error("No valid fields to update");
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Internal server error");
  }
}

export async function updatePassword(data: z.infer<typeof updatePasswordSchema>) {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }

  try {
    const result = updatePasswordSchema.safeParse(data);

    if (!result.success) {
      throw new Error("Invalid request data");
    }

    const { newPassword } = result.data;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      throw new Error("User not found");
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating password:", error);
    throw new Error("Internal server error");
  }
}
