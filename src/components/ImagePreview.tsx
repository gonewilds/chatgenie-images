
import { X } from "lucide-react";

interface ImagePreviewProps {
  imageUrl: string;
  onClose: () => void;
}

const ImagePreview = ({ imageUrl, onClose }: ImagePreviewProps) => {
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
          src={imageUrl}
          alt="Full size preview"
          className="max-w-full max-h-[85vh] object-contain rounded-lg"
        />
      </div>
    </div>
  );
};

export default ImagePreview;
