// src/types/index.ts
export interface Message {
    id: string;
    text: string;
    detectedLanguage?: string;
    summary?: string;
    translation?: string;
    targetLanguage?: string;
  }
  