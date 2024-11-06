"use server";

import { prisma } from "@/lib/prisma";

export const getUsersWithConversations = async (userId: string) => {
  try {
    // Obtiene las conversaciones en las que el usuario actual ha enviado al menos un mensaje
    const conversations = await prisma.conversation.findMany({
      where: {
        messages: {
          some: {
            senderId: userId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    // Extrae los IDs de las conversaciones
    const conversationIds = conversations.map((conversation) => conversation.id);

    // Obtiene los usuarios que participan en esas conversaciones, excluyendo al usuario actual
    const users = await prisma.user.findMany({
      where: {
        conversations: {
          some: {
            id: { in: conversationIds },
          },
        },
        id: { not: userId }, // Excluye al usuario actual
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return users;
  } catch (error) {
    console.error("Error al obtener los usuarios con conversaciones:", error);
    throw new Error("No se pudieron recuperar los usuarios con los que se inició una conversación");
  }
};