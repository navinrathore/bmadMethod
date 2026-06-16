import { create } from 'zustand';

export type MessageRole = 'user' | 'system';

export interface ChatMessageData {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

interface ReconciliationStore {
  files: File[];
  messages: ChatMessageData[];
  addFile: (file: File) => void;
  addSystemMessage: (content: string) => void;
  addUserMessage: (content: string) => void;
}

export const useReconciliationStore = create<ReconciliationStore>((set) => ({
  files: [],
  messages: [],
  addFile: (file) =>
    set((state) => ({
      files: [...state.files, file],
    })),
  addSystemMessage: (content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: Math.random().toString(36).substring(2, 9),
          role: 'system',
          content,
          timestamp: Date.now(),
        },
      ],
    })),
  addUserMessage: (content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: Math.random().toString(36).substring(2, 9),
          role: 'user',
          content,
          timestamp: Date.now(),
        },
      ],
    })),
}));
