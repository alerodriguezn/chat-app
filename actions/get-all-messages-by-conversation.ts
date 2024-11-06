"use server";
import { prisma } from "@/lib/prisma";

const getAllMessagesByConversation = async (conversationId: string) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
      },
      include: {
        sender: true,
        seen: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return messages;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default getAllMessagesByConversation;
