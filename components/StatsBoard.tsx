import React, { useEffect, useState } from 'react';
import { AppStats, DailyStats, WordItem } from '../types';
import { Flame, Trophy, Zap, CalendarClock, GraduationCap } from 'lucide-react';

interface StatsBoardProps {
  stats: AppStats;
  dailyStats: Record<string, DailyStats>;
  words: WordItem[];
  isLearning: boolean;
}

const StatsBoard: React.FC<StatsBoardProps> = ({ stats, dailyStats, words, isLearning }) => {
  const [wpm, setWpm] = useState(0);

  // Velocity Calculation - Only run when learning
  useEffect(() => {
    if (!isLearning) {
        setWpm(0);
        return;
    }

    const interval = setInterval(() => {
      if (stats.sessionWordsCorrect > 0) {
        const minutes = (Date.now() - stats.sessionStartTime) / 60000;
        setWpm(Math.round(stats.sessionWordsCorrect / Math.max(minutes, 0.1)));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [stats.sessionWordsCorrect, stats.sessionStartTime, isLearning]);

  // Calculate Day Streak
  const calculateDayStreak = () => {
      const today = new Date();
      const toDateStr = (d: Date) => d.toISOString().split('T')[0];
      let current = new Date(today);
      let streak = 0;
      
      // Check if we have activity today
      if (!dailyStats[toDateStr(current)]) {
          // If not, check yesterday. If yesterday has no activity, streak is 0.
          current.setDate(current.getDate() - 1);
          if (!dailyStats[toDateStr(current)]) return 0;
      }
      
      // Count backwards
      while (dailyStats[toDateStr(current)]) {
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
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
      return {
          label: dayLabel,
          data: dailyStats[dateStr] || { tried: 0, success: 0 }
      };
  });

  const maxVal = Math.max(1, ...chartData.map(d => Math.max(d.data.tried, d.data.success)));

  // -- ESTIMATION LOGIC --
  const masteredCount = words.filter(w => w.isMastered).length;
  const remainingCount = words.length - masteredCount;

  // Calculate average daily success over the last 7 days
  const last7DaysSuccessSum = chartData.reduce((acc, curr) => acc + curr.data.success, 0);
  const avgDailySuccess = last7DaysSuccessSum > 0 ? last7DaysSuccessSum / 7 : 0;
  
  const estimatedDays = avgDailySuccess > 0 
    ? Math.ceil(remainingCount / avgDailySuccess) 
    : null;

  // Speed Meter Styles
  const speedIntensity = Math.min(wpm / 15, 1);
  const speedColor = wpm > 10 ? 'text-red-500' : (wpm > 5 ? 'text-orange-400' : 'text-purple-400');
  const speedBg = wpm > 10 ? 'bg-red-500/20' : (wpm > 5 ? 'bg-orange-500/20' : 'bg-purple-500/20');
  const speedAnimation = wpm > 8 ? 'animate-pulse' : '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Main Stats Row */}
        <div className="grid grid-cols-2 gap-4">
            {/* Streak */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-3 shadow-lg transition-colors duration-300">
                <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-lg">
                <Flame className={`w-6 h-6 text-orange-500 ${displayStreak > 5 ? 'animate-bounce' : ''}`} />
                </div>
                <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">{streakLabel}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{displayStreak}</p>
                </div>
            </div>

            {/* Session vs Total Switcher */}
            {isLearning ? (
                // SESSION VIEW
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-3 shadow-lg transition-colors duration-300">
                    <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
                        <Trophy className="w-6 h-6 text-green-600 dark:text-green-500" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Session</p>
                        <div className="flex items-baseline gap-1">
                            <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.sessionWordsCorrect}</p>
                            <span className="text-slate-500 text-sm">/ {stats.sessionWordsTried}</span>
                        </div>
                    </div>
                </div>
            ) : (
                // TOTAL PROGRESS VIEW
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-3 shadow-lg transition-colors duration-300">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                        <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Grasped</p>
                        <div className="flex items-baseline gap-1">
                            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{masteredCount}</p>
                            <span className="text-slate-500 text-sm">/ {words.length}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Speed Meter vs Estimation Switcher */}
            {isLearning ? (
                 // VELOCITY METER
                <div className={`col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between shadow-lg relative overflow-hidden transition-all duration-500 ${wpm > 10 ? 'border-red-500/50 shadow-red-900/20' : ''}`}>
                    <div className="flex items-center gap-3 z-10">
                        <div className={`p-2 rounded-lg transition-colors duration-300 ${speedBg}`}>
                            <Zap className={`w-6 h-6 transition-colors duration-300 ${speedColor} ${speedAnimation}`} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Velocity</p>
                            <p className={`text-2xl font-black italic tracking-tighter transition-all duration-300 ${speedColor}`}>
                                {wpm} <span className="text-sm font-normal not-italic text-slate-500">wpm</span>
                            </p>
                        </div>
                    </div>
                    {wpm > 0 && (
                        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-current to-transparent opacity-10 pointer-events-none" style={{ color: wpm > 10 ? '#ef4444' : '#a855f7' }}></div>
                    )}
                </div>
            ) : (
                // ESTIMATION CARD
                <div className="col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-3 shadow-lg transition-colors duration-300">
                     <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                        <CalendarClock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                     </div>
                     <div className="flex-1">
                         <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Estimated Completion</p>
                         {words.length === 0 ? (
                             <p className="text-sm text-slate-500 mt-1">Add words to see estimate</p>
                         ) : remainingCount === 0 ? (
                             <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">All words mastered!</p>
                         ) : estimatedDays !== null ? (
                             <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                                 ~{estimatedDays} {estimatedDays === 1 ? 'Day' : 'Days'} 
                                 <span className="text-xs font-normal text-slate-500 ml-2">(@ {avgDailySuccess.toFixed(1)} words/day)</span>
                             </p>
                         ) : (
                             <p className="text-sm text-slate-500 mt-1">Keep learning to get an estimate...</p>
                         )}
                     </div>
                </div>
            )}
        </div>

        {/* Daily Chart */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg flex flex-col transition-colors duration-300">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-2">Last 7 Days</p>
            <div className="flex-1 flex items-end justify-between gap-2 h-24">
                {chartData.map((d, i) => {
                    const triedH = (d.data.tried / maxVal) * 100;
                    const successH = (d.data.success / maxVal) * 100;
                    return (
                        <div key={i} className="flex flex-col items-center gap-1 w-full h-full justify-end group">
                             <div className="w-full h-full flex items-end justify-center relative rounded-md overflow-hidden bg-slate-100 dark:bg-slate-700/30 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors">
                                 {/* Tried Bar (Background) */}
                                 {d.data.tried > 0 && (
                                    <div 
                                        style={{ height: `${triedH}%` }} 
                                        className="absolute bottom-0 w-full bg-slate-300 dark:bg-slate-600 rounded-t-sm opacity-50"
                                    ></div>
                                 )}
                                 {/* Success Bar (Foreground) */}
                                 {d.data.success > 0 && (
                                     <div 
                                        style={{ height: `${successH}%` }} 
                                        className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-500 to-indigo-400 dark:from-indigo-600 dark:to-indigo-400 rounded-t-sm shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                     ></div>
                                 )}
                             </div>
                             <span className="text-[10px] text-slate-500 font-mono">{d.label}</span>
                             
                             {/* Tooltip */}
                             <div className="absolute top-0 right-0 bg-white dark:bg-black/80 text-slate-900 dark:text-white text-xs px-2 py-1 rounded hidden group-hover:block z-20 whitespace-nowrap border border-slate-200 dark:border-white/10 shadow-lg">
                                 {d.data.success}/{d.data.tried}
                             </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default StatsBoard;