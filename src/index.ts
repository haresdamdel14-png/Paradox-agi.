export type Language = 'fa' | 'en';

export type GeminiModelId = 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-2.5-flash';

export interface ModelOption {
  id: GeminiModelId;
  name: string;
  tagFa: string;
  tagEn: string;
  descFa: string;
  descEn: string;
}

export interface MediaAttachment {
  data: string; // base64 string
  mimeType: string;
  name?: string;
  duration?: number; // For audio in seconds
  size?: number; // In bytes
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: MediaAttachment;
  audio?: MediaAttachment;
  timestamp: number;
  isProcessing?: boolean;
  processingStatus?: string;
  model?: GeminiModelId;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface ServerStatus {
  status: 'online' | 'offline' | 'checking';
  hasKey: boolean;
  latencyMs: number;
  serverTime?: string;
  model?: string;
}
