import React, { useState, useEffect, useLayoutEffect, useMemo } from "react";
import Importer from "./components/Importer";
import ContinueCard from "./components/ContinueCard";
import LearningSession from "./components/LearningSession";
import StatsBoard from "./components/StatsBoard";
import NavBar from "./components/Navbar";
import WordListPanel from "./components/WordListPanel";
import FinishPage from "./components/FinishPage";
import GoalMetPanel from "./components/GoalMetCard";
import { LogOut } from "lucide-react";
import { fetchWordDefinition } from "./services/ai";
import { useVocabStore, selectActiveWordlist } from "./store/vocabStore";

const FLIP_DURATION_MS = 600;

function Flipper({
  showBack,
  front,
  back,
}: {
  showBack: boolean;
  front: React.ReactNode;
  back: React.ReactNode;
}) {
  const [height, setHeight] = useState<number | undefined>(undefined);
  // Track if we are actively flipping to control transition on height
  const [isFlipping, setIsFlipping] = useState(false);
  const frontRef = React.useRef<HTMLDivElement>(null);
  const backRef = React.useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setIsFlipping(true);
    const t = setTimeout(() => setIsFlipping(false), FLIP_DURATION_MS);
    return () => clearTimeout(t);
  }, [showBack]);

  useEffect(() => {
    const target = showBack ? backRef.current : frontRef.current;
    if (!target) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });

    ro.observe(target);
    return () => ro.disconnect();
  }, [showBack]);

  return (
    <div className="relative w-full" style={{ perspective: "1000px" }}>
      <div
        className="relative ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: showBack ? "rotateY(180deg)" : "rotateY(0deg)",
          height: height ? `${height}px` : "auto",
          transition: `transform ${FLIP_DURATION_MS}ms ease-in-out, height ${
            isFlipping ? FLIP_DURATION_MS : 0
          }ms ease-in-out`,
        }}
      >
        {/* Front */}
        <div
          ref={frontRef}
          className="absolute top-0 left-0 w-full"
          style={{
            transform: "rotateY(0deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            MozBackfaceVisibility: "hidden",
            pointerEvents: showBack ? "none" : "auto",
          }}
          aria-hidden={showBack}
        >
          {front}
        </div>

        {/* Back */}
        <div
          ref={backRef}
          className="absolute top-0 left-0 w-full"
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            MozBackfaceVisibility: "hidden",
            pointerEvents: showBack ? "auto" : "none",
          }}
          aria-hidden={!showBack}
        >
          {back}
        </div>
      </div>
    </div>
  );
}

const STORAGE_KEY_THEME = "vocab-theme";
const STORAGE_KEY_BG_ENABLED = "vocab-bg-enabled";
const STORAGE_KEY_BG_CUSTOM_URL = "vocab-bg-custom-url";

// Direct image URL (no fetch/CORS). See https://bing.img.run/
const BING_DAILY_IMAGE_URL = "https://bing.img.run/1920x1080.php";

function App() {
  const wordlists = useVocabStore((s) => s.wordlists);
  const activeWordlistId = useVocabStore((s) => s.activeWordlistId);
  const wordSort = useVocabStore((s) => s.wordSort);
  const isLearning = useVocabStore((s) => s.isLearning);
  const sessionGoal = useVocabStore((s) => s.sessionGoal);
  const isGoalMet = useVocabStore((s) => s.isGoalMet);
  const wordNonce = useVocabStore((s) => s.wordNonce);
  const currentWordIndex = useVocabStore((s) => s.currentWordIndex);
  const wordQueue = useVocabStore((s) => s.wordQueue);
  const isSessionComplete = useVocabStore((s) => s.isSessionComplete);
  const definitionCache = useVocabStore((s) => s.definitionCache);
  const stats = useVocabStore((s) => s.stats);
  const dailyStats = useVocabStore((s) => s.dailyStats);

  const setWordSort = useVocabStore((s) => s.setWordSort);
  const importWords = useVocabStore((s) => s.importWords);
  const removeWord = useVocabStore((s) => s.removeWord);
  const startLearning = useVocabStore((s) => s.startLearning);
  const continueSession = useVocabStore((s) => s.continueSession);
  const endSession = useVocabStore((s) => s.endSession);
  const pickNextWord = useVocabStore((s) => s.pickNextWord);
  const fillQueueIfNeeded = useVocabStore((s) => s.fillQueueIfNeeded);
  const applyResult = useVocabStore((s) => s.applyResult);
  const resetAllData = useVocabStore((s) => s.resetAllData);
  const selectWordlist = useVocabStore((s) => s.selectWordlist);
  const createWordlist = useVocabStore((s) => s.createWordlist);
  const renameActiveWordlist = useVocabStore((s) => s.renameActiveWordlist);
  const deleteActiveWordlist = useVocabStore((s) => s.deleteActiveWordlist);
  const clearActiveWordlist = useVocabStore((s) => s.clearActiveWordlist);
  const cacheDefinition = useVocabStore((s) => s.cacheDefinition);

  const activeWordlist = useMemo(
    () => selectActiveWordlist({ wordlists, activeWordlistId }),
    [wordlists, activeWordlistId]
  );
  const words = activeWordlist?.words ?? [];
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved) return saved as "dark" | "light";
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "dark";
  });

  const [backgroundEnabled, setBackgroundEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(STORAGE_KEY_BG_ENABLED) === "true";
    } catch {
      return false;
    }
  });
  const [backgroundUrl, setBackgroundUrl] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem(STORAGE_KEY_BG_CUSTOM_URL) ?? "";
    } catch {
      return "";
    }
  });
  const [resolvedBackgroundUrl, setResolvedBackgroundUrl] =
    useState<string>("");
  const [showImporter, setShowImporter] = useState<boolean>(false);

  // (vocab state now lives in Zustand)

  // End session with Escape
  useEffect(() => {
    if (!isLearning) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        endSession();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLearning, endSession]);

  // Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  // Background persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BG_ENABLED, String(backgroundEnabled));
      localStorage.setItem(STORAGE_KEY_BG_CUSTOM_URL, backgroundUrl);
    } catch {
      // ignore
    }
  }, [backgroundEnabled, backgroundUrl]);

  // Resolve background URL (custom overrides Bing daily)
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!backgroundEnabled) {
        if (!cancelled) setResolvedBackgroundUrl("");
        return;
      }

      const trimmedCustom = backgroundUrl.trim();
      if (trimmedCustom) {
        if (!cancelled) setResolvedBackgroundUrl(trimmedCustom);
        return;
      }

      if (!cancelled) setResolvedBackgroundUrl(BING_DAILY_IMAGE_URL);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [backgroundEnabled, backgroundUrl]);

  // Queue Management
  useEffect(() => {
    if (!isLearning) return;
    fillQueueIfNeeded();
  }, [isLearning, wordQueue.length, words, fillQueueIfNeeded]);

  // Fetch definitions for words in queue AND current word
  useEffect(() => {
    const indicesToFetch = new Set([...wordQueue]);
    if (currentWordIndex !== null) indicesToFetch.add(currentWordIndex);

    indicesToFetch.forEach((index) => {
      if (!words[index]) return;
      const wordText = words[index].word;
      if (definitionCache[wordText]) return;

      fetchWordDefinition(wordText).then((def) => {
        cacheDefinition(wordText, def);
      });
    });
  }, [wordQueue, currentWordIndex, words, definitionCache, cacheDefinition]);

  const currentWord =
    currentWordIndex !== null ? words[currentWordIndex] : null;
  const displayedWords = React.useMemo(() => {
    const copy = [...words];
    if (wordSort === "correct") {
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

  const handleImport = (text: string) => importWords(text);
  const handleRemoveWord = (wordId: string, wordText: string) =>
    removeWord(wordId, wordText);

  const handleSelectWordlist = (id: string) => selectWordlist(id);
  const handleCreateWordlist = () => {
    const name = window.prompt("New wordlist name:", "My List")?.trim();
    if (!name) return;
    createWordlist(name);
  };
  const handleRenameWordlist = () => {
    const currentName = activeWordlist?.name ?? "My List";
    const nextName = window.prompt("Rename wordlist:", currentName)?.trim();
    if (!nextName) return;
    renameActiveWordlist(nextName);
  };
  const handleDeleteWordlist = () => {
    const currentName = activeWordlist?.name ?? "this list";
    if (wordlists.length <= 1) {
      const listName = activeWordlist?.name ?? "this list";
      if (
        window.confirm(
          `Clear all words and progress in "${listName}"? (Daily stats and other lists will stay.)`
        )
      ) {
        clearActiveWordlist();
      }
      return;
    }
    if (
      window.confirm(`Delete wordlist "${currentName}"? This cannot be undone.`)
    ) {
      deleteActiveWordlist();
    }
  };

  const handleDeleteAll = () => {
    if (
      window.confirm("Are you sure you want to delete all words and progress?")
    ) {
      resetAllData();
    }
  };

  const handleResult = (
    success: boolean,
    resetStreak: boolean,
    resetWordProgress: boolean = true
  ) => {
    applyResult(success, resetStreak, resetWordProgress);
  };

  return (
    <div
      className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 transition-colors duration-300"
      style={
        resolvedBackgroundUrl
          ? {
              backgroundImage: `url(\"${resolvedBackgroundUrl}\")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
            }
          : undefined
      }
    >
      
      {!isLearning && (
        <NavBar
          theme={theme}
          onToggleTheme={() =>
            setTheme((prev) => (prev === "dark" ? "light" : "dark"))
          }
          backgroundEnabled={backgroundEnabled}
          backgroundUrl={backgroundUrl}
          onToggleBackground={() => setBackgroundEnabled((v) => !v)}
          onChangeBackgroundUrl={setBackgroundUrl}
          onResetData={handleDeleteAll}
          hasWords={words.length > 0}
        />
      )}

      <main className="flex-1 px-6 pt-6 pd-0 flex flex-col max-w-5xl mx-auto w-full relative z-10 overflow-x-hidden">
        <StatsBoard
          stats={stats}
          dailyStats={dailyStats}
          words={words}
          isLearning={isLearning}
          goal={sessionGoal}
        />

        {!isLearning ? (
          <>
            {(() => {
              const showingImporter = words.length === 0 ? true : showImporter;
              return (
                <div className="relative z-20 mb-10">
                  <Flipper
                    showBack={showingImporter}
                    front={
                      <ContinueCard
                        words={words}
                        onStart={startLearning}
                        onFlip={() => setShowImporter(true)}
                      />
                    }
                    back={
                      <Importer
                        onImport={handleImport}
                        hasWords={words.length > 0}
                        onFlip={() => setShowImporter(false)}
                      />
                    }
                  />
                </div>
              );
            })()}

            <WordListPanel
              activeWordlistName={activeWordlist?.name ?? "Your Word List"}
              words={words}
              displayedWords={displayedWords}
              wordSort={wordSort}
              onChangeSort={setWordSort}
              wordlists={wordlists}
              activeWordlistId={activeWordlistId}
              onSelectWordlist={handleSelectWordlist}
              onCreateWordlist={handleCreateWordlist}
              onRenameWordlist={handleRenameWordlist}
              onDeleteWordlist={handleDeleteWordlist}
              onRemoveWord={handleRemoveWord}
            />
          </>
        ) : (
          <>
            <div className="w-full text-sm text-slate-500 dark:text-white/60 mx-auto w-full items-end flex justify-end">
              <button
                onClick={endSession}
                className="hover:text-slate-900 dark:hover:text-white flex items-center gap-2 px-3 py-1 rounded hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-4 h-4" /> End Session
              </button>
            </div>
          <div className="flex flex-col items-center justify-center flex-1">
            {isGoalMet ? (
              <GoalMetPanel
                stats={stats}
                goal={sessionGoal}
                onContinue={continueSession}
                onQuit={endSession}
              />
            ) : currentWord && !isSessionComplete ? (
              <LearningSession
                key={`${currentWord.id}-${wordNonce}`}
                wordItem={currentWord}
                definitionData={definitionCache[currentWord.word]}
                onResult={handleResult}
                onNext={() => pickNextWord(false)}
              />
            ) : isSessionComplete ? (
              <FinishPage
                wordsCount={words.length}
                daysActiveCount={Object.keys(dailyStats).length}
                totalMasteredCount={stats.totalWordsLearned}
                onBack={endSession}
              />
            ) : (
              <div className="text-center">
                <p className="text-slate-500 dark:text-slate-400">
                  No words available
                </p>
                <button
                  onClick={endSession}
                  className="text-indigo-500 dark:text-indigo-400 underline mt-2"
                >
                  Go back
                </button>
              </div>
            )}
          </div>
          </>
        )}
        <footer className="my-6 text-center text-slate-400 dark:text-white/30 text-sm relative transition-colors duration-300">
          <p>Powered by AI &copy; 2026 Mirpri</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
