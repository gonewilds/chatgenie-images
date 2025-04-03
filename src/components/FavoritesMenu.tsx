
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, X, Trash } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FavoriteItem } from "@/types";

interface FavoritesMenuProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteItem[];
  onRemoveItem: (id: string) => void;
  onClearFavorites: () => void;
}

const FavoritesMenu = ({
  isOpen,
  onClose,
  favorites,
  onRemoveItem,
  onClearFavorites
}: FavoritesMenuProps) => {
  const copyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast({
        title: "Copied to clipboard",
        description: "Prompt copied to clipboard successfully",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Failed to copy",
        description: "Could not copy prompt to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Favorite Images</DialogTitle>
          <DialogClose />
        </DialogHeader>

        {favorites.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No favorite images yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click the star icon on any image to save it here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="border rounded-md p-4 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 z-10 h-8 w-8 bg-background/80 rounded-full"
                  onClick={() => onRemoveItem(favorite.id)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove from favorites</span>
                </Button>

                <div className="aspect-square relative rounded-md overflow-hidden mb-3">
                  <img
                    src={favorite.imageUrl}
                    alt="Favorite"
                    className="w-full h-full object-contain bg-gray-100 dark:bg-gray-800"
                  />
                </div>

                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Prompt:</p>
                    <p className="text-sm text-muted-foreground break-words">
                      {favorite.prompt}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => copyPrompt(favorite.prompt)}
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy prompt</span>
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-end mt-4">
              <Button 
                variant="destructive" 
                onClick={onClearFavorites}
                className="flex items-center gap-2"
              >
                <Trash className="h-4 w-4" />
                Delete All Favorites
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FavoritesMenu;
