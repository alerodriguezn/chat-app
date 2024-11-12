import { prisma } from "@/lib/prisma";


export const deleteExpiredMessages = async () => {
  const expiredMessages = await prisma.message.findMany({
    where: {
      isExpired: true,
    },
  });

  if (expiredMessages.length === 0) {
    console.log("No expired messages found.");
    return;
  }

  await prisma.message.deleteMany({
    where: {
      isExpired: true,
    },
  });


  console.log(
    `${expiredMessages.length} expired messages deleted successfully!`
  );
};
