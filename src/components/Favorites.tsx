
import { useState, useEffect } from "react";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FavoriteItem } from "@/types";
import { getFavorites, clearAllFavorites, removeFavorite } from "@/lib/favorites";
import { formatDistanceToNow } from "date-fns";
import { Copy, Star, Trash2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
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

interface FavoritesProps {
  isOpen: boolean;
  onClose: () => void;
}

const Favorites = ({ isOpen, onClose }: FavoritesProps) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFavorites();
    }
  }, [isOpen]);

  const loadFavorites = () => {
    const loadedFavorites = getFavorites();
    setFavorites(loadedFavorites.sort((a, b) => b.timestamp - a.timestamp));
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
    setItemToDelete(id);
    setIsConfirmDialogOpen(true);
  };

  const confirmRemoveFavorite = () => {
    if (itemToDelete === "all") {
      clearAllFavorites();
      setFavorites([]);
      toast({
        title: "All favorites deleted",
        description: "All favorites have been deleted successfully",
      });
    } else if (itemToDelete) {
      removeFavorite(itemToDelete);
      setFavorites(prev => prev.filter(fav => fav.id !== itemToDelete));
      toast({
        title: "Favorite removed",
        description: "Favorite has been removed successfully",
      });
    }
    setIsConfirmDialogOpen(false);
    setItemToDelete(null);
  };

  const handleClearAllFavorites = () => {
    setItemToDelete("all");
    setIsConfirmDialogOpen(true);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <Star className="text-yellow-400 h-5 w-5" /> 
              Favorites
            </SheetTitle>
            <SheetDescription>
              Your saved favorite images and prompts
            </SheetDescription>
          </SheetHeader>
          
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Star className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
              <p className="text-muted-foreground">
                You don't have any favorites yet.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Click the star icon on images to add them to your favorites.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {favorites.map((favorite) => (
                <div key={favorite.id} className="relative bg-card rounded-lg p-4 border">
                  <button
                    onClick={() => handleRemoveFavorite(favorite.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-background/70 hover:bg-destructive/20 transition-colors text-muted-foreground hover:text-destructive"
                    aria-label="Remove from favorites"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  
                  <div className="pt-3">
                    <img
                      src={favorite.imageUrl}
                      alt="Favorite Image"
                      className="rounded-md w-full object-cover mb-3"
                    />
                    
                    <div className="flex justify-between items-start mt-2">
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(favorite.timestamp, { addSuffix: true })}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground"
                        onClick={() => handleCopyPrompt(favorite.prompt)}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        Copy Prompt
                      </Button>
                    </div>
                    
                    <p className="text-sm mt-2 text-foreground/80 line-clamp-2">
                      {favorite.prompt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {favorites.length > 0 && (
            <SheetFooter className="mt-6">
              <Button 
                variant="destructive" 
                onClick={handleClearAllFavorites}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete All Favorites
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
      
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {itemToDelete === "all" ? "Delete all favorites?" : "Remove favorite?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete === "all"
                ? "This will permanently delete all your favorite images and prompts. This action cannot be undone."
                : "This will remove this image from your favorites. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemoveFavorite}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Favorites;
