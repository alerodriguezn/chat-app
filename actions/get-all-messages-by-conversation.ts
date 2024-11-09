"use server";
import { prisma } from "@/lib/prisma";
import CryptoJS from 'crypto-js';

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

    const decryptedMessages = messages.map((message) => ({
      ...message,
      content: message.content
        ? CryptoJS.AES.decrypt(
            message.content,
            process.env.ENCRYPTION_KEY!
          ).toString(CryptoJS.enc.Utf8)
        : message.content,
    }));

    console.log(decryptedMessages);
    return decryptedMessages;

    
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default getAllMessagesByConversation;
