
import { useState, useEffect } from "react";
import { X, ArrowLeft, ArrowRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        // Zoom in with + key
        setZoomLevel((prev) => Math.min(prev + 0.5, 4));
      } else if (e.key === "-") {
        // Zoom out with - key
        setZoomLevel((prev) => Math.max(prev - 0.5, 0.5));
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

  // Reset zoom level when changing images
  useEffect(() => {
    setZoomLevel(1);
  }, [currentIndex]);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from reaching the carousel
    setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from reaching the carousel
    setZoomLevel((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from reaching the carousel
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from reaching the carousel
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors z-10"
            aria-label="Close preview"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
            <img
              src={images[0].url}
              alt="Full size preview"
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            />
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            <Button 
              size="icon" 
              variant="secondary" 
              onClick={handleZoomOut}
              aria-label="Zoom out"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              variant="secondary" 
              onClick={handleZoomIn}
              aria-label="Zoom in"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors z-10"
          aria-label="Close preview"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-background/50 text-sm text-muted-foreground">
          {currentIndex + 1} / {images.length}
        </div>
        
        <Carousel 
          className="w-full h-full"
          defaultIndex={initialIndex}
          onPageChange={setCurrentIndex}
        >
          <CarouselContent className="h-full">
            {images.map((image, index) => (
              <CarouselItem key={image.messageId + index} className="h-full flex items-center justify-center">
                <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
                  <img
                    src={image.url}
                    alt={`Image ${index + 1}`}
                    className="max-w-full max-h-full object-contain transition-transform duration-200"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          <Button 
            size="icon" 
            variant="secondary" 
            onClick={handlePrevious}
            aria-label="Previous image"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button 
            size="icon" 
            variant="secondary" 
            onClick={handleZoomOut}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button 
            size="icon" 
            variant="secondary" 
            onClick={handleZoomIn}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button 
            size="icon" 
            variant="secondary" 
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
