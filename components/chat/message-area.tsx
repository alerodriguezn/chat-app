"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendMessage } from "@/actions/send-message";
import { updateMessage } from "@/actions/edit-message";
import { deleteMessage } from "@/actions/delete-message";
import { Button } from "@/components/ui/button";
import { pusherClient, pusherEvents } from "@/lib/pusher";
import { FullMessageType } from "@/types";
import { find } from "lodash";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Trash2, Pencil } from "lucide-react";
import CryptoJS from "crypto-js";
import Image from "next/image";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface Props {
  initialMessages: FullMessageType[];
  currentUserId: string;
  conversationId: string;
}

export default function MessageArea({
  initialMessages = [],
  currentUserId,
  conversationId,
}: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mediaFileName, setMediaFileName] = useState<string | null>(null);

  // Filtrar mensajes según el término de búsqueda
  const filteredMessages = messages.filter((message) =>
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    pusherClient.subscribe(conversationId);
    bottomRef?.current?.scrollIntoView({ behavior: "smooth" });

    const messageHandler = (message: FullMessageType) => {
      setMessages((current) => {
        if (find(current, { id: message.id })) {
          return current;
        }
        // Decrypt once and memoize
        const decryptedContent = message.content
          ? CryptoJS.AES.decrypt(
              message.content,
              process.env.NEXT_PUBLIC_ENCRYPTION_KEY!
            ).toString(CryptoJS.enc.Utf8)
          : message.content;
        
        const decryptedMessage = {
          ...message,
          content: decryptedContent
        };
        
        const newMessages = [...current, decryptedMessage];
        requestAnimationFrame(() => {
          bottomRef?.current?.scrollIntoView({ behavior: "smooth" });
        });
        return newMessages;
      });
    };

    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages((current) =>
        current.map((currentMessage) => {
          if (currentMessage.id === newMessage.id) {
            // Decrypt the new message content if it exists
            return {
              ...newMessage,
              content: newMessage.content
                ? CryptoJS.AES.decrypt(
                    newMessage.content,
                    process.env.NEXT_PUBLIC_ENCRYPTION_KEY!
                  ).toString(CryptoJS.enc.Utf8)
                : newMessage.content,
            };
          }
          return currentMessage;
        })
      );
    };

    const deleteMessageHandler = ({ messageId }: { messageId: string }) => {
      setMessages((current) => 
        current.filter((message) => message.id !== messageId)
      );
    };

    pusherClient.bind(pusherEvents.NEW_MESSAGE, messageHandler);
    pusherClient.bind(pusherEvents.UPDATE_MESSAGE, updateMessageHandler);
    pusherClient.bind(pusherEvents.DELETE_MESSAGE, deleteMessageHandler);

    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind(pusherEvents.NEW_MESSAGE, messageHandler);
      pusherClient.unbind(pusherEvents.UPDATE_MESSAGE, updateMessageHandler);
      pusherClient.unbind(pusherEvents.DELETE_MESSAGE, deleteMessageHandler);
    };
  }, [conversationId]);

  useEffect(() => {
    fetch('/api')
  },[])

  const handleSendMessage = useCallback(async () => {
    if (!message && !mediaFile) return;

    setIsUploading(true);
    const formData = new FormData();
    if (mediaFile) {
      formData.append("file", mediaFile);
      setMediaFileName(mediaFile.name);
    }
    formData.append("content", message);
    formData.append("conversationId", conversationId);
    formData.append("senderId", currentUserId);

    try {
      await sendMessage(formData);
      setMessage("");
      setMediaFile(null);
      setMediaFileName(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsUploading(false);
    }
  }, [message, mediaFile, conversationId, currentUserId]);

  return (
    <div className="flex flex-col justify-between gap-0 h-[90vh]">
      <div className="flex items-center">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
          placeholder="Buscar mensajes..."
        />
      </div>
      <ScrollArea className="flex-grow rounded-md border p-4">
        {filteredMessages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start space-x-2 mb-4 ${
              message.sender.id === currentUserId
                ? "justify-end"
                : "justify-start"
            }`}
          >
            {message.sender.id !== currentUserId && (
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={message.sender.image || undefined}
                  alt={message.sender.name || undefined}
                />
                <AvatarFallback>
                  {message.sender.name?.[0] || ""}
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={`rounded-lg p-3 max-w-[70%] ${
                message.sender.id === currentUserId
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <ContextMenu>
                <ContextMenuTrigger>
                  <div className="font-semibold mb-1">
                    {message.sender.name}
                  </div>
                  {message.mediaUrl ? (
                    message.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/) ? (
                      <Image
                        src={message.mediaUrl}
                        alt="Media"
                        className="max-w-full h-auto rounded-lg"
                        width={300}
                        height={300}
                      />
                    ) : message.mediaUrl.match(/\.(mp4|webm|ogg)$/) ? (
                      <video controls className="max-w-full h-auto">
                        <source src={message.mediaUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <a
                        href={message.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View Media
                      </a>
                    )
                  ) : editingMessageId === message.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        className="flex-grow"
                      />
                      <Button 
                        onClick={async () => {
                          try {
                            await updateMessage(conversationId, message.id, editMessage, currentUserId);
                            setEditingMessageId(null);
                          } catch (error) {
                            console.error("Failed to update message:", error);
                          }
                        }}
                      >
                        Save
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => setEditingMessageId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {message.content}
                      {message.wasEdited && (
                        <span className="text-xs ml-2 opacity-60">(edited)</span>
                      )}
                    </div>
                  )}
                </ContextMenuTrigger>
                <ContextMenuContent>
                  {message.sender.id === currentUserId && !message.mediaUrl && (
                    <ContextMenuItem>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-blue-500 hover:text-blue-600"
                        onClick={() => {
                          setEditingMessageId(message.id);
                          setEditMessage(message.content || "");
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Message
                      </Button>
                    </ContextMenuItem>
                  )}
                  {message.sender.id === currentUserId && (
                    <ContextMenuItem>
                      <Button
                        variant="ghost" 
                        className="w-full justify-start text-red-500 hover:text-red-600"
                        onClick={async () => {
                          try {
                            await deleteMessage(conversationId, message.id, currentUserId);
                          } catch (error) {
                            console.error("Failed to delete message:", error);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Message
                      </Button>
                    </ContextMenuItem>
                  )}
                </ContextMenuContent>
              </ContextMenu>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </ScrollArea>
      <div className="flex items-center space-x-2 bg-background rounded p-2">
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow"
          placeholder="Write a message..."
        />
        {mediaFileName && (
          <span className="text-sm text-gray-500">{mediaFileName}</span>
        )}
        <div className="relative">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              setMediaFile(e.target.files?.[0] || null);
              setMediaFileName(e.target.files?.[0]?.name || null);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="file-input"
          />
          <Button
            variant="ghost"
            size="icon"
            className={mediaFile ? "text-primary" : ""}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
        </div>
        <Button onClick={handleSendMessage} disabled={isUploading}>
          {isUploading ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}