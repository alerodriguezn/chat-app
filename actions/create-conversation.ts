"use server";

import { prisma } from "@/lib/prisma";

export const createConversation = async (
  creatorId: string,
  otherUserId: string
) => {
  const creator = await prisma.user.findUnique({ where: { id: creatorId } });
  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
  });

  if (!creator || !otherUser) {
    throw new Error("User/Users not found");
  }

  const existingConversation = await prisma.conversation.findFirst({
    where: {
      AND: [{ userIds: { has: creatorId } }, { userIds: { has: otherUserId } }],
    },
  });

  if (existingConversation) {
    throw new Error("Conversation already exists");
  }

  const conversation = await prisma.conversation.create({
    data: {
      userIds: [creatorId, otherUserId],
      users: {
        connect: [{ id: creatorId }, { id: otherUserId }],
      },
    },
  });

  //redirectToChat(conversation.id);
  

  return conversation;
};
