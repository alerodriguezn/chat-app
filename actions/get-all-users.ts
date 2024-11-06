"use server";

import { prisma } from "@/lib/prisma";

export const getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return users;
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    throw new Error("No se pudieron recuperar los usuarios");
  }
};  