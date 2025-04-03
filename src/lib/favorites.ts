
import { FavoriteItem } from "@/types";

const DB_NAME = "chatgenie-favorites";
const DB_VERSION = 1;
const STORE_NAME = "favorites";

let db: IDBDatabase | null = null;

export const initFavoritesDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject("Error opening favorites database");
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

export const getFavorites = async (): Promise<FavoriteItem[]> => {
  try {
    const database = await initFavoritesDB();
    const transaction = database.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const favorites = request.result as FavoriteItem[];
        resolve(favorites.sort((a, b) => b.timestamp - a.timestamp));
      };
      request.onerror = (event) => {
        console.error("Error getting favorites:", event);
        reject([]);
      };
    });
  } catch (error) {
    console.error("Error accessing favorites database:", error);
    return [];
  }
};

export const saveFavorite = async (item: FavoriteItem): Promise<void> => {
  try {
    // Check if the item already exists
    const exists = await isFavorite(item.id);
    if (exists) return;

    const database = await initFavoritesDB();
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    store.add(item);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => {
        console.error("Error saving favorite:", event);
        reject(event);
      };
    });
  } catch (error) {
    console.error("Error saving favorite:", error);
  }
};

export const removeFavorite = async (id: string): Promise<void> => {
  try {
    const database = await initFavoritesDB();
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    store.delete(id);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => {
        console.error("Error removing favorite:", event);
        reject(event);
      };
    });
  } catch (error) {
    console.error("Error removing favorite:", error);
  }
};

export const clearAllFavorites = async (): Promise<void> => {
  try {
    const database = await initFavoritesDB();
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    store.clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => {
        console.error("Error clearing favorites:", event);
        reject(event);
      };
    });
  } catch (error) {
    console.error("Error clearing favorites:", error);
  }
};

export const isFavorite = async (id: string): Promise<boolean> => {
  try {
    const database = await initFavoritesDB();
    const transaction = database.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        resolve(!!request.result);
      };
      request.onerror = () => {
        resolve(false);
      };
    });
  } catch (error) {
    console.error("Error checking favorite:", error);
    return false;
  }
};
