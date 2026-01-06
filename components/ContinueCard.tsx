import React from "react";
import type { WordItem } from "../types";
import { RefreshCcw, Play, ChartSpline } from "lucide-react";

interface ContinueCardProps {
  words: WordItem[];
  onStart: () => void;
  onFlip: () => void;
}

const ContinueCard: React.FC<ContinueCardProps> = ({ words, onStart, onFlip }) => {
  const total = words.length;
  const mastered = words.filter((w) => w.isMastered).length;
  const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-2xl mx-auto mt-10 transition-colors duration-300 relative">
      <button
        type="button"
        onClick={onFlip}
        className="absolute right-3 top-3 p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
        aria-label="Flip to importer"
        title="Flip to import words"
      >
        <RefreshCcw className="w-4 h-4" />
      </button>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2"><ChartSpline  className="w-6 h-6 text-indigo-500 dark:text-indigo-400"/>Continue Learning</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-4">Keep the momentum going — you're doing great!</p>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>{mastered} mastered</span>
          <span>{total} total</span>
        </div>
        <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <button
        onClick={onStart}
        className="mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 justify-center"
      >
        <Play className="w-4 h-4" /> Start Session
      </button>
    </div>
  );
};

export default ContinueCard;
