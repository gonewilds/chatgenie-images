
import { ChatMessage } from "@/types";

const DB_NAME = "chatgenie-images";
const DB_VERSION = 1;
const STORE_NAME = "messages";

let db: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject("Error opening database");
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

export const saveMessages = async (messages: ChatMessage[]): Promise<void> => {
  const database = await initDB();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  // Clear existing messages
  store.clear();

  // Add all messages
  for (const message of messages) {
    store.add(message);
  }

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => reject(event);
  });
};

export const getMessages = async (): Promise<ChatMessage[]> => {
  const database = await initDB();
  const transaction = database.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const messages = request.result as ChatMessage[];
      resolve(messages.sort((a, b) => a.timestamp - b.timestamp));
    };
    request.onerror = (event) => reject(event);
  });
};

export const clearMessages = async (): Promise<void> => {
  const database = await initDB();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  store.clear();

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => reject(event);
  });
};
