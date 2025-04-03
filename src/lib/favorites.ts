
import { FavoriteItem } from "@/types";

const FAVORITES_STORAGE_KEY = "chatgenie-favorites";

export const getFavorites = (): FavoriteItem[] => {
  const favorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
  if (!favorites) return [];

  try {
    return JSON.parse(favorites) as FavoriteItem[];
  } catch (error) {
    console.error("Error parsing favorites:", error);
    return [];
  }
};

export const saveFavorite = (item: FavoriteItem): void => {
  const favorites = getFavorites();
  
  // Check if the image is already favorited
  const exists = favorites.some(fav => fav.id === item.id);
  if (exists) return;
  
  const updatedFavorites = [...favorites, item];
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
};

export const removeFavorite = (id: string): void => {
  const favorites = getFavorites();
  const updatedFavorites = favorites.filter(fav => fav.id !== id);
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
};

export const clearAllFavorites = (): void => {
  localStorage.removeItem(FAVORITES_STORAGE_KEY);
};

export const isFavorite = (id: string): boolean => {
  const favorites = getFavorites();
  return favorites.some(fav => fav.id === id);
};
