
import { useState, useEffect } from "react";
import { X, ArrowLeft, ArrowRight, ZoomIn, ZoomOut } from "lucide-react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  images: { url: string, messageId: string }[];
  initialIndex: number;
  onClose: () => void;
}

const ImagePreview = ({ images, initialIndex, onClose }: ImagePreviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      } else if (e.key === "+" || e.key === "=") {
        setZoomLevel(prev => Math.min(prev + 0.25, 3));
      } else if (e.key === "-") {
        setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, onClose]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  // Reset zoom when changing images
  useEffect(() => {
    setZoomLevel(1);
  }, [currentIndex]);

  // Prevent body scrolling when preview is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
        <div className="relative w-full h-full flex items-center justify-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors z-10"
            aria-label="Close preview"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="absolute top-4 left-4 z-10 flex space-x-2">
            <Button 
              size="icon" 
              variant="outline" 
              className="rounded-full bg-background/50 hover:bg-background/80 transition-colors"
              onClick={handleZoomIn}
            >
              <ZoomIn className="h-4 w-4" />
              <span className="sr-only">Zoom in</span>
            </Button>
            <Button 
              size="icon" 
              variant="outline" 
              className="rounded-full bg-background/50 hover:bg-background/80 transition-colors"
              onClick={handleZoomOut}
            >
              <ZoomOut className="h-4 w-4" />
              <span className="sr-only">Zoom out</span>
            </Button>
          </div>
          
          <div 
            className="w-full h-full flex items-center justify-center p-4 md:p-8 overflow-auto"
            style={{ cursor: zoomLevel > 1 ? 'move' : 'auto' }}
          >
            <img
              src={images[0].url}
              alt="Full size preview"
              className="object-contain transition-transform duration-200"
              style={{ 
                transform: `scale(${zoomLevel})`,
                maxWidth: zoomLevel === 1 ? '100%' : 'none',
                maxHeight: zoomLevel === 1 ? '100%' : 'none'
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="relative w-full h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors z-10"
          aria-label="Close preview"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-4">
          <span className="px-3 py-1 rounded-full bg-background/50 text-sm text-muted-foreground">
            {currentIndex + 1} / {images.length}
          </span>
          
          <div className="flex space-x-2">
            <Button 
              size="icon" 
              variant="outline" 
              className="rounded-full bg-background/50 hover:bg-background/80 transition-colors"
              onClick={handleZoomIn}
            >
              <ZoomIn className="h-4 w-4" />
              <span className="sr-only">Zoom in</span>
            </Button>
            <Button 
              size="icon" 
              variant="outline" 
              className="rounded-full bg-background/50 hover:bg-background/80 transition-colors"
              onClick={handleZoomOut}
            >
              <ZoomOut className="h-4 w-4" />
              <span className="sr-only">Zoom out</span>
            </Button>
          </div>
        </div>
        
        <Carousel 
          className="w-full h-full"
          defaultIndex={initialIndex}
          onPageChange={setCurrentIndex}
        >
          <CarouselContent className="h-full">
            {images.map((image, index) => (
              <CarouselItem key={image.messageId + index} className="h-full flex items-center justify-center">
                <div 
                  className="w-full h-full flex items-center justify-center p-4 md:p-8 overflow-auto"
                  style={{ cursor: zoomLevel > 1 ? 'move' : 'auto' }}
                >
                  <img
                    src={image.url}
                    alt={`Image ${index + 1}`}
                    className="object-contain transition-transform duration-200"
                    style={{ 
                      transform: `scale(${zoomLevel})`,
                      maxWidth: zoomLevel === 1 ? '100%' : 'none',
                      maxHeight: zoomLevel === 1 ? '100%' : 'none'
                    }}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <CarouselPrevious 
            className="left-2 lg:left-4 opacity-70 hover:opacity-100"
            aria-label="Previous image"
          />
          <CarouselNext 
            className="right-2 lg:right-4 opacity-70 hover:opacity-100"
            aria-label="Next image"
          />
        </Carousel>
      </div>
    </div>
  );
};

export default ImagePreview;
