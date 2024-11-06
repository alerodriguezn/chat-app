"use server";
import { prisma } from "@/lib/prisma";

export const getUsersWithConversations = async (userId: string) => {
  const userConversations = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      conversations: {
        select: {
          id: true,
          name: true,
          users: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return userConversations;
};
