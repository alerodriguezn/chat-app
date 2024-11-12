"use server";

import { prisma } from "@/lib/prisma";

export async function getConversationById(id: string) {
    const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: {
            users: true
        }
    });

    // Verificar si temporalMessages está activado
    const hasTemporalMessages = conversation?.temporalMessages ?? false;

    return { conversation, hasTemporalMessages };
}