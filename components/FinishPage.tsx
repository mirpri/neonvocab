import React from "react";
import { PartyPopper } from "lucide-react";

interface FinishPageProps {
  wordsCount: number;
  daysActiveCount: number;
  totalMasteredCount: number;
  onBack: () => void;
}

const FinishPage: React.FC<FinishPageProps> = ({
  wordsCount,
  daysActiveCount,
  totalMasteredCount,
  onBack,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-green-500/50 dark:border-green-500 text-center animate-pop transition-colors duration-300">
      <div className="mb-6">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <PartyPopper className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          All Words Mastered!
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          You&apos;ve successfully learned all {wordsCount} words in your list.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-transparent">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {daysActiveCount}
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">
            Days Active
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-transparent">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {totalMasteredCount}
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">
            Total Mastered
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={() => {
            const text = `I just mastered ${wordsCount} words with NeonVocab! 🚀`;
            navigator.clipboard.writeText(text);
            alert("Copied to clipboard!");
          }}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20"
          type="button"
        >
          Share Achievement
        </button>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl font-bold transition-colors"
          type="button"
        >
          Back to List
        </button>
      </div>
    </div>
  );
};

export default FinishPage;
