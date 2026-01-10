import React from "react";
import { LandPlot, ArrowLeft, Timer, Trophy, Share2, Hash } from "lucide-react";
import { useVocabStore, selectTodayChallengeScore } from "../store/vocabStore";

interface DailyChallengeCardProps {
  onFlip: () => void;
  onStart: () => void;
}

const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  onFlip,
  onStart,
}) => {
  const todayScore = useVocabStore(selectTodayChallengeScore);
  const scoreVisual = React.useMemo(() => {
    const clamp = (val: number) => Math.max(0, Math.min(100, val));
    if (todayScore === undefined) {
      return {
        cardBg: "bg-slate-50 dark:bg-slate-900/50",
        border: "border-slate-200 dark:border-slate-700/50",
        icon: "text-indigo-500",
      } as const;
    }

    const score = clamp(todayScore);
    if (score < 30) {
      return {
        cardBg: "bg-slate-50 dark:bg-slate-900/50",
        border: "border-slate-200 dark:border-slate-700/50",
        icon: "text-indigo-500",
      } as const;
    }
    if (score < 60) {
      return {
        cardBg: "bg-indigo-50/70 dark:bg-indigo-900/30",
        border: "border-indigo-200/70 dark:border-indigo-700/60",
        icon: "text-indigo-500",
      } as const;
    }
    if (score < 85) {
      return {
        cardBg: "bg-blue-50/70 dark:bg-emerald-900/30",
        border: "border-emerald-200/70 dark:border-emerald-700/60",
        icon: "text-emerald-500",
      } as const;
    }
    return {
      cardBg: "bg-indigo-50/70 dark:bg-indigo-900/30",
      border: "border-indigo-200/70 dark:border-indigo-700/60",
      icon: "text-indigo-500",
    } as const;
  }, [todayScore]);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-2xl mx-auto mt-10 transition-colors duration-300 relative">
      <button
        type="button"
        onClick={onFlip}
        className="absolute right-3 top-3 p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
        aria-label="Flip to continue"
        title="Flip back to continue learning"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
        <LandPlot className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
        Daily Challenge
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-4">
        10 random words • 5-minute timer • Score saved once per day.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 p-4 flex items-center gap-3">
          <Hash className="w-5 h-5 text-indigo-500 hidden sm:inline" />
          <div>
            <div className="text-xs text-slate-500">Total Words</div>
            <div className="text-lg font-bold">10</div>
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 p-4 flex items-center gap-3">
          <Timer className="w-5 h-5 text-indigo-500 hidden sm:inline" />
          <div>
            <div className="text-xs text-slate-500">Time Limit</div>
            <div className="text-lg font-bold">5 min</div>
          </div>
        </div>
        <div
          className={`rounded-xl border p-4 flex items-center gap-3 transition-all ${scoreVisual.cardBg} ${scoreVisual.border}`}
        >
          <Trophy className={`w-5 h-5 hidden sm:inline ${scoreVisual.icon}`} />
          <div>
            <div className="text-xs text-slate-500">Today’s Score</div>
            <div className={`text-lg font-bold`}>
              {todayScore ?? "--"}
              {todayScore !== undefined && (
                <button
                  type="button"
                  onClick={() => {
                    const text = `I scored ${todayScore} on today's NeonVocab Daily Challenge! 🚀`;
                    navigator.clipboard.writeText(text);
                    alert("Copied to clipboard!");
                  }}
                  className="ml-2 inline-flex items-center gap-2 text-xs text-indigo-500 hover:underline"
                  aria-label="Share score"
                  title="Share score"
                >
                  <Share2 className={`w-3 h-3 ${scoreVisual.icon}`} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 justify-center"
      >
        <LandPlot className="w-4 h-4" />{" "}
        {todayScore !== undefined ? "Retry" : "Start"} Daily Challenge
      </button>
      {todayScore !== undefined && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">
          Today's score won't change.
        </p>
      )}
    </div>
  );
};

export default DailyChallengeCard;
