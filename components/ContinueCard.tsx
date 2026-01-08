import React, { useState } from "react";
import type { WordItem, SessionGoal, SessionGoalType } from "../types";
import { useVocabStore } from "../store/vocabStore";
import {
  RefreshCcw,
  Play,
  ChartSpline,
  Target,
  Clock,
  Hash,
  CheckCircle2,
} from "lucide-react";

interface ContinueCardProps {
  words: WordItem[];
  onStart: (goal?: SessionGoal) => void;
  onFlip: () => void;
}

const ContinueCard: React.FC<ContinueCardProps> = ({
  words,
  onStart,
  onFlip,
}) => {
  const total = words.length;
  const mastered = words.filter((w) => w.isMastered).length;
  const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;

  const lastSessionGoal = useVocabStore((state) => state.lastSessionGoal);

  // Is the goal feature enabled? (Master switch)
  const [isGoalEnabled, setIsGoalEnabled] = useState<boolean>(() => !!lastSessionGoal);

  // Goal type and value. Initialized from last session or default, persisted even if disabled.
  const [goalType, setGoalType] = useState<SessionGoalType>(() => {
    return lastSessionGoal ? lastSessionGoal.type : "time";
  });
  const [targetValue, setTargetValue] = useState<number>(() => {
    return lastSessionGoal ? lastSessionGoal.target : 10;
  });

  const handleStart = () => {
    if (!isGoalEnabled) {
      onStart();
    } else {
      // For time, convert minutes to seconds or store as minutes?
      // Store typically works with raw numbers, let's assume minutes for input, convert to ms for storage if needed or keeping simple.
      // If store compares `Date.now() - start`, that is ms.
      // Let's store minutes in goal, convert when checking.
      // Actually, if I store "10" for time, the clear intention is minutes.
      onStart({ type: goalType, target: targetValue });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-2xl mx-auto mt-10 transition-colors duration-300 relative">
      <button
        type="button"
        onClick={onFlip}
        className="absolute right-3 top-3 p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
        aria-label="Flip to Importer"
        title="Flip to import words"
      >
        <RefreshCcw className="w-4 h-4" />
      </button>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
        <ChartSpline className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
        {mastered > 0 ? (total === mastered ? "Finished" : "Continue Learning") : "Start Learning"}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-4">
        {mastered > 0 ? (total === mastered ? "Well done! You've mastered all the words." : "Keep the momentum going — you're doing great!") : "It's time to start learning some new words!"}
      </p>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>{mastered} mastered</span>
          <span>{total} total</span>
        </div>
        <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-300 dark:from-indigo-700 to-indigo-500 dark:to-indigo-400 rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="mb-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 overflow-hidden transition-all duration-300">
        <button
          type="button"
          onClick={() => {
            setIsGoalEnabled(!isGoalEnabled);
          }}
          className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-left"
        >
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-500" />
            Session Goal
          </span>
          <div
            className={`w-10 h-6 rounded-full p-1 transition-colors ${
              isGoalEnabled
                ? "bg-indigo-500"
                : "bg-slate-200 dark:bg-slate-700"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                isGoalEnabled ? "translate-x-4" : ""
              }`}
            />
          </div>
        </button>

        <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isGoalEnabled ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <div className="px-4 pb-6 border-t border-slate-200 dark:border-slate-700/50 pt-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Goal Type Tabs (compact) */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                  {(['time', 'total_words', 'correct_words'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => { setGoalType(type); setTargetValue(type === 'time' ? 10 : type === 'total_words' ? 20 : 10); }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                        goalType === type
                          ? "bg-white dark:bg-slate-800 shadow-sm text-slate dark:text-white"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                      aria-pressed={goalType === type}
                      title={type === 'time' ? 'Time Goal' : type === 'total_words' ? 'Total Words Goal' : 'Correct Answers Goal'}
                    >
                      {type === 'time' && <Clock className="w-4 h-4" />}
                      {type === 'total_words' && <Hash className="w-4 h-4" />}
                      {type === 'correct_words' && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  ))}
                </div>

                {/* Target Value Input (compact with inline unit) */}
                <div className="flex items-center justify-center">
                  <div className="flex items-baseline">
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={targetValue}
                      onChange={(e) =>
                        setTargetValue(Math.max(1, parseInt(e.target.value) || 0))
                      }
                      className="w-20 text-center text-3xl font-bold bg-transparent border-b-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none text-slate-800 dark:text-white transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      style={{ WebkitAppearance: "none", MozAppearance: "textfield", appearance: "textfield", margin: 0 }}
                      aria-label="Target value"
                    />
                    <span className="ml-2 text-lg font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {goalType === 'time' ? 'minutes' : goalType === 'total_words' ? 'words' : 'correct'}
                    </span>
                  </div>
                </div>

                {/* Presets (compact chips) */}
                <div className="flex justify-end gap-1.5">
                  {(goalType === "time"
                    ? [5, 10, 30, 60]
                    : goalType === "total_words"
                    ? [20, 50, 100, 200]
                    : [10, 20, 50, 100]
                  ).map((val) => (
                    <button
                      key={val}
                      onClick={() => setTargetValue(val)}
                      className={`w-9 py-1 rounded-full text-sm font-medium border transition-colors ${
                        targetValue === val
                          ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                          : "bg-slate-50 dark:bg-slate-900/20 text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
                      }`}
                      aria-current={targetValue === val}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleStart}
        className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 justify-center"
      >
        <Play className="w-4 h-4" /> Start Session
      </button>
    </div>
  );
};

export default ContinueCard;
