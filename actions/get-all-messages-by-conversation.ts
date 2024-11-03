"use server";
import { prisma } from "@/lib/prisma";

export const getAllMessagesByConversation = async (conversationId: string) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        content: true,
        mediaUrl: true,
        wasEdited: true,
        expiresAt: true,
        isExpired: true,
        createdAt: true,
        updatedAt: true,
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return messages;
  } catch (error) {
    console.error("Error al obtener mensajes para la conversación:", error);
    throw new Error("No se pudieron recuperar los mensajes para la conversación");    
  }
};
