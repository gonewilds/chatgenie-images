
import { useState, useEffect } from "react";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@/components/ui/carousel";

interface ImagePreviewProps {
  images: { url: string, messageId: string }[];
  initialIndex: number;
  onClose: () => void;
}

const ImagePreview = ({ images, initialIndex, onClose }: ImagePreviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, onClose]);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="relative max-w-full max-h-full">
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Close preview"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={images[0].url}
            alt="Full size preview"
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="relative max-w-full max-h-full w-full">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-2 rounded-full hover:bg-muted transition-colors z-10"
          aria-label="Close preview"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="text-center text-sm text-muted-foreground mb-2">
          Image {currentIndex + 1} of {images.length}
        </div>
        
        <Carousel 
          className="w-full max-w-4xl mx-auto"
          defaultIndex={initialIndex}
          onPageChange={setCurrentIndex}
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={image.messageId + index}>
                <div className="flex justify-center items-center">
                  <img
                    src={image.url}
                    alt={`Image ${index + 1}`}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <CarouselPrevious 
            className="left-2 lg:-left-16 opacity-70 hover:opacity-100"
            aria-label="Previous image"
          />
          <CarouselNext 
            className="right-2 lg:-right-16 opacity-70 hover:opacity-100"
            aria-label="Next image"
          />
        </Carousel>
      </div>
    </div>
  );
};

export default ImagePreview;
