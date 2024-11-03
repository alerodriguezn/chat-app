"use server";

import { prisma } from "@/lib/prisma";

export const addBot = async (conversationId: string, bot: "TASK" | "WEATHER") => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (conversation.conversationBots.includes(bot)) {
    throw new Error("Bot already in conversation");
  }

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      conversationBots: {
        push: bot,
      },
    },
  });
};