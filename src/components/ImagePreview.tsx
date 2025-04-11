
import { useState, useEffect, useRef, TouchEvent } from "react";
import { X, ArrowLeft, ArrowRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  images: { url: string, messageId: string }[];
  initialIndex: number;
  onClose: () => void;
}

const ImagePreview = ({ images, initialIndex, onClose }: ImagePreviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && zoomLevel === 1) {
        navigateImages(-1);
      } else if (e.key === "ArrowRight" && zoomLevel === 1) {
        navigateImages(1);
      } else if (e.key === "+" || e.key === "=") {
        handleZoom(0.25);
      } else if (e.key === "-") {
        handleZoom(-0.25);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, onClose, zoomLevel]);

  // Prevent body scrolling when preview is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Reset zoom level and pan position when navigating images
  useEffect(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  const navigateImages = (direction: number) => {
    if (zoomLevel > 1) return; // Don't navigate if zoomed in
    
    setCurrentIndex((prev) => {
      const newIndex = prev + direction;
      if (newIndex < 0) return images.length - 1;
      if (newIndex >= images.length) return 0;
      return newIndex;
    });
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => {
      const newZoom = prev + delta;
      if (newZoom <= 1) {
        setPanPosition({ x: 0, y: 0 }); // Reset pan position when zooming out fully
        return 1;
      }
      return Math.min(3, newZoom); // Limit zoom to 3x
    });
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleImageClick = (e: React.MouseEvent) => {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;
    
    // Detect double click (300ms threshold)
    if (timeDiff < 300) {
      // If already zoomed in, reset zoom
      if (zoomLevel > 1) {
        resetZoom();
      } else {
        // Zoom in to 2x at the click position
        handleZoom(1);
      }
    }
    
    setLastClickTime(currentTime);
  };

  // Handle touch events for panning when zoomed in
  const handleTouchStart = (e: TouchEvent) => {
    if (zoomLevel > 1) {
      // When zoomed in, initiate panning
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panPosition.x,
        y: e.touches[0].clientY - panPosition.y
      });
    } else {
      // When not zoomed in, track swipe for navigation
      setTouchStart(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && zoomLevel > 1) {
      e.preventDefault(); // Prevent default browser behavior
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      
      // Calculate bounds for panning
      const imgElement = imageRef.current;
      if (imgElement) {
        const maxX = (imgElement.width * (zoomLevel - 1)) / 2;
        const maxY = (imgElement.height * (zoomLevel - 1)) / 2;
        
        // Restrict panning to image boundaries
        setPanPosition({
          x: Math.max(-maxX, Math.min(maxX, newX)),
          y: Math.max(-maxY, Math.min(maxY, newY))
        });
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(false);
      return;
    }
    
    if (touchStart === null) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    // If the swipe distance is significant enough (more than 50px)
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - go to next image
        navigateImages(1);
      } else {
        // Swipe right - go to previous image
        navigateImages(-1);
      }
    }
    
    setTouchStart(null);
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
          
          <div 
            className="w-full h-full flex items-center justify-center p-4 md:p-8 overflow-hidden"
            onClick={zoomLevel > 1 ? resetZoom : undefined}
            style={{ cursor: zoomLevel > 1 ? 'zoom-out' : 'default' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              ref={imageRef}
              src={images[0].url}
              alt="Full size preview"
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ 
                transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
                cursor: zoomLevel > 1 ? 'move' : 'zoom-in'
              }}
              onClick={handleImageClick}
            />
          </div>
          
          {/* Zoom controls at bottom */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full opacity-70 hover:opacity-100"
              onClick={() => handleZoom(-0.25)}
              aria-label="Zoom out"
              disabled={zoomLevel <= 1}
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full opacity-70 hover:opacity-100"
              onClick={() => handleZoom(0.25)}
              aria-label="Zoom in"
              disabled={zoomLevel >= 3}
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
      <div className="relative w-full h-full flex flex-col">
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
        
        <div 
          className="flex-1 flex items-center justify-center overflow-hidden"
          onClick={zoomLevel > 1 ? resetZoom : undefined}
          style={{ cursor: zoomLevel > 1 ? 'zoom-out' : 'default' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-full h-full flex items-center justify-center">
            <img
              ref={imageRef}
              src={images[currentIndex].url}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ 
                transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
                cursor: zoomLevel > 1 ? 'move' : 'zoom-in'
              }}
              onClick={handleImageClick}
            />
          </div>
        </div>
        
        {/* Combined navigation and zoom controls at the bottom */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center items-center gap-3 z-10">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full opacity-70 hover:opacity-100"
            onClick={() => navigateImages(-1)}
            aria-label="Previous image"
            disabled={zoomLevel > 1}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full opacity-70 hover:opacity-100"
            onClick={() => handleZoom(-0.25)}
            aria-label="Zoom out"
            disabled={zoomLevel <= 1}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full opacity-70 hover:opacity-100"
            onClick={() => handleZoom(0.25)}
            aria-label="Zoom in"
            disabled={zoomLevel >= 3}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full opacity-70 hover:opacity-100"
            onClick={() => navigateImages(1)}
            aria-label="Next image"
            disabled={zoomLevel > 1}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
