"use server";

import { prisma } from "@/lib/prisma";
import { pusherServer, pusherEvents } from "@/lib/pusher";
import CryptoJS from 'crypto-js';

export const updateMessage = async (
  conversationId: string,
  messageId: string,
  content: string,
  userId: string
) => {
  // Verify conversation exists
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        where: { id: messageId },
      },
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // Verify message exists and belongs to user
  const message = conversation.messages[0];
  if (!message || message.senderId !== userId) {
    throw new Error("Message not found or unauthorized");
  }

  // Encrypt the new content
  const encryptedContent = CryptoJS.AES.encrypt(content, process.env.ENCRYPTION_KEY!).toString();

  // Update the message
  const updatedMessage = await prisma.message.update({
    where: { id: messageId },
    data: { content: encryptedContent, wasEdited: true },
    include: {
      seen: true,
      sender: true,
    },
  });

  // Trigger Pusher event to update message in real-time
  await pusherServer.trigger(
    conversationId,
    pusherEvents.UPDATE_MESSAGE,
    updatedMessage
  );

  return updatedMessage;
};
