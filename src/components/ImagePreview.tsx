
import { useState, useEffect } from "react";
import { X, ArrowLeft, ArrowRight, Star } from "lucide-react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  images: { url: string, messageId: string }[];
  initialIndex: number;
  onClose: () => void;
  onFavorite?: (image: { url: string, messageId: string }) => void;
  favorites?: string[];
}

const ImagePreview = ({ 
  images, 
  initialIndex, 
  onClose,
  onFavorite,
  favorites = []
}: ImagePreviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, onClose]);

  // Prevent body scrolling when preview is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleFavorite = () => {
    if (onFavorite && images[currentIndex]) {
      onFavorite(images[currentIndex]);
    }
  };

  const isFavorite = favorites.includes(images[currentIndex]?.messageId);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            {onFavorite && (
              <button
                onClick={handleFavorite}
                className={`p-2 rounded-full ${isFavorite ? "bg-amber-500/50 text-amber-100" : "bg-background/50 hover:bg-background/80"} transition-colors`}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star className={`h-6 w-6 ${isFavorite ? "fill-amber-500" : ""}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
              aria-label="Close preview"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
            <img
              src={images[0].url}
              alt="Full size preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="relative w-full h-full flex flex-col">
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          {onFavorite && (
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-full ${isFavorite ? "bg-amber-500/50 text-amber-100" : "bg-background/50 hover:bg-background/80"} transition-colors`}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star className={`h-6 w-6 ${isFavorite ? "fill-amber-500" : ""}`} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
            aria-label="Close preview"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-background/50 text-sm text-muted-foreground">
          {currentIndex + 1} / {images.length}
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <Carousel 
            className="w-full h-full"
            opts={{
              align: "center",
              loop: true,
            }}
          >
            <CarouselContent className="h-full">
              {images.map((image, index) => (
                <CarouselItem key={image.messageId + index} className="h-full flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
                    <img
                      src={image.url}
                      alt={`Image ${index + 1}`}
                      className="max-w-full max-h-full object-contain"
                      style={{ display: index === currentIndex ? 'block' : 'none' }}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
        
        {/* Navigation controls at the bottom */}
        <div className="flex justify-center items-center gap-3 p-4 w-full">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full opacity-70 hover:opacity-100"
            onClick={handlePrevious}
            aria-label="Previous image"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full opacity-70 hover:opacity-100"
            onClick={handleNext}
            aria-label="Next image"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
