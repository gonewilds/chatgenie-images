
import { FavoriteItem } from "@/types";

const FAVORITES_KEY = "chatgenie-favorites";

export const getFavorites = (): FavoriteItem[] => {
  try {
    const favoritesJson = localStorage.getItem(FAVORITES_KEY);
    if (!favoritesJson) return [];
    return JSON.parse(favoritesJson);
  } catch (error) {
    console.error("Error retrieving favorites:", error);
    return [];
  }
};

export const saveFavorite = (favorite: FavoriteItem): FavoriteItem[] => {
  try {
    const favorites = getFavorites();
    
    // Check if already exists
    const existingIndex = favorites.findIndex(f => f.id === favorite.id);
    
    if (existingIndex >= 0) {
      // Replace existing
      favorites[existingIndex] = favorite;
    } else {
      // Add new
      favorites.push(favorite);
    }
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return favorites;
  } catch (error) {
    console.error("Error saving favorite:", error);
    return getFavorites();
  }
};

export const removeFavorite = (id: string): FavoriteItem[] => {
  try {
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter(f => f.id !== id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    return updatedFavorites;
  } catch (error) {
    console.error("Error removing favorite:", error);
    return getFavorites();
  }
};

export const clearFavorites = (): void => {
  try {
    localStorage.removeItem(FAVORITES_KEY);
  } catch (error) {
    console.error("Error clearing favorites:", error);
  }
};

export const isFavorite = (id: string): boolean => {
  try {
    const favorites = getFavorites();
    return favorites.some(f => f.id === id);
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
};
