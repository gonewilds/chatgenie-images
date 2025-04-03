
import { useRef, useEffect } from "react";
import { ChatMessage as ChatMessageType } from "@/types";
import ChatMessage from "./ChatMessage";

interface ChatMessageListProps {
  messages: ChatMessageType[];
  onRegenerateImage: (prompt: string) => void;
  onFavoriteImage?: (message: ChatMessageType) => void;
  favoriteIds?: string[];
}

const ChatMessageList = ({ 
  messages, 
  onRegenerateImage,
  onFavoriteImage,
  favoriteIds = []
}: ChatMessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Collect all images from bot messages
  const allImages = messages
    .filter(msg => msg.sender === "bot" && msg.imageUrl)
    .map(msg => ({
      url: msg.imageUrl as string,
      messageId: msg.id
    }));

  return (
    <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <h3 className="text-xl font-semibold mb-2">Welcome to ChatGenie</h3>
          <p className="text-muted-foreground mb-4">
            Start by entering a prompt to generate an image
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onRegenerateImage={onRegenerateImage}
            onFavoriteImage={onFavoriteImage}
            allImages={allImages}
            favoriteIds={favoriteIds}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
