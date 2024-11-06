"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendMessage } from "@/actions/send-message";
import { Button } from "@/components/ui/button";
import { pusherClient, pusherEvents } from "@/lib/pusher";
import { FullMessageType } from "@/types";
import { find } from "lodash";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip } from "lucide-react"; // Añade esta importación al inicio

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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    pusherClient.subscribe(conversationId);
    bottomRef?.current?.scrollIntoView({ behavior: "smooth" });

    const messageHandler = (message: FullMessageType) => {
      setMessages((current) => {
        if (find(current, { id: message.id })) {
          return current;
        }
        return [...current, message];
      });
      bottomRef?.current?.scrollIntoView({ behavior: "smooth" });
    };

    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages((current) =>
        current.map((currentMessage) =>
          currentMessage.id === newMessage.id ? newMessage : currentMessage
        )
      );
    };

    pusherClient.bind(pusherEvents.NEW_MESSAGE, messageHandler);
    pusherClient.bind(pusherEvents.UPDATE_MESSAGE, updateMessageHandler);

    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind(pusherEvents.NEW_MESSAGE, messageHandler);
      pusherClient.unbind(pusherEvents.UPDATE_MESSAGE, updateMessageHandler);
    };
  }, [conversationId]);

  const handleSendMessage = useCallback(async () => {
    if (!message && !mediaFile) return;

    setIsUploading(true);
    const formData = new FormData();
    if (mediaFile) {
      formData.append("file", mediaFile);
    }
    formData.append("content", message);
    formData.append("conversationId", conversationId);
    formData.append("senderId", currentUserId);

    try {
      await sendMessage(formData);
      setMessage("");
      setMediaFile(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsUploading(false);
    }
  }, [message, mediaFile, conversationId, currentUserId]);

  return (
    <div className="flex flex-col justify-between gap-4 h-[90vh]">
      <ScrollArea className="flex-grow rounded-md border p-4">
        {messages.map((message, index) => (
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
              <div className="font-semibold mb-1">{message.sender.name}</div>
              {message.mediaUrl ? (
                <a
                  href={message.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Media
                </a>
              ) : (
                <div>{message.content}</div>
              )}
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
        <div className="relative">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
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
