export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  subject: string;
  content: string;
  fileName?: string;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SummaryData {
  keyConcepts: string[];
  importantPoints: string[];
  bulletSummary: string[];
  revisionNotes: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index 0-3
  explanation: string;
}

export interface FlashcardItem {
  id: number;
  front: string; // Question or concept
  back: string;  // Answer or explanation
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface AIResults {
  noteId: string;
  summary?: SummaryData;
  quiz?: QuizQuestion[];
  flashcards?: FlashcardItem[];
  chatHistory?: ChatMessage[];
  updatedAt: string;
}
