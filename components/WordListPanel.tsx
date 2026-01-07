import React from "react";
import { Trash2, Pencil, ListPlus, X, ChevronDown, Check, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { WordItem, WordList } from "../types";

interface WordListPanelProps {
  activeWordlistName: string;
  words: WordItem[];
  displayedWords: WordItem[];
  wordSort: "alpha" | "correct";
  onChangeSort: (sort: "alpha" | "correct") => void;

  wordlists: WordList[];
  activeWordlistId: string;
  onSelectWordlist: (id: string) => void;
  onCreateWordlist: () => void;
  onRenameWordlist: () => void;
  onDeleteWordlist: () => void;

  onRemoveWord: (wordId: string, wordText: string) => void;
}

const ITEMS_PER_PAGE = 60;

const WordListPanel: React.FC<WordListPanelProps> = ({
  activeWordlistName,
  words,
  displayedWords,
  wordSort,
  onChangeSort,
  wordlists,
  activeWordlistId,
  onSelectWordlist,
  onCreateWordlist,
  onRenameWordlist,
  onDeleteWordlist,
  onRemoveWord,
}) => {
  const [isWordlistMenuOpen, setIsWordlistMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const wordlistMenuRef = React.useRef<HTMLDivElement | null>(null);
  const iconButtonTone =
    "p-2 rounded-lg bg-slate-100/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200/50 dark:border-white/10";
  const activeWordlist = React.useMemo(
    () => wordlists.find((wl) => wl.id === activeWordlistId) ?? null,
    [wordlists, activeWordlistId]
  );

  const filteredWords = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return displayedWords;
    return displayedWords.filter((w) => w.word.toLowerCase().startsWith(q));
  }, [displayedWords, search]);

  const totalPages = Math.ceil(filteredWords.length / ITEMS_PER_PAGE);
  const paginatedWords = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredWords.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredWords, currentPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeWordlistId, search, wordSort]);

  React.useEffect(() => {
    if (!isWordlistMenuOpen) return;

    const onPointerDown = (e: MouseEvent | PointerEvent) => {
      const el = wordlistMenuRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setIsWordlistMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsWordlistMenuOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isWordlistMenuOpen]);

  return (
    <div className="mt-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl backdrop-saturate-150 p-6 rounded-2xl border border-white/20 dark:border-white/10 shadow-lg flex flex-col max-h-[60vh] transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 flex-shrink-0">
        <div className="flex flex-1 justify-between items-center gap-2">
          <h3 className="text-slate-500 dark:text-white/70 font-bold uppercase tracking-wider">
            {activeWordlistName} ({words.length})
          </h3>

          <div className="inline-flex rounded-lg bg-slate-100/60 dark:bg-white/5 p-1 border border-slate-200/50 dark:border-white/10">
            <button
              type="button"
              onClick={() => onChangeSort("alpha")}
              className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                wordSort === "alpha"
                  ? "bg-white dark:bg-slate-800/60 text-slate-700 dark:text-white shadow"
                  : "text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
              }`}
              aria-pressed={wordSort === "alpha"}
            >
              Alphabet
            </button>
            <button
              type="button"
              onClick={() => onChangeSort("correct")}
              className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                wordSort === "correct"
                  ? "bg-white dark:bg-slate-800/60 text-slate-700 dark:text-white shadow"
                  : "text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
              }`}
              aria-pressed={wordSort === "correct"}
            >
              Score
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center gap-2">
          <div className="relative" ref={wordlistMenuRef}>
            <button
              type="button"
              onClick={() => setIsWordlistMenuOpen((v) => !v)}
              className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 ${iconButtonTone} text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              aria-haspopup="listbox"
              aria-expanded={isWordlistMenuOpen}
              aria-label="Select wordlist"
            >
              <span className="max-w-[12rem] truncate">
                {activeWordlist?.name ?? "Select list"}
              </span>
              <ChevronDown className="w-4 h-4 opacity-70" />
            </button>

            {isWordlistMenuOpen && (
              <div
                role="listbox"
                aria-label="Wordlists"
                className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-lg overflow-hidden z-50"
              >
                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                  {wordlists.map((wl) => {
                    const isActive = wl.id === activeWordlistId;
                    return (
                      <button
                        key={wl.id}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => {
                          onSelectWordlist(wl.id);
                          setIsWordlistMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                          isActive
                            ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10"
                        }`}
                      >
                        <span className="w-4 h-4 flex items-center justify-center">
                          {isActive ? <Check className="w-4 h-4" /> : null}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{wl.name}</span>
                        <span className="text-xs text-slate-400 dark:text-white/30">
                          {wl.words.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onCreateWordlist}
            className={iconButtonTone}
            aria-label="Create new wordlist"
            title="New wordlist"
          >
            <ListPlus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onRenameWordlist}
            className={iconButtonTone}
            aria-label="Rename current wordlist"
            title="Rename"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onDeleteWordlist}
            className={`${iconButtonTone} hover:text-red-500 dark:hover:text-red-400`}
            aria-label="Delete current wordlist"
            title="Delete Wordlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSearchOpen((v) => {
                const next = !v;
                if (!next) setSearch("");
                return next;
              });
            }}
            className={iconButtonTone}
            aria-label="Toggle search"
            title="Search"
          >
            <Search className={`w-4 h-4 ${isSearchOpen ? "text-indigo-500" : ""}`} />
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search words (starts with)"
              className="w-full bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">{filteredWords.length} / {displayedWords.length}</span>
        </div>
      )}

      {paginatedWords.length > 0 ? (
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 overflow-y-auto pr-2 custom-scrollbar content-start">
          {paginatedWords.map((w) => (
            <div
              key={w.id}
              className={`relative p-3 rounded-lg border transition-all ${
                w.isMastered
                  ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
                  : "border-slate-200 dark:border-white/5 bg-white/25 dark:bg-white/5 text-slate-700 dark:text-slate-300"
              } text-center text-sm font-medium`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemoveWord(w.id, w.word);
                }}
                className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                aria-label={`Remove ${w.word}`}
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <button
                className="min-w-0 w-full block truncate"
                title={w.word}
                onClick={() =>
                  window.open(
                    `https://www.merriam-webster.com/dictionary/${encodeURIComponent(
                      w.word
                    )}`,
                    "_blank"
                  )
                }
              >
                {w.word}
              </button>
              <div className="flex justify-center gap-1 mt-2 h-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-full rounded-full ${
                      i < w.successCount
                        ? "bg-green-500"
                        : "bg-slate-200 dark:bg-white/10"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 min-h-[8rem] flex items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5">
          <p className="text-sm text-slate-500 dark:text-white/50 text-center px-6">
            This wordlist is empty. Import words or create another list.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-2 border-slate-200 dark:border-white/10 flex-shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600 dark:text-slate-400"
              aria-label="First page"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600 dark:text-slate-400"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 px-2">
            <span>Page</span>
            <input
              key={currentPage}
              defaultValue={currentPage}
              className="w-12 p-1 text-center bg-transparent border rounded border-slate-300 dark:border-white/20 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = parseInt(e.currentTarget.value);
                  if (!isNaN(val)) {
                    const p = Math.min(Math.max(1, val), totalPages);
                    setCurrentPage(p);
                    if (p !== val) e.currentTarget.value = p.toString();
                  } else {
                    e.currentTarget.value = currentPage.toString();
                  }
                  e.currentTarget.blur();
                }
              }}
              onBlur={(e) => {
                const val = parseInt(e.currentTarget.value);
                if (!isNaN(val)) {
                  const p = Math.min(Math.max(1, val), totalPages);
                  if (p !== currentPage) setCurrentPage(p);
                  e.currentTarget.value = p.toString();
                } else {
                  e.currentTarget.value = currentPage.toString();
                }
              }}
            />
            <span>of {totalPages}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600 dark:text-slate-400"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600 dark:text-slate-400"
              aria-label="Last page"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordListPanel;
