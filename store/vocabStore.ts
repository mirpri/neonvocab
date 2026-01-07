import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AppStats, DailyStats, DefinitionResponse, WordItem, WordList, SessionGoal } from "../types";

const PRELOAD_BUFFER_SIZE = 3;

const STORAGE_KEY_WORDS = "vocab-words";
const STORAGE_KEY_WORDLISTS = "vocab-wordlists";
const STORAGE_KEY_ACTIVE_WORDLIST = "vocab-active-wordlist";
const STORAGE_KEY_STATS = "vocab-stats";
const STORAGE_KEY_DAILY = "vocab-daily";

const makeId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (crypto as any).randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

const ensureNonEmptyWordlists = (lists: WordList[] | null | undefined): WordList[] => {
  if (Array.isArray(lists) && lists.length > 0) return lists;
  return [{ id: "default", name: "Default", words: [] }];
};

const getDefaultStats = (): AppStats => ({
  streak: 0,
  totalWordsLearned: 0,
  sessionWordsCorrect: 0,
  sessionWordsTried: 0,
  sessionStartTime: Date.now(),
});

type VocabStoreState = {
  // Core data
  wordlists: WordList[];
  activeWordlistId: string;
  wordSort: "alpha" | "correct";

  // Session state
  isLearning: boolean;
  currentWordIndex: number | null;
  wordQueue: number[];
  wordNonce: number; // increments when picking next word to force UI remounts
  isSessionComplete: boolean;
  isGoalMet: boolean;
  sessionGoal: SessionGoal | null;
  lastSessionGoal: SessionGoal | null;

  // Stats (global across lists)
  stats: AppStats;
  dailyStats: Record<string, DailyStats>;

  // Definition cache (global)
  definitionCache: Record<string, DefinitionResponse>;

  // Actions
  selectWordlist: (id: string) => void;
  createWordlist: (name?: string) => void;
  renameActiveWordlist: (name: string) => void;
  clearActiveWordlist: () => void;
  deleteActiveWordlist: () => void;

  setWordSort: (sort: "alpha" | "correct") => void;
  importWords: (text: string) => void;
  removeWord: (wordId: string, wordText: string) => void;

  startLearning: (goal?: SessionGoal) => void;
  endSession: () => void;
  pickNextWord: (isInitial?: boolean) => void;
  fillQueueIfNeeded: () => void;
  continueSession: () => void;

  applyResult: (success: boolean, resetStreak: boolean, resetWordProgress?: boolean) => void;

  cacheDefinition: (wordText: string, def: DefinitionResponse) => void;

  resetAllData: () => void;
};

type PersistedSlice = Pick<
  VocabStoreState,
  "wordlists" | "activeWordlistId" | "wordSort" | "stats" | "dailyStats" | "definitionCache" | "lastSessionGoal"
>;

const getActiveWords = (state: Pick<VocabStoreState, "wordlists" | "activeWordlistId">) => {
  const active = state.wordlists.find((wl) => wl.id === state.activeWordlistId) ?? state.wordlists[0];
  return active?.words ?? [];
};

const getInitialPersistedSlice = (): PersistedSlice => {
  // If a previous zustand store exists, persist middleware will hydrate it.
  // This initializer is mainly for first-run and legacy migrations.
  try {
    const savedWordlists = localStorage.getItem(STORAGE_KEY_WORDLISTS);
    const savedActiveWordlistId = localStorage.getItem(STORAGE_KEY_ACTIVE_WORDLIST);
    const savedWords = localStorage.getItem(STORAGE_KEY_WORDS);
    const savedStats = localStorage.getItem(STORAGE_KEY_STATS);
    const savedDaily = localStorage.getItem(STORAGE_KEY_DAILY);

    let wordlists = ensureNonEmptyWordlists(undefined);
    let activeWordlistId = wordlists[0].id;

    if (savedWordlists) {
      try {
        const parsed: WordList[] = JSON.parse(savedWordlists);
        wordlists = ensureNonEmptyWordlists(parsed);
        activeWordlistId =
          savedActiveWordlistId && wordlists.some((wl) => wl.id === savedActiveWordlistId)
            ? savedActiveWordlistId
            : wordlists[0].id;
      } catch {
        wordlists = ensureNonEmptyWordlists(undefined);
        activeWordlistId = wordlists[0].id;
      }
    } else if (savedWords) {
      try {
        const legacyWords: WordItem[] = JSON.parse(savedWords);
        wordlists = [{ id: "default", name: "Default", words: legacyWords }];
        activeWordlistId = "default";
      } catch {
        wordlists = ensureNonEmptyWordlists(undefined);
        activeWordlistId = wordlists[0].id;
      }
    }

    let stats = getDefaultStats();
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        stats = {
          ...stats,
          streak: parsed.streak || 0,
          totalWordsLearned: parsed.totalWordsLearned || 0,
          sessionStartTime: Date.now(),
          sessionWordsCorrect: 0,
          sessionWordsTried: 0,
        };
      } catch {
        // ignore
      }
    }

    let dailyStats: Record<string, DailyStats> = {};
    if (savedDaily) {
      try {
        dailyStats = JSON.parse(savedDaily);
      } catch {
        // ignore
      }
    }

    return {
      wordlists,
      activeWordlistId,
      wordSort: "alpha",
      stats,
      dailyStats,
      definitionCache: {},
      lastSessionGoal: null,
    };
  } catch {
    const fallbackLists = ensureNonEmptyWordlists(undefined);
    return {
      wordlists: fallbackLists,
      activeWordlistId: fallbackLists[0].id,
      wordSort: "alpha",
      stats: getDefaultStats(),
      dailyStats: {},
      definitionCache: {},
      lastSessionGoal: null,
    };
  }
};

export const useVocabStore = create<VocabStoreState>()(
  persist(
    (set, get) => {
      const persistedInit = getInitialPersistedSlice();

      return {
        // Persisted
        wordlists: persistedInit.wordlists,
        activeWordlistId: persistedInit.activeWordlistId,
        wordSort: persistedInit.wordSort,
        stats: persistedInit.stats,
        dailyStats: persistedInit.dailyStats,
        definitionCache: persistedInit.definitionCache,
        lastSessionGoal: persistedInit.lastSessionGoal,

        // Non-persisted session
        isLearning: false,
        currentWordIndex: null,
        wordQueue: [],
        isSessionComplete: false,
        isGoalMet: false,
        sessionGoal: null,
        wordNonce: 0,

        selectWordlist: (id) => {
          set(() => ({
            activeWordlistId: id,
            isLearning: false,
            currentWordIndex: null,
            wordQueue: [],
            isSessionComplete: false,
            isGoalMet: false,
          }));
        },

        createWordlist: (name) => {
          const wlName = (name ?? "My List").trim() || "My List";
          const id = makeId();
          set((state) => ({
            wordlists: [...state.wordlists, { id, name: wlName, words: [] }],
            activeWordlistId: id,
            isLearning: false,
            currentWordIndex: null,
            wordQueue: [],
            isSessionComplete: false,
            isGoalMet: false,
          }));
        },

        renameActiveWordlist: (name) => {
          const nextName = name.trim();
          if (!nextName) return;
          set((state) => ({
            wordlists: state.wordlists.map((wl) =>
              wl.id === state.activeWordlistId ? { ...wl, name: nextName } : wl
            ),
          }));
        },

        clearActiveWordlist: () => {
          const state = get();
          const active =
            state.wordlists.find((wl) => wl.id === state.activeWordlistId) ??
            state.wordlists[0];
          const wordsToClear = active?.words ?? [];
          const wordTextsToClear = new Set<string>(wordsToClear.map((w) => w.word));

          set((s) => {
            const nextCache = { ...s.definitionCache };
            for (const t of wordTextsToClear) {
              if (t in nextCache) delete nextCache[t];
            }
            return {
              wordlists: s.wordlists.map((wl) =>
                wl.id === s.activeWordlistId ? { ...wl, words: [] } : wl
              ),
              definitionCache: nextCache,
              isLearning: false,
              isGoalMet: false,
            };
          });
        },

        deleteActiveWordlist: () => {
          const state = get();
          if (state.wordlists.length <= 1) {
            // Keep at least one list: treat as clear.
            get().clearActiveWordlist();
            return;
          }

          const current =
            state.wordlists.find((wl) => wl.id === state.activeWordlistId) ??
            state.wordlists[0];
          const remaining = state.wordlists.filter((wl) => wl.id !== state.activeWordlistId);
          const nextActiveId = remaining[0]?.id ?? "default";
          const wordsToRemove = current?.words ?? [];
          const wordTextsToRemove = new Set<string>(wordsToRemove.map((w) => w.word));

          set((s) => {
            const nextCache = { ...s.definitionCache };
            for (const t of wordTextsToRemove) {
              if (t in nextCache) delete nextCache[t];
            }
            return {
              wordlists: remaining,
              activeWordlistId: nextActiveId,
              definitionCache: nextCache,
              isLearning: false,
              currentWordIndex: null,
              wordQueue: [],
              isSessionComplete: false,
              isGoalMet: false,
            };
          });
        },

        setWordSort: (sort) => set(() => ({ wordSort: sort })),

        importWords: (text) => {
          const rawList = text
            .split(/[\n,]+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

          const state = get();
          const activeWords = getActiveWords(state);
          const existing = new Set(activeWords.map((w) => w.word.toLowerCase()));

          const toAdd: WordItem[] = rawList
            .map((w) => ({
              id: makeId(),
              word: w,
              successCount: 0,
              isMastered: false,
              totalAttempts: 0,
            }))
            .filter((w) => !existing.has(w.word.toLowerCase()));

          if (toAdd.length === 0) return;

          set((s) => ({
            wordlists: s.wordlists.map((wl) =>
              wl.id === s.activeWordlistId ? { ...wl, words: [...wl.words, ...toAdd] } : wl
            ),
          }));
        },

        removeWord: (wordId, wordText) => {
          set((s) => {
            const nextCache = { ...s.definitionCache };
            if (wordText in nextCache) delete nextCache[wordText];

            return {
              wordlists: s.wordlists.map((wl) =>
                wl.id === s.activeWordlistId
                  ? { ...wl, words: wl.words.filter((w) => w.id !== wordId) }
                  : wl
              ),
              definitionCache: nextCache,
              // If removing, safest to reset session selection/queue.
              isLearning: false,
              currentWordIndex: null,
              isGoalMet: false,
            };
          });
        },

        startLearning: (goal) => {
          set((s) => ({
            isLearning: true,
            isSessionComplete: false,
            isGoalMet: false,
            currentWordIndex: s.currentWordIndex,
            wordQueue: s.wordQueue,
            sessionGoal: goal ?? null,
            lastSessionGoal: goal ?? null,
            wordNonce: 0,
            stats: {
              ...s.stats,
              sessionStartTime: Date.now(),
              sessionWordsCorrect: 0,
              sessionWordsTried: 0,
            },
          }));
          get().pickNextWord(true);
        },

        endSession: () => {
          set(() => ({
            isLearning: false,
            sessionGoal: null,
            isGoalMet: false,
          }));
        },

        pickNextWord: (isInitial = false) => {
          const state = get();

          set((s) => {
            // Check Session Goal before picking next word
            if (!isInitial && s.sessionGoal && !s.isGoalMet) {
                const { type, target } = s.sessionGoal;
                let goalMet = false;
                if (type === 'total_words' && s.stats.sessionWordsTried >= target) {
                  goalMet = true;
                } else if (type === 'correct_words' && s.stats.sessionWordsCorrect >= target) {
                  goalMet = true;
                } else if (type === 'time') {
                  const elapsedMin = (Date.now() - s.stats.sessionStartTime) / 60000;
                  if (elapsedMin >= target) {
                    goalMet = true;
                  }
                }
                
                if (goalMet) {
                    return { isGoalMet: true };
                }
            }

            const words = getActiveWords(state);
            let nextIndex: number | null = null;
            let newQueue = [...s.wordQueue];

            const avoidIndex = !isInitial ? s.currentWordIndex : null;
            const hasAlternative =
              avoidIndex !== null
                ? words.some((w, idx) => idx !== avoidIndex && w && !w.isMastered)
                : false;

            while (newQueue.length > 0) {
              const candidateIndex = newQueue[0];
              newQueue = newQueue.slice(1);

              if (words[candidateIndex] && !words[candidateIndex].isMastered) {
                if (hasAlternative && avoidIndex !== null && candidateIndex === avoidIndex) {
                  continue;
                }
                nextIndex = candidateIndex;
                break;
              }
            }

            if (nextIndex === null) {
              const allCandidates = words.filter((w) => !w.isMastered);
              if (allCandidates.length === 0) {
                return {
                  isSessionComplete: true,
                  currentWordIndex: null,
                  wordQueue: [],
                };
              }

              const currentId = avoidIndex !== null ? words[avoidIndex]?.id : null;
              const candidates =
                currentId && allCandidates.length > 1
                  ? allCandidates.filter((w) => w.id !== currentId)
                  : allCandidates;

              const randomWord = candidates[Math.floor(Math.random() * candidates.length)];
              nextIndex = words.findIndex((w) => w.id === randomWord.id);
            }

            return {
              currentWordIndex: nextIndex,
              wordQueue: newQueue,
              wordNonce: s.wordNonce + 1,
            };
          });
        },

        fillQueueIfNeeded: () => {
          const state = get();
          if (!state.isLearning) return;

          const words = getActiveWords(state);
          if (words.length === 0) return;

          if (state.wordQueue.length >= PRELOAD_BUFFER_SIZE) return;

          const currentId = state.currentWordIndex !== null ? words[state.currentWordIndex]?.id : null;
          const unmastered = words.filter((w) => !w.isMastered);
          const candidates =
            currentId && unmastered.length > 1 ? unmastered.filter((w) => w.id !== currentId) : unmastered;

          if (candidates.length === 0) return;

          const needed = PRELOAD_BUFFER_SIZE - state.wordQueue.length;
          const newIndices: number[] = [];

          for (let i = 0; i < needed; i++) {
            const randomWord = candidates[Math.floor(Math.random() * candidates.length)];
            const idx = words.findIndex((w) => w.id === randomWord.id);

            if (!state.wordQueue.includes(idx) && !newIndices.includes(idx)) {
              newIndices.push(idx);
            } else if (candidates.length > PRELOAD_BUFFER_SIZE) {
              i--;
            } else {
              newIndices.push(idx);
            }
          }

          if (newIndices.length > 0) {
            set((s) => ({ wordQueue: [...s.wordQueue, ...newIndices] }));
          }
        },

        applyResult: (success, resetStreak, resetWordProgress = true) => {
          const state = get();
          const words = getActiveWords(state);
          if (state.currentWordIndex === null) return;
          if (!words[state.currentWordIndex]) return;

          const today = new Date().toISOString().split("T")[0];

          set((s) => {
            const currentDaily = s.dailyStats[today] || { tried: 0, success: 0 };
            const nextDailyStats = {
              ...s.dailyStats,
              [today]: {
                tried: currentDaily.tried + 1,
                success: currentDaily.success + (success ? 1 : 0),
              },
            };

            const nextStats: AppStats = {
              ...s.stats,
              sessionWordsTried: s.stats.sessionWordsTried + 1,
              sessionWordsCorrect: s.stats.sessionWordsCorrect + (success ? 1 : 0),
              streak: success ? s.stats.streak + 1 : resetStreak ? 0 : s.stats.streak,
              totalWordsLearned:
                s.stats.totalWordsLearned +
                (success && words[state.currentWordIndex!]?.successCount >= 2 ? 1 : 0),
            };

            const nextWordlists = s.wordlists.map((wl) => {
              if (wl.id !== s.activeWordlistId) return wl;
              const newWords = [...wl.words];
              const word = { ...newWords[state.currentWordIndex!] };
              newWords[state.currentWordIndex!] = word;

              word.totalAttempts++;

              if (success) {
                word.successCount++;
                if (word.successCount >= 3) {
                  word.isMastered = true;
                }
              } else if (resetWordProgress) {
                word.successCount = 0;
              }
              return { ...wl, words: newWords };
            });

            return {
              dailyStats: nextDailyStats,
              stats: nextStats,
              wordlists: nextWordlists,
              isGoalMet: s.isGoalMet, // Preserve existing goal state, don't update it here
            };
          });
        },

        continueSession: () => {
          set((s) => ({
            isGoalMet: false,
            sessionGoal: null, // Clear goal so it doesn't trigger again
          }));
          get().pickNextWord(false);
        },

        cacheDefinition: (wordText, def) => {
          set((s) => {
            if (s.definitionCache[wordText]) return s;
            return { definitionCache: { ...s.definitionCache, [wordText]: def } };
          });
        },

        resetAllData: () => {
          const fallbackLists = ensureNonEmptyWordlists(undefined);
          set(() => ({
            wordlists: fallbackLists,
            activeWordlistId: fallbackLists[0].id,
            wordSort: "alpha",
            stats: {
              ...getDefaultStats(),
              sessionWordsCorrect: 0,
              sessionWordsTried: 0,
            },
            dailyStats: {},
            definitionCache: {},
            isLearning: false,
            currentWordIndex: null,
            wordQueue: [],
            isSessionComplete: false,
          }));

          try {
            localStorage.removeItem(STORAGE_KEY_WORDS);
            localStorage.removeItem(STORAGE_KEY_WORDLISTS);
            localStorage.removeItem(STORAGE_KEY_ACTIVE_WORDLIST);
            localStorage.removeItem(STORAGE_KEY_STATS);
            localStorage.removeItem(STORAGE_KEY_DAILY);
          } catch {
            // ignore
          }
        },
      };
    },
    {
      name: "vocab-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        wordlists: state.wordlists,
        activeWordlistId: state.activeWordlistId,
        wordSort: state.wordSort,
        stats: {
          ...state.stats,
          // Don’t persist session counters (reset each session)
          sessionWordsCorrect: 0,
          sessionWordsTried: 0,
          sessionStartTime: Date.now(),
        },
        dailyStats: state.dailyStats,
        lastSessionGoal: state.lastSessionGoal,
        definitionCache: state.definitionCache,
      }),
    }
  )
);

export const selectActiveWordlist = (state: Pick<VocabStoreState, "wordlists" | "activeWordlistId">) =>
  state.wordlists.find((wl) => wl.id === state.activeWordlistId) ?? state.wordlists[0];
