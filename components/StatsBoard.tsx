import React, { useEffect, useRef, useState } from "react";
import { AppStats, DailyStats, WordItem, SessionGoal } from "../types";
import {
  Flame,
  Trophy,
  Zap,
  CalendarClock,
  GraduationCap,
  Target,
} from "lucide-react";
import { toDateString } from "@/utils/date";

interface StatsBoardProps {
  stats: AppStats;
  dailyStats: Record<string, DailyStats>;
  words: WordItem[];
  isLearning: boolean;
  goal?: SessionGoal | null;
  isDailyChallenge?: boolean;
  dailyChallengeScores?: Record<string, number>;
}

const StatsBoard: React.FC<StatsBoardProps> = ({
  stats,
  dailyStats,
  words,
  isLearning,
  goal,
  isDailyChallenge = false,
  dailyChallengeScores = {},
}) => {
  const [wpm, setWpm] = useState(0);
  const samplesRef = useRef<Array<{ t: number; correct: number }>>([]);
  const correctRef = useRef(stats.sessionWordsCorrect);

  useEffect(() => {
    correctRef.current = stats.sessionWordsCorrect;
  }, [stats.sessionWordsCorrect]);

  const [elapsedMin, setElapsedMin] = useState(0);

  useEffect(() => {
    if (!isLearning || !goal || goal.type !== "time") {
      setElapsedMin(0);
      return;
    }

    const updateTime = () => {
      const ms = Date.now() - stats.sessionStartTime;
      setElapsedMin(Math.floor(ms / 60000));
    };

    updateTime(); // initial
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isLearning, goal, stats.sessionStartTime]);

  // Velocity Calculation - Only run when learning
  useEffect(() => {
    if (!isLearning) {
      setWpm(0);
      samplesRef.current = [];
      return;
    }

    samplesRef.current = [];

    const interval = setInterval(() => {
      const now = Date.now();
      const correct = correctRef.current ?? 0;

      const samples = samplesRef.current;
      samples.push({ t: now, correct });

      const cutoff = now - 60_000;
      while (samples.length > 0 && samples[0].t < cutoff) {
        samples.shift();
      }

      if (samples.length < 2) {
        setWpm(0);
        return;
      }

      const oldest = samples[0];
      const windowMinutes = (now - oldest.t) / 60000;
      const deltaCorrect = Math.max(0, correct - oldest.correct);
      setWpm(Math.round(deltaCorrect / Math.max(windowMinutes, 0.1)));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLearning]);

  // Calculate Day Streak
  const calculateDayStreak = () => {
    let current = new Date();
    let streak = 0;

    // Check if we have activity today
    if (!dailyStats[toDateString(current)]) {
      // If not, check yesterday. If yesterday has no activity, streak is 0.
      current.setDate(current.getDate() - 1);
      if (!dailyStats[toDateString(current)]) return 0;
    }

    // Count backwards
    while (dailyStats[toDateString(current)]) {
      streak++;
      current.setDate(current.getDate() - 1);
    }
    return streak;
  };

  const dayStreak = calculateDayStreak();
  const displayStreak = isLearning ? stats.streak : dayStreak;
  const streakLabel = isLearning ? "Combo" : "Day Streak";

  // Generate chart data for last 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = toDateString(d);
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "narrow" });
    if (isDailyChallenge) {
      const pts = dailyChallengeScores[dateStr] ?? 0;
      return {
        label: dayLabel,
        data: { points: pts },
      } as const;
    }
    return {
      label: dayLabel,
      data: dailyStats[dateStr] || { tried: 0, success: 0 },
    } as const;
  });

  const maxVal = isDailyChallenge
    ? Math.max(1, ...chartData.map((d: any) => d.data.points ?? 0))
    : Math.max(
        1,
        ...chartData.map((d: any) => Math.max(d.data.tried, d.data.success))
      );

  const currentGoalValue = (() => {
    if (!goal) return 0;
    if (goal.type === "time") return elapsedMin;
    if (goal.type === "total_words") return stats.sessionWordsTried;
    if (goal.type === "correct_words") return stats.sessionWordsCorrect;
    return 0;
  })();

  const isGoalMet = goal ? currentGoalValue >= goal.target : false;
  const masteredCount = words.filter((w) => w.isMastered).length;
  const remainingCount = words.length - masteredCount;

  // Calculate average daily success over ALL recorded days
  const allDays: DailyStats[] = Object.values(
    dailyStats as Record<string, DailyStats>
  );
  const activeDaysCount = allDays.filter((d) => (d.tried ?? 0) > 0).length;
  const allTimeSuccessSum = allDays.reduce(
    (acc, curr) => acc + (curr.success ?? 0),
    0
  );
  const avgDailySuccess =
    activeDaysCount > 0 ? allTimeSuccessSum / activeDaysCount / 3 : 0;

  const estimatedDays =
    avgDailySuccess > 0 ? Math.ceil(remainingCount / avgDailySuccess) : null;

  // Speed Meter Styles
  const speedColor =
    wpm > 10 ? "text-red-500" : wpm > 5 ? "text-orange-400" : "text-purple-400";
  const speedBg =
    wpm > 10
      ? "bg-red-100 dark:bg-red-500/20"
      : wpm > 5
      ? "bg-orange-100 dark:bg-orange-500/20"
      : "bg-purple-100 dark:bg-purple-500/20";
  const speedAnimation = wpm > 8 ? "animate-pulse" : "";

  const streakCard = (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-3 shadow-lg transition-colors duration-300">
      <div className="hidden sm:flex shrink-0 p-2 bg-orange-100 dark:bg-orange-500/20 rounded-lg">
        <Flame
          className={`w-6 h-6 text-orange-500 ${
            displayStreak > 5 ? "animate-bounce" : ""
          }`}
        />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
          {streakLabel}
        </p>
        <p className="text-xl font-bold text-orange-500 dark:text-orange-400">
          {displayStreak}
        </p>
      </div>
    </div>
  );

  const wordsLeft = Math.max(0, 10 - (stats.sessionWordsTried ?? 0));
  const sessionCard = isDailyChallenge ? (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-3 shadow-lg transition-colors duration-300">
      <div className="hidden sm:flex shrink-0 p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
        <Trophy className="w-6 h-6 text-green-600 dark:text-green-500" />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
          Score
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {stats.sessionPoints ?? 0}
          </p>
          <span className="text-slate-500 text-sm">({wordsLeft} left)</span>
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-3 shadow-lg transition-colors duration-300">
      <div className="hidden sm:flex shrink-0 p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
        <Trophy className="w-6 h-6 text-green-600 dark:text-green-500" />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
          Session
        </p>
        <div className="flex items-baseline gap-1">
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {stats.sessionWordsCorrect}
          </p>
          <span className="text-slate-500 text-sm">
            / {stats.sessionWordsTried}
          </span>
        </div>
      </div>
    </div>
  );

  const velocityCard = (
    <div
      className={`bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between shadow-lg relative overflow-hidden transition-all duration-500 ${
        wpm > 10 ? "border-red-500/50 shadow-red-900/20" : ""
      }`}
    >
      <div className="flex items-center gap-3 z-10">
        <div
          className={`hidden sm:flex shrink-0 p-2 rounded-lg transition-colors duration-300 ${speedBg}`}
        >
          <Zap
            className={`w-6 h-6 transition-colors duration-300 ${speedColor} ${speedAnimation}`}
          />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
            Speed
          </p>
          <p
            className={`text-xl ${
              wpm > 8 ? "font-black italic" : "font-bold"
            } tracking-tighter transition-all duration-300 ${speedColor}`}
          >
            {wpm}{" "}
            <span className="text-sm font-normal not-italic text-slate-500">
              wpm
            </span>
          </p>
        </div>
      </div>
      {wpm > 0 && (
        <div
          className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-current to-transparent opacity-10 pointer-events-none"
          style={{ color: wpm > 10 ? "#ef4444" : "#a855f7" }}
        ></div>
      )}
    </div>
  );

  const goalCard = goal ? (
    <div
      className={`col-span-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border flex items-center justify-between shadow-lg relative overflow-hidden transition-all duration-300 ${
        isGoalMet
          ? "border-green-500/50 shadow-green-900/10"
          : "border-slate-200 dark:border-white/10"
      }`}
    >
      {/* Progress Background */}
      <div
        className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out z-0 ${
          isGoalMet
            ? "bg-green-500/10 dark:bg-green-500/20"
            : "bg-indigo-500/20 dark:bg-indigo-500/30"
        }`}
        style={{
          width: `${Math.min(100, (currentGoalValue / goal.target) * 100)}%`,
        }}
      ></div>

      <div className={`flex items-center gap-3 z-10 w-full`}>
        <div
          className={`hidden sm:flex shrink-0 p-2 rounded-lg transition-colors duration-300 ${
            isGoalMet
              ? "bg-green-100 dark:bg-green-500/20"
              : "bg-indigo-100 dark:bg-indigo-500/20"
          }`}
        >
          <Target
            className={`w-6 h-6 ${
              isGoalMet
                ? "text-green-600 dark:text-green-400"
                : "text-indigo-600 dark:text-indigo-400"
            }`}
          />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
            {goal.type === "time"
              ? "Time"
              : goal.type === "total_words"
              ? "Words"
              : "Correct"}
          </p>
          <div className="flex items-baseline gap-1">
            <p
              className={`text-xl font-bold ${
                isGoalMet
                  ? "text-green-600 dark:text-green-400"
                  : "text-indigo-600 dark:text-indigo-400"
              }`}
            >
              {currentGoalValue}
            </p>
            <span className="text-slate-500 text-sm">
              / {goal.target} {goal.type === "time" ? "min" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  if (isLearning) {
    return (
      <div
        className={`flex grid ${
          goal ? "grid-cols-4" : "grid-cols-3"
        } gap-2 sm:gap-4 mb-6`}
      >
        {streakCard}
        {sessionCard}
        {velocityCard}
        {goalCard}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Main Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Streak */}
        {streakCard}

        {/* Session vs Total Switcher */}
        {
          // TOTAL PROGRESS VIEW
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-3 shadow-lg transition-colors duration-300">
            <div className="hidden sm:flex shrink-0 p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
              <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                Grasped
              </p>
              <div className="flex items-baseline gap-1">
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {masteredCount}
                </p>
                <span className="text-slate-500 text-sm">/ {words.length}</span>
              </div>
            </div>
          </div>
        }

        {/* Speed Meter vs Estimation Switcher */}
        {
          // ESTIMATION CARD
          <div className="col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-3 shadow-lg transition-colors duration-300">
            <div className="hidden sm:flex shrink-0 p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
              <CalendarClock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                Estimated Completion
              </p>
              {words.length === 0 ? (
                <p className="text-sm text-slate-500 mt-1">
                  Add words to see estimate
                </p>
              ) : remainingCount === 0 ? (
                <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
                  All words mastered!
                </p>
              ) : estimatedDays !== null ? (
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  ~{estimatedDays} {estimatedDays === 1 ? "Day" : "Days"}
                  <span className="text-xs font-normal text-slate-500 ml-2">
                    (@ {avgDailySuccess.toFixed(1)} words/day)
                  </span>
                </p>
              ) : (
                <p className="text-sm text-slate-500 mt-1">
                  Keep learning to get an estimate...
                </p>
              )}
            </div>
          </div>
        }
      </div>

      {/* Daily Chart */}
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg flex flex-col transition-colors duration-300">
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-2">
          Last 7 Days
        </p>
        <div className="flex-1 h-24 min-h-[96px] overflow-x-auto">
          <div className="flex h-full items-end justify-between gap-2 h-24">
            {chartData.map((d: any, i) => {
              if (isDailyChallenge) {
                const h = d.data.points;
                return (
                  <div
                    key={i}
                    className="relative flex flex-col items-center gap-1 flex-1 min-w-[32px] h-full justify-end group"
                  >
                    <div className="w-full h-full flex items-end justify-center relative rounded-md overflow-hidden bg-slate-200/30 dark:bg-slate-600/30 hover:bg-slate-200 dark:hover:bg-slate-500/50 transition-colors">
                      {d.data.points > 0 && (
                        <div
                          style={{ height: `${h}%` }}
                          className="absolute bottom-0 w-full bg-gradient-to-t from-yellow-600/90 to-amber-400/80 dark:from-yellow-500/90 dark:to-amber-300/80 rounded-t-sm shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                        ></div>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {d.label}
                    </span>
                    <div className="absolute top-1 right-1 text-slate-900/60 dark:text-white/60 text-[10px] hidden group-hover:block z-20 whitespace-nowrap">
                      {d.data.points ?? "--"}
                    </div>
                  </div>
                );
              }
              const triedH = (d.data.tried / maxVal) * 100;
              const successH = (d.data.success / maxVal) * 100;
              return (
                <div
                  key={i}
                  className="relative flex flex-col items-center gap-1 flex-1 min-w-[32px] h-full justify-end group"
                >
                  <div className="w-full h-full flex items-end justify-center relative rounded-md overflow-hidden bg-slate-200/30 dark:bg-slate-600/30 hover:bg-slate-200 dark:hover:bg-slate-500/50 transition-colors">
                    {d.data.tried > 0 && (
                      <div
                        style={{ height: `${triedH}%` }}
                        className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-700/70 to-indigo-600/70 dark:from-indigo-600/70 dark:to-indigo-400/70 rounded-t-sm opacity-50"
                      ></div>
                    )}
                    {d.data.success > 0 && (
                      <div
                        style={{ height: `${successH}%` }}
                        className="absolute bottom-0 w-full bg-gradient-to-t from-green-500/80 to-green-400/80 dark:from-green-600/80 dark:to-green-400/80 rounded-t-sm shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      ></div>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {d.label}
                  </span>
                  <div className="absolute top-1 right-1 text-slate-900/60 dark:text-white/60 text-[10px] hidden group-hover:block z-20 whitespace-nowrap">
                    {d.data.success}/{d.data.tried}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsBoard;
