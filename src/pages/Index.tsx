
import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage as ChatMessageType, FavoriteItem } from "@/types";
import ChatHeader from "@/components/ChatHeader";
import ChatMessageList from "@/components/ChatMessageList";
import ChatInput from "@/components/ChatInput";
import Settings from "@/components/Settings";
import FavoritesMenu from "@/components/FavoritesMenu";
import { generateImage } from "@/lib/imageGeneration";
import { initDB, saveMessages, getMessages, clearMessages } from "@/lib/database";
import { getFavorites, saveFavorite, removeFavorite, clearFavorites } from "@/lib/favorites";
import { toast } from "@/hooks/use-toast";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

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

  // Load favorites
  useEffect(() => {
    const loadedFavorites = getFavorites();
    setFavorites(loadedFavorites);
    setFavoriteIds(loadedFavorites.map(f => f.id));
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

  const handleFavoriteImage = (message: ChatMessageType) => {
    if (!message.imageUrl || !message.prompt) return;
    
    // Check if already a favorite
    const isFavorited = favoriteIds.includes(message.id);
    
    if (isFavorited) {
      // Remove from favorites
      const updatedFavorites = removeFavorite(message.id);
      setFavorites(updatedFavorites);
      setFavoriteIds(updatedFavorites.map(f => f.id));
      toast({
        title: "Removed from favorites",
        description: "Image has been removed from your favorites",
      });
    } else {
      // Add to favorites
      const newFavorite: FavoriteItem = {
        id: message.id,
        imageUrl: message.imageUrl,
        prompt: message.prompt,
        timestamp: Date.now()
      };
      
      const updatedFavorites = saveFavorite(newFavorite);
      setFavorites(updatedFavorites);
      setFavoriteIds(updatedFavorites.map(f => f.id));
      
      toast({
        title: "Added to favorites",
        description: "Image has been added to your favorites",
      });
    }
  };

  const handleRemoveFavorite = (id: string) => {
    const updatedFavorites = removeFavorite(id);
    setFavorites(updatedFavorites);
    setFavoriteIds(updatedFavorites.map(f => f.id));
    
    toast({
      title: "Removed from favorites",
      description: "Image has been removed from your favorites",
    });
  };

  const handleClearFavorites = () => {
    clearFavorites();
    setFavorites([]);
    setFavoriteIds([]);
    
    toast({
      title: "Favorites cleared",
      description: "All favorites have been cleared",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        extraButton={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFavoritesOpen(true)}
            className="relative"
            title="Favorites"
          >
            <Star className={`h-5 w-5 ${favorites.length > 0 ? "fill-amber-500 text-amber-500" : ""}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {favorites.length}
              </span>
            )}
            <span className="sr-only">Favorites</span>
          </Button>
        }
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatMessageList 
          messages={messages} 
          onRegenerateImage={handleRegenerateImage} 
          onFavoriteImage={handleFavoriteImage}
          favoriteIds={favoriteIds}
        />
        <ChatInput onSendMessage={handleSendMessage} isLoading={isGenerating} />
      </main>

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearChat={handleClearChat}
      />
      
      <FavoritesMenu
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onRemoveItem={handleRemoveFavorite}
        onClearFavorites={handleClearFavorites}
      />
    </div>
  );
};

export default Index;
