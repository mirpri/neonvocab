import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WordItem, AppStats, DefinitionResponse, DailyStats } from './types';
import Importer from './components/Importer';
import LearningSession from './components/LearningSession';
import StatsBoard from './components/StatsBoard';
import { University, Trash2, LogOut, Sun, Moon, PartyPopper, Github } from 'lucide-react';
import { fetchWordDefinition } from './services/ai';

const STORAGE_KEY_WORDS = 'vocab-words';
const STORAGE_KEY_STATS = 'vocab-stats';
const STORAGE_KEY_DAILY = 'vocab-daily';
const STORAGE_KEY_THEME = 'vocab-theme';
const PRELOAD_BUFFER_SIZE = 3; 

function App() {
  const [words, setWords] = useState<WordItem[]>([]);
    const [wordSort, setWordSort] = useState<'alpha' | 'correct'>('alpha');
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);
  const [isLearning, setIsLearning] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY_THEME);
        if (saved) return saved as 'dark' | 'light';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });
  
  // Cache for definitions to avoid re-fetching and support pre-loading
  const [definitionCache, setDefinitionCache] = useState<Record<string, DefinitionResponse>>({});
  const [wordQueue, setWordQueue] = useState<number[]>([]); // Indices of words in queue
  
  const [stats, setStats] = useState<AppStats>({
    streak: 0,
    totalWordsLearned: 0,
    sessionWordsCorrect: 0,
    sessionWordsTried: 0,
    sessionStartTime: Date.now(),
  });

  const [dailyStats, setDailyStats] = useState<Record<string, DailyStats>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

    const endSession = useCallback(() => {
        setIsLearning(false);
    }, []);

    // End session with Escape
    useEffect(() => {
        if (!isLearning) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                endSession();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isLearning, endSession]);

  // Load from local storage on mount
  useEffect(() => {
    const savedWords = localStorage.getItem(STORAGE_KEY_WORDS);
    const savedStats = localStorage.getItem(STORAGE_KEY_STATS);
    const savedDaily = localStorage.getItem(STORAGE_KEY_DAILY);

    if (savedWords) {
      setWords(JSON.parse(savedWords));
    }
    if (savedStats) {
      const parsed = JSON.parse(savedStats);
      setStats(prev => ({
        ...prev,
        streak: parsed.streak || 0,
        totalWordsLearned: parsed.totalWordsLearned || 0,
        sessionStartTime: Date.now(),
        sessionWordsCorrect: 0,
        sessionWordsTried: 0
      }));
    }
    if (savedDaily) {
        setDailyStats(JSON.parse(savedDaily));
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY_WORDS, JSON.stringify(words));
  }, [words, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const toSave = {
        streak: stats.streak,
        totalWordsLearned: stats.totalWordsLearned
    };
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(toSave));
  }, [stats.streak, stats.totalWordsLearned, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY_DAILY, JSON.stringify(dailyStats));
  }, [dailyStats, isLoaded]);

  // Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  // Queue Management and Pre-fetching
  useEffect(() => {
    if (!isLearning) return;
    
    // Check if we need to fill the queue
    if (wordQueue.length < PRELOAD_BUFFER_SIZE && words.length > 0) {
        const candidates = words.filter(w => !w.isMastered);
        
        // Only fill queue if there are unmastered candidates
        if (candidates.length > 0) {
           const needed = PRELOAD_BUFFER_SIZE - wordQueue.length;
           const newIndices: number[] = [];
           // Simple random fill
           for(let i=0; i<needed; i++) {
               const randomWord = candidates[Math.floor(Math.random() * candidates.length)];
               const idx = words.findIndex(w => w.id === randomWord.id);
               // Avoid duplicates in the immediate queue if possible
               if (!wordQueue.includes(idx) && !newIndices.includes(idx)) {
                   newIndices.push(idx);
               } else if (candidates.length > PRELOAD_BUFFER_SIZE) {
                   i--; // Retry if we have enough candidates
               } else {
                   newIndices.push(idx); // Duplicate okay if list is small
               }
           }
           if (newIndices.length > 0) {
               setWordQueue(prev => [...prev, ...newIndices]);
           }
        }
    }
  }, [wordQueue.length, isLearning, words]);

  // Fetch definitions for words in queue AND current word
  useEffect(() => {
      const indicesToFetch = new Set([...wordQueue]);
      if (currentWordIndex !== null) indicesToFetch.add(currentWordIndex);

      indicesToFetch.forEach(index => {
          if (!words[index]) return;
          const wordText = words[index].word;
          
          if (!definitionCache[wordText]) {
              fetchWordDefinition(wordText).then(def => {
                  setDefinitionCache(prev => {
                      if (prev[wordText]) return prev; // Already added
                      return { ...prev, [wordText]: def };
                  });
              });
          }
      });
  }, [wordQueue, currentWordIndex, words, definitionCache]);


  const handleImport = (text: string) => {
    const rawList = text.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
    const newWords: WordItem[] = rawList.map(w => ({
      id: Math.random().toString(36).substring(7),
      word: w,
      successCount: 0,
      isMastered: false,
      totalAttempts: 0
    }));

    // Filter duplicates
    const existingWords = new Set(words.map(w => w.word.toLowerCase()));
    const uniqueNewWords = newWords.filter(w => !existingWords.has(w.word.toLowerCase()));

    setWords(prev => [...prev, ...uniqueNewWords]);
  };

  const startLearning = () => {
    setStats(prev => ({
      ...prev,
      sessionStartTime: Date.now(),
      sessionWordsCorrect: 0,
      sessionWordsTried: 0
    }));
    setIsLearning(true);
    setIsSessionComplete(false);
    // Passing true triggers initial selection logic
    pickNextWord(true); 
  };

  const pickNextWord = useCallback((isInitial = false) => {
    setSessionKey(prev => prev + 1);
    setWordQueue(prevQueue => {
        let nextIndex: number | null = null;
        let newQueue = [...prevQueue];

        // Try to get a valid word from the queue
        while (newQueue.length > 0) {
            const candidateIndex = newQueue[0];
            newQueue = newQueue.slice(1);
            
            // Check if this word is still valid (not mastered)
            if (words[candidateIndex] && !words[candidateIndex].isMastered) {
                nextIndex = candidateIndex;
                break;
            }
        }

        // If queue didn't provide a valid word, pick one randomly
        if (nextIndex === null) {
            const candidates = words.filter(w => !w.isMastered);
            
            if (candidates.length === 0) {
                // All words mastered!
                setIsSessionComplete(true);
                setCurrentWordIndex(null); // Clear current word
                return [];
            }

            const randomWord = candidates[Math.floor(Math.random() * candidates.length)];
            nextIndex = words.findIndex(w => w.id === randomWord.id);
        }

        setCurrentWordIndex(nextIndex);
        return newQueue;
    });
  }, [words]);


  const handleResult = (success: boolean, resetStreak: boolean, resetWordProgress: boolean = true) => {
    if (currentWordIndex === null) return;
    
    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    setDailyStats(prev => {
        const current = prev[today] || { tried: 0, success: 0 };
        return {
            ...prev,
            [today]: {
                tried: current.tried + 1,
                success: current.success + (success ? 1 : 0)
            }
        };
    });

    // Update Session Stats
    setStats(s => ({
        ...s,
        sessionWordsTried: s.sessionWordsTried + 1,
        sessionWordsCorrect: s.sessionWordsCorrect + (success ? 1 : 0),
        streak: success ? s.streak + 1 : (resetStreak ? 0 : s.streak),
        totalWordsLearned: s.totalWordsLearned + (success && words[currentWordIndex].successCount >= 2 ? 1 : 0)
    }));

    setWords(prev => {
      const newWords = [...prev];
      // Create a shallow copy of the word object to avoid direct mutation in StrictMode
      const word = { ...newWords[currentWordIndex] };
      newWords[currentWordIndex] = word;
      
      word.totalAttempts++;

      if (success) {
        word.successCount++;
        if (word.successCount >= 3) {
          word.isMastered = true;
        }
      } else if (resetWordProgress) {
        word.successCount = 0; 
      }
      return newWords;
    });
  };

  const handleDeleteAll = () => {
      if(window.confirm("Are you sure you want to delete all words and progress?")) {
          setWords([]);
          setDefinitionCache({});
          setWordQueue([]);
          setDailyStats({});
          setIsLearning(false);
          setStats(s => ({...s, streak: 0, totalWordsLearned: 0, sessionWordsCorrect: 0, sessionWordsTried: 0}));
          localStorage.removeItem(STORAGE_KEY_WORDS);
          localStorage.removeItem(STORAGE_KEY_STATS);
          localStorage.removeItem(STORAGE_KEY_DAILY);
      }
  }

  const currentWord = currentWordIndex !== null ? words[currentWordIndex] : null;
    const displayedWords = React.useMemo(() => {
        const copy = [...words];
        if (wordSort === 'correct') {
            copy.sort((a, b) => {
                const diff = (b.successCount ?? 0) - (a.successCount ?? 0);
                if (diff !== 0) return diff;
                return a.word.localeCompare(b.word);
            });
            return copy;
        }

        copy.sort((a, b) => a.word.localeCompare(b.word));
        return copy;
    }, [words, wordSort]);

    const handleRemoveWord = useCallback((wordId: string, wordText: string) => {
        setWords(prev => prev.filter(w => w.id !== wordId));
        setDefinitionCache(prev => {
            if (!prev[wordText]) return prev;
            const copy = { ...prev };
            delete copy[wordText];
            return copy;
        });
    }, []);

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 overflow-x-hidden transition-colors duration-300">
      <header className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
                    <University className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-600 dark:from-white dark:to-indigo-200">
                    NeonVocab
                </h1>
            </div>
            
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                    aria-label="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <button
                    onClick={() => window.open('https://github.com/mirpri/neonvocab', '_blank')}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                    aria-label="Toggle Theme"
                >
                    <Github className="w-4 h-4" />
                </button>

                {words.length > 0 && (
                    <button 
                        onClick={handleDeleteAll}
                        className="text-xs text-slate-500 dark:text-white/50 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                        <Trash2 className="w-3 h-3" /> Reset Data
                    </button>
                )}
            </div>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col max-w-5xl mx-auto w-full relative z-10">
        <StatsBoard 
            stats={stats} 
            dailyStats={dailyStats} 
            words={words} 
            isLearning={isLearning}
        />

        {!isLearning ? (
          <div className="animate-pop">
             <Importer 
                onImport={handleImport} 
                onStart={startLearning} 
                hasWords={words.length > 0}
            />
            
            {words.length > 0 && (
                <div className="mt-12 bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-sm flex flex-col max-h-[60vh] transition-colors duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 flex-shrink-0">
                        <h3 className="text-slate-500 dark:text-white/70 font-bold uppercase text-sm tracking-wider">Your Word List ({words.length})</h3>
                        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/5 p-1 border border-slate-200 dark:border-white/10">
                            <button
                                type="button"
                                onClick={() => setWordSort('alpha')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${wordSort === 'alpha'
                                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow'
                                    : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                                }`}
                                aria-pressed={wordSort === 'alpha'}
                            >
                                Alphabet
                            </button>
                            <button
                                type="button"
                                onClick={() => setWordSort('correct')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${wordSort === 'correct'
                                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow'
                                    : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                                }`}
                                aria-pressed={wordSort === 'correct'}
                            >
                                Times Correct
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 overflow-y-auto pr-2 custom-scrollbar">
                        {displayedWords.map(w => (
                            <div key={w.id} className={`relative p-3 rounded-lg border transition-all ${w.isMastered ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400' : 'border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5 text-slate-700 dark:text-slate-300'} text-center text-sm font-medium`}>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleRemoveWord(w.id, w.word);
                                    }}
                                    className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                    aria-label={`Remove ${w.word}`}
                                    title="Remove"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>

                                {w.word}
                                <div className="flex justify-center gap-1 mt-2 h-1">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className={`w-full rounded-full ${i < w.successCount ? (w.isMastered ? 'bg-green-500' : 'bg-indigo-500') : 'bg-slate-200 dark:bg-white/10'}`}></div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1">
             <div className="w-full mb-4 flex justify-between items-center text-sm text-slate-500 dark:text-white/60">
                     <button onClick={endSession} className="hover:text-slate-900 dark:hover:text-white flex items-center gap-2 px-3 py-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                    <LogOut className="w-4 h-4" /> End Session
                </button>
             </div>

             {currentWord && !isSessionComplete ? (
                <LearningSession 
                    key={sessionKey}
                    wordItem={currentWord} 
                    definitionData={definitionCache[currentWord.word]}
                    onResult={handleResult}
                    onNext={() => pickNextWord()}
                />
             ) : isSessionComplete ? (
                <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-green-500/50 dark:border-green-500 text-center animate-pop transition-colors duration-300">
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <PartyPopper className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">All Words Mastered!</h2>
                        <p className="text-slate-600 dark:text-slate-400">You've successfully learned all {words.length} words in your list.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-transparent">
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{Object.keys(dailyStats).length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Days Active</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-transparent">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalWordsLearned}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Total Mastered</div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button 
                            onClick={() => {
                                const text = `I just mastered ${words.length} words with NeonVocab! 🚀`;
                                navigator.clipboard.writeText(text);
                                alert("Copied to clipboard!");
                            }}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            Share Achievement
                        </button>
                        <button 
                            onClick={endSession}
                            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl font-bold transition-colors"
                        >
                            Back to List
                        </button>
                    </div>
                </div>
             ) : (
                <div className="text-center">
                    <p className="text-slate-500 dark:text-slate-400">No words available or loading...</p>
                    <button onClick={endSession} className="text-indigo-500 dark:text-indigo-400 underline mt-2">Go back</button>
                </div>
             )}
          </div>
        )}
      </main>
      
      <footer className="py-6 text-center text-slate-400 dark:text-white/30 text-sm relative z-10 transition-colors duration-300">
        <p>Powered by AI</p>
      </footer>
    </div>
  );
}

export default App;