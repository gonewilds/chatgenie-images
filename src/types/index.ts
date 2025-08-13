
export interface GenerationSettings {
  steps: number;
  cfg_scale: number;
  width: number;
  height: number;
  sampler_name: string;
  scheduler: string;
  negative_prompt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: number;
  imageUrl?: string;
  prompt?: string;
}

export interface FavoriteItem {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
}

export interface DBState {
  messages: ChatMessage[];
}
