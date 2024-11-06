"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from 'bcrypt';

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string
) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const sender = await prisma.user.findUnique({
    where: { id: senderId },
  });

  if (!sender) {
    throw new Error("Sender not found");
  }

  // Encriptar el contenido del mensaje
  const salt = await bcrypt.genSalt(10);
  const encryptedContent = await bcrypt.hash(content, salt);

  const message = await prisma.message.create({
    data: {
      content: encryptedContent,
      conversation: {
        connect: { id: conversationId },
      },
      sender: {
        connect: { id: senderId },
      },
    },
  });

  return message;
};