// frontend/types/Character.ts

export interface Character {
    id: string;
    name: string;
    title: string;
    description: string;
    systemPrompt?: string;
    backgroundColor?: string;
    hoverBackground?: string;
    shadowColor?: string;
    textColor?: string;
    accent?: string;
    book: string;
    author: string;
    year: number;
    defaultModel?: string;
  }
  