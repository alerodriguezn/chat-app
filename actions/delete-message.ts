"use server";

import { prisma } from "@/lib/prisma";
import { pusherEvents } from "@/lib/pusher";
import { pusherServer } from "@/lib/pusher";

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

  await pusherServer.trigger(
    conversationId,
    pusherEvents.DELETE_MESSAGE,
    { messageId }
  );

  const updatedConversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    include: {
      users: true,
      messages: {
        include: {
          seen: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      },
    },
  });

  updatedConversation?.users.forEach((user) => {
    pusherServer.trigger(user.email!, pusherEvents.UPDATE_CONVERSATION, {
      id: conversationId,
      messages: updatedConversation.messages,
    });
  });



  console.log('Mensaje eliminado exitosamente!');
};