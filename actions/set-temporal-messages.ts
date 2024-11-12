"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const setTemporalMessages = async (conversationId: string) => {
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  await prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      temporalMessages: !conversation.temporalMessages,
    },
  });

  revalidatePath(`/chat/${conversationId}`);

  return {
    success: true,
  };
}
