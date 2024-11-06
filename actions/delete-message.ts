"use server";

import { prisma } from "@/lib/prisma";

export const deleteMessage = async (conversationId: string, messageId: string, userId: string) => {
  
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      conversationId: conversationId,
      sender: {
        id: userId,
      },
    },
  });

  if (!message) {
    throw new Error('Mensaje no encontrado o no tienes permiso para eliminar este mensaje');
  }

  await prisma.message.delete({
    where: {
      id: messageId,
    },
  });

  console.log('Mensaje eliminado exitosamente!');
};