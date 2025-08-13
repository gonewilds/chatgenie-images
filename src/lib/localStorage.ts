
import { GenerationSettings } from "@/types";

export const STORAGE_KEYS = {
  API_ENDPOINT: "apiEndpoint",
  GENERATION_SETTINGS: "generationSettings",
};

export const getApiEndpoint = (): string => {
  return localStorage.getItem(STORAGE_KEYS.API_ENDPOINT) || "";
};

export const setApiEndpoint = (endpoint: string): void => {
  localStorage.setItem(STORAGE_KEYS.API_ENDPOINT, endpoint);
};

export const getGenerationSettings = (): GenerationSettings => {
  const defaultSettings: GenerationSettings = {
    steps: 20,
    cfg_scale: 7,
    width: 512,
    height: 512,
    sampler_name: "Euler a",
    scheduler: "Automatic",
    negative_prompt: "",
  };

  const settings = localStorage.getItem(STORAGE_KEYS.GENERATION_SETTINGS);
  if (!settings) return defaultSettings;

  try {
    return JSON.parse(settings) as GenerationSettings;
  } catch (error) {
    console.error("Error parsing generation settings:", error);
    return defaultSettings;
  }
};

export const setGenerationSettings = (settings: GenerationSettings): void => {
  localStorage.setItem(STORAGE_KEYS.GENERATION_SETTINGS, JSON.stringify(settings));
};
