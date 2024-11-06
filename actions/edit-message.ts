"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from 'bcrypt';

export const editMessage = async (
  messageId: string,
  userId: string,
  newContent: string
) => {
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      senderId: userId,
    },
  });

  if (!message) {
    throw new Error('Mensaje no encontrado o no tienes permiso para editar este mensaje');
  }

  // Encriptar el nuevo contenido del mensaje
  const salt = await bcrypt.genSalt(10);
  const encryptedContent = await bcrypt.hash(newContent, salt);

  const updatedMessage = await prisma.message.update({
    where: {
      id: messageId,
    },
    data: {
      content: encryptedContent,
      wasEdited: true,
      updatedAt: new Date(), 
    },
  });

  return updatedMessage;
};