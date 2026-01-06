export interface WordItem {
  id: string;
  word: string;
  definition?: string; // Cache the definition so we don't re-fetch immediately
  successCount: number; // 0 to 3
  isMastered: boolean;
  totalAttempts: number;
}

export interface WordList {
  id: string;
  name: string;
  words: WordItem[];
}

export interface AppStats {
  streak: number;
  totalWordsLearned: number; // Historical total
  sessionWordsCorrect: number;
  sessionWordsTried: number;
  sessionStartTime: number;
}

export interface DailyStats {
  tried: number;
  success: number;
}

export enum GameState {
  IDLE = 'IDLE',
  LOADING_DEFINITION = 'LOADING_DEFINITION',
  WAITING_FOR_INPUT = 'WAITING_FOR_INPUT',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  SHOWING_ANSWER = 'SHOWING_ANSWER',
}

export interface DefinitionResponse {
  definition: string;
  partOfSpeech: string;
  exampleSentence: string;
}