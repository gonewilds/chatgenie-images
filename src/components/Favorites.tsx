
import { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getFavorites, clearAllFavorites, removeFavorite, FavoriteItem } from "@/lib/favorites";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";

interface FavoritesProps {
  isOpen: boolean;
  onClose: () => void;
}

const Favorites = ({ isOpen, onClose }: FavoritesProps) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => getFavorites());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleDeleteAll = () => {
    clearAllFavorites();
    setFavorites([]);
    setIsConfirmOpen(false);
  };
  
  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast({
        title: "Copied to clipboard",
        description: "Prompt copied to clipboard successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy prompt to clipboard",
        variant: "destructive",
      });
    }
  };
  
  const handleRemoveFavorite = (id: string) => {
    removeFavorite(id);
    setFavorites(getFavorites());
  };
  
  const openFullImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full max-w-md sm:max-w-lg overflow-hidden flex flex-col">
          <SheetHeader className="px-1">
            <SheetTitle>Favorites</SheetTitle>
            <SheetDescription>
              Your saved images and prompts
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-full">
              {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-muted-foreground">No favorites yet</p>
                </div>
              ) : (
                <div className="space-y-4 px-1">
                  {favorites.map((fav) => (
                    <div key={fav.id} className="border rounded-lg p-3 bg-card">
                      <div className="relative">
                        <img 
                          src={fav.imageUrl} 
                          alt="Favorite" 
                          className="w-full h-auto rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => openFullImage(fav.imageUrl)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 bg-background/70 hover:bg-background/90"
                          onClick={() => handleRemoveFavorite(fav.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between items-start">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(fav.timestamp, { addSuffix: true })}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => handleCopyPrompt(fav.prompt)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm mt-1 line-clamp-2">{fav.prompt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          
          <SheetFooter className="mt-auto pt-4">
            {favorites.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={() => setIsConfirmOpen(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete All Favorites
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      {/* Full image preview */}
      {selectedImage && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors z-10"
            aria-label="Close preview"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={selectedImage}
            alt="Full size preview"
            className="max-w-[90%] max-h-[90%] object-contain"
          />
        </div>
      )}
      
      {/* Confirmation dialog for deleting all favorites */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all favorites?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all your favorite images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Favorites;
