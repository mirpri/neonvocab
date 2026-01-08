import React from "react";
import { PartyPopper, ArrowRight, Coffee } from "lucide-react";
import type { AppStats, SessionGoal } from "../types";

interface GoalMetPanelProps {
  stats: AppStats;
  goal: SessionGoal | null;
  onContinue: () => void;
  onQuit: () => void;
  allowContinue?: boolean;
  isDailyChallenge?: boolean;
}

const GoalMetPanel: React.FC<GoalMetPanelProps> = ({
  stats,
  goal,
  onContinue,
  onQuit,
  allowContinue = true,
  isDailyChallenge = false,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-white bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl text-center animate-in zoom-in-95 duration-300">
      <div className="mb-8 mt-4">
        <div className="flex items-center justify-center mb-4 gap-6">
          <PartyPopper className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-bounce" />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {isDailyChallenge ? "Challenge Completed" : "Goal Met!"}
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          {isDailyChallenge ? "Thanks for playing today's challenge!" : "You've reached your session goal."}
        </p>

        {isDailyChallenge ? (
          <div className="mt-6 inline-block bg-slate-100 dark:bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 w-full">
            <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">
              Your Score
            </div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {stats.sessionPoints ?? 0}
            </div>
          </div>
        ) : goal && (
          <div className="mt-6 inline-block bg-slate-100 dark:bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 w-full">
            <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">
              Target Reached
            </div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {goal.target}{" "}
              {(goal.type === "time"
                ? "min"
                : goal.type === "total_words"
                ? "word"
                : "correct answer") + (goal.target === 1 ? "" : "s")}
            </div>
          </div>
        )}
      </div>

      <div className={`grid ${allowContinue ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
        <button
          onClick={onQuit}
          className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Coffee className="w-5 h-5" />
          Take a Break
        </button>
        {allowContinue && (
          <button
            onClick={onContinue}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transform transition hover:scale-105 active:scale-95"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
          )}
      </div>
    </div>
  );
};

export default GoalMetPanel;
