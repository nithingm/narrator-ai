export interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    isError?: boolean;
    deceptionScore?: number;
    modelUsed?: string;
  }