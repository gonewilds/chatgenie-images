
import { toast } from "@/hooks/use-toast";

export interface FavoriteItem {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
}

const STORAGE_KEY = 'chatgenie-favorites';

export const getFavorites = (): FavoriteItem[] => {
  try {
    const favoritesJson = localStorage.getItem(STORAGE_KEY);
    if (!favoritesJson) return [];
    return JSON.parse(favoritesJson);
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const addFavorite = (item: FavoriteItem): void => {
  try {
    const favorites = getFavorites();
    
    // Check if already exists
    if (favorites.some(fav => fav.id === item.id)) {
      return;
    }
    
    favorites.push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error adding favorite:', error);
    toast({
      title: 'Error',
      description: 'Failed to add to favorites',
      variant: 'destructive',
    });
  }
};

export const removeFavorite = (id: string): void => {
  try {
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter(fav => fav.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavorites));
  } catch (error) {
    console.error('Error removing favorite:', error);
    toast({
      title: 'Error',
      description: 'Failed to remove from favorites',
      variant: 'destructive',
    });
  }
};

export const isFavorite = (imageUrl: string): boolean => {
  const favorites = getFavorites();
  return favorites.some(fav => fav.imageUrl === imageUrl);
};

export const clearAllFavorites = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: 'Success',
      description: 'All favorites have been deleted',
    });
  } catch (error) {
    console.error('Error clearing favorites:', error);
    toast({
      title: 'Error',
      description: 'Failed to clear favorites',
      variant: 'destructive',
    });
  }
};
