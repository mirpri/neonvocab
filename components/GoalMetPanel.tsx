import React from "react";
import { PartyPopper, ArrowRight, LogOut } from "lucide-react";
import type { AppStats, SessionGoal } from "../types";

interface GoalMetPanelProps {
  stats: AppStats;
  goal: SessionGoal | null;
  onContinue: () => void;
  onQuit: () => void;
}

const GoalMetPanel: React.FC<GoalMetPanelProps> = ({
  stats,
  goal,
  onContinue,
  onQuit,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-white bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl text-center animate-in zoom-in-95 duration-300">
      <div className="mb-8">
        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <PartyPopper className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Goal Met!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          You've reached your session goal.
        </p>

        {goal && (
          <div className="mt-6 inline-block bg-slate-100 dark:bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">
              Target Reached
            </div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {goal.target} {(goal.type === 'time' ? 'min' : (goal.type === 'total_words' ? 'word' : 'correct answer')) + (goal.target === 1 ? '' : 's')}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onQuit}
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          End Session
        </button>
        <button
          onClick={onContinue}
          className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transform transition hover:scale-105 active:scale-95"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default GoalMetPanel;
