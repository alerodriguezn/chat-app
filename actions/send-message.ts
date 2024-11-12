"use server";

import { prisma } from "@/lib/prisma";
import { pusherEvents, pusherServer } from "@/lib/pusher";
import { BlobServiceClient } from "@azure/storage-blob";
import CryptoJS from "crypto-js";

export const sendMessage = async (formData: FormData) => {
  const conversationId = formData.get("conversationId") as string;
  const senderId = formData.get("senderId") as string;
  const content = formData.get("content") as string;
  const mediaFile = formData.get("file") as File;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const temporalMessages = conversation.temporalMessages;

  const sender = await prisma.user.findUnique({
    where: { id: senderId },
  });

  if (!sender) {
    throw new Error("Sender not found");
  }

  const encryptedContent = CryptoJS.AES.encrypt(
    content,
    process.env.ENCRYPTION_KEY!
  ).toString();

  let mediaUrl: string | undefined;
  if (mediaFile) {
    // Upload media to Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING!
    );
    const containerClient =
      blobServiceClient.getContainerClient("blobmultimedia");

    // Generate unique filename
    const fileExtension = mediaFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExtension}`;

    // Get blob client and upload file
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    const arrayBuffer = await mediaFile.arrayBuffer();
    await blockBlobClient.uploadData(arrayBuffer, {
      blobHTTPHeaders: { blobContentType: mediaFile.type },
    });

    // Get the URL of the uploaded blob
    mediaUrl = blockBlobClient.url;
  }

  // check if the message starts with a command
  if (content.startsWith("!")) {

    const botResponse = await generateBotResponse(
      conversationId,
      content,
      senderId
    );

    const encryptedBotResponse = CryptoJS.AES.encrypt(
      botResponse!,
      process.env.ENCRYPTION_KEY!
    ).toString();


    const encryptedBotResponse = CryptoJS.AES.encrypt(
      botResponse!,
      process.env.ENCRYPTION_KEY!
    ).toString();

    if (botResponse) {
      const botMessage = await prisma.message.create({
        include: {
          seen: true,
          sender: true,
        },
        data: {
          content: encryptedBotResponse,
          conversation: {
            connect: { id: conversationId },
          },
          sender: {
            connect: { id: senderId },
          },
          seen: {
            connect: {
              id: senderId,
            },
          },
        },
      });

      const updatedConversation = await prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          updatedAt: new Date(),
          messages: {
            connect: {
              id: botMessage.id,
            },
          },
        },
        include: {
          users: true,
          messages: {
            include: {
              seen: true,
            },
          },
        },
      });

      await pusherServer.trigger(
        conversationId,
        pusherEvents.NEW_MESSAGE,
        botMessage
      );

      const lastMessage =
        updatedConversation.messages[updatedConversation.messages.length - 1];

      updatedConversation.users.map((user) => {
        pusherServer.trigger(user.email!, pusherEvents.UPDATE_CONVERSATION, {
          id: conversationId,
          messages: [lastMessage],
        });
      });

      return botMessage;
    }
  }

  let expiresAt;
  if (!temporalMessages) {
    expiresAt = new Date(new Date().setMinutes(new Date().getMinutes() + 2));
  }

  const newMessage = await prisma.message.create({
    include: {
      seen: true,
      sender: true,
    },
    data: {
      content: encryptedContent,
      mediaUrl: mediaUrl,
      expiresAt: expiresAt ? expiresAt : null,
      isExpired: temporalMessages,
      conversation: {
        connect: { id: conversationId },
      },
      sender: {
        connect: { id: senderId },
      },
      seen: {
        connect: {
          id: senderId,
        },
      },
    },
  });

  const updatedConversation = await prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      updatedAt: new Date(),
      messages: {
        connect: {
          id: newMessage.id,
        },
      },
    },
    include: {
      users: true,
      messages: {
        include: {
          seen: true,
        },
      },
    },
  });

  await pusherServer.trigger(
    conversationId,
    pusherEvents.NEW_MESSAGE,
    newMessage
  );

  const lastMessage =
    updatedConversation.messages[updatedConversation.messages.length - 1];

  updatedConversation.users.map((user) => {
    pusherServer.trigger(user.email!, pusherEvents.UPDATE_CONVERSATION, {
      id: conversationId,
      messages: [lastMessage],
    });
  });

  return newMessage;
};

const generateBotResponse = async (
  conversationId: string,
  content: string,
  senderId: string
) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  //check if the content is a command
  if (content.startsWith("!")) {
    const parts = content.split(" ");
    const command = parts[0];
    const commandValue = parts.slice(1).join(" ");

    if (command === "!weather") {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${commandValue}&appid=66ee69e42ce0105b540fa10ddd5b22ff&units=metric`
      );

      const data = await response.json();

      const weather = data.weather[0].description;
      const temperature = data.main.temp;

      return `Bot Response: The weather in ${commandValue} is ${weather} with a temperature of ${temperature}°C`;
    }


    if (command === "!addTask") {
      // Agregar tarea
      const user = await prisma.user.findUnique({ where: { id: senderId } });
      if (!user) {
        return "Bot Response: User not found";
      }
      const updatedTasks = [...user.tasks, commandValue];
      await prisma.user.update({
        where: { id: senderId },
        data: { tasks: updatedTasks },
      });
      return `Bot Response: "${commandValue}" was added to your tasks.`;
    } else if (command === "!listTask") {
      // Listar tareas
      const user = await prisma.user.findUnique({ where: { id: senderId } });
      if (!user) {
        return "Bot Response: User not found";
      }
      if (user.tasks.length === 0) {
        return "Bot Response: No tasks found";
      }
      const taskList = user.tasks
        .map((task, index) => ` [${index + 1}]: ${task}`)
      return `Bot Response: Tasks List:${taskList}`;
    } else if (command === "!deleteTask") {
      // Eliminar tarea
      const taskId = parseInt(commandValue, 10) - 1;
      const user = await prisma.user.findUnique({ where: { id: senderId } });
      if (!user) {
        return "Bot Response: User not found";
      }
      if (taskId < 0 || taskId >= user.tasks.length) {
        return "Bot Response: Invalid task ID";
      }
      const deletedTask = user.tasks[taskId];
      const updatedTasks = user.tasks.filter((_, index) => index !== taskId);
      await prisma.user.update({
        where: { id: senderId },
        data: { tasks: updatedTasks },
      });
      return `Bot Response: "${deletedTask}" was deleted from your tasks.`;
    }

    if (command === "!ai") {
      const prompt = content.split(" ").slice(1).join(" ");
      console.log(prompt);  
      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, 
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const aiData = await aiResponse.json();
      const aiMessage = aiData.choices[0].message.content; // Extract the AI's response

      return aiMessage; // Return the AI's response
    }

    // !addTask Limpiar el cuarto 
    // !listTasks 
    // !deleteTask 1
    if (command === "!addTask") {
      //insertar en la base de datos en la tabla usuarios
      // const user = await prisma.user.findUnique({
      //   where: { id: senderId },
      // });

      // user?.tasks.push(commandValue);
      return "Task command detected";
    } else if (command === "!listTasks") {
      //select de todos los tasks del usuario, devolver un array de strings con los indices de los tasks
      return "List of tasks";
    } else if (command === "!deleteTask") {
      //delete la tarea
      return "Task deleted";

    }
  }
};
