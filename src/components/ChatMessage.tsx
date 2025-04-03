
import { useState } from "react";
import { ChatMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";
import ImagePreview from "./ImagePreview";
import { saveFavorite, removeFavorite, isFavorite } from "@/lib/favorites";
import { v4 as uuidv4 } from "uuid";

interface ChatMessageProps {
  message: ChatMessage;
  onRegenerateImage: (prompt: string) => void;
  allImages: { url: string, messageId: string }[];
}

const ChatMessageComponent = ({ message, onRegenerateImage, allImages }: ChatMessageProps) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(() => 
    message.imageUrl ? isFavorite(message.id) : false
  );

  const copyToClipboard = async () => {
    if (message.sender === "user") {
      try {
        await navigator.clipboard.writeText(message.content);
        toast({
          title: "Copied to clipboard",
          description: "Message copied to clipboard successfully",
        });
      } catch (error) {
        toast({
          title: "Failed to copy",
          description: "Could not copy message to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  const handleRegenerateImage = () => {
    if (message.prompt) {
      onRegenerateImage(message.prompt);
    }
  };

  const openImageModal = () => {
    if (message.imageUrl) {
      setIsImageModalOpen(true);
    }
  };
  
  const handleToggleFavorite = () => {
    if (!message.imageUrl || !message.prompt) return;
    
    if (isFavorited) {
      removeFavorite(message.id);
      setIsFavorited(false);
      toast({
        title: "Removed from favorites",
        description: "Image has been removed from your favorites",
      });
    } else {
      saveFavorite({
        id: message.id,
        imageUrl: message.imageUrl,
        prompt: message.prompt,
        timestamp: Date.now(),
      });
      setIsFavorited(true);
      toast({
        title: "Added to favorites",
        description: "Image has been added to your favorites",
      });
    }
  };
  
  // Find the current image index in the allImages array
  const currentImageIndex = message.imageUrl 
    ? allImages.findIndex(img => img.messageId === message.id)
    : -1;

  return (
    <div
      className={`flex flex-col ${
        message.sender === "user" ? "items-end" : "items-start"
      } mb-4`}
    >
      <div
        className={`max-w-[85%] rounded-lg px-4 py-2 ${
          message.sender === "user"
            ? "bg-chat-user text-primary-foreground"
            : "bg-chat-bot text-foreground"
        }`}
      >
        {message.sender === "user" ? (
          <div className="flex items-start">
            <p className="whitespace-pre-wrap break-words overflow-hidden mr-2">{message.content}</p>
            <button
              onClick={copyToClipboard}
              className="opacity-50 hover:opacity-100 transition-opacity p-1 flex-shrink-0"
              aria-label="Copy message"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            {message.content && (
              <p className="whitespace-pre-wrap break-words overflow-hidden">{message.content}</p>
            )}
            {message.imageUrl && (
              <div className="flex flex-col items-center space-y-2">
                <div className="relative w-full">
                  <img
                    src={message.imageUrl}
                    alt="Generated Image"
                    className="rounded-md max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={openImageModal}
                  />
                  {message.prompt && (
                    <button
                      onClick={handleToggleFavorite}
                      className={`absolute top-2 right-2 p-1.5 rounded-full bg-background/70 hover:bg-background/90 transition-colors ${
                        isFavorited ? "text-yellow-400" : "text-muted-foreground"
                      }`}
                      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star className="h-5 w-5" fill={isFavorited ? "currentColor" : "none"} />
                    </button>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center"
                  onClick={handleRegenerateImage}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground mt-1 mx-1">
        {formatDistanceToNow(message.timestamp, { addSuffix: true })}
      </span>

      {isImageModalOpen && message.imageUrl && (
        <ImagePreview
          images={allImages}
          initialIndex={currentImageIndex !== -1 ? currentImageIndex : 0}
          onClose={() => setIsImageModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatMessageComponent;
