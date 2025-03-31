
import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage as ChatMessageType } from "@/types";
import ChatHeader from "@/components/ChatHeader";
import ChatMessageList from "@/components/ChatMessageList";
import ChatInput from "@/components/ChatInput";
import Settings from "@/components/Settings";
import { generateImage } from "@/lib/imageGeneration";
import { initDB, saveMessages, getMessages, clearMessages } from "@/lib/database";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize the database and load messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        await initDB();
        const savedMessages = await getMessages();
        setMessages(savedMessages);
      } catch (error) {
        console.error("Failed to load messages:", error);
        toast({
          title: "Failed to load messages",
          description: "Could not load your chat history",
          variant: "destructive",
        });
      }
    };

    loadMessages();
  }, []);

  // Save messages to IndexedDB when they change
  useEffect(() => {
    const saveToDb = async () => {
      if (messages.length > 0) {
        try {
          await saveMessages(messages);
        } catch (error) {
          console.error("Failed to save messages:", error);
        }
      }
    };

    saveToDb();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: ChatMessageType = {
      id: uuidv4(),
      content,
      sender: "user",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Generate image
    setIsGenerating(true);

    try {
      const botMessage: ChatMessageType = {
        id: uuidv4(),
        content: "Generating image...",
        sender: "bot",
        timestamp: Date.now(),
        prompt: content,
      };

      setMessages((prev) => [...prev, botMessage]);

      const imageUrl = await generateImage(content);

      if (imageUrl) {
        // Update bot message with image
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessage.id
              ? { ...msg, content: "Your generated image:", imageUrl }
              : msg
          )
        );
      } else {
        // Update bot message with error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessage.id
              ? { ...msg, content: "Failed to generate image. Please check your settings and try again." }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error in message flow:", error);
      toast({
        title: "Error",
        description: "Something went wrong while processing your request",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateImage = async (prompt: string) => {
    if (isGenerating) return;

    setIsGenerating(true);

    try {
      // Add a new bot message
      const botMessage: ChatMessageType = {
        id: uuidv4(),
        content: "Regenerating image...",
        sender: "bot",
        timestamp: Date.now(),
        prompt,
      };

      setMessages((prev) => [...prev, botMessage]);

      const imageUrl = await generateImage(prompt);

      if (imageUrl) {
        // Update bot message with image
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessage.id
              ? { ...msg, content: "Your regenerated image:", imageUrl }
              : msg
          )
        );
      } else {
        // Update bot message with error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessage.id
              ? { ...msg, content: "Failed to regenerate image. Please check your settings and try again." }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error regenerating image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await clearMessages();
      setMessages([]);
    } catch (error) {
      console.error("Failed to clear messages:", error);
      toast({
        title: "Failed to clear chat",
        description: "Could not clear your chat history",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader onOpenSettings={() => setIsSettingsOpen(true)} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatMessageList messages={messages} onRegenerateImage={handleRegenerateImage} />
        <ChatInput onSendMessage={handleSendMessage} isLoading={isGenerating} />
      </main>

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearChat={handleClearChat}
      />
    </div>
  );
};

export default Index;
