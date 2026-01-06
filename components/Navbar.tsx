import React from "react";
import {
  Github,
  Moon,
  Sun,
  Database,
  Image as ImageIcon,
  Shuffle,
} from "lucide-react";

interface NavBarProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  backgroundEnabled: boolean;
  backgroundUrl: string;
  onToggleBackground: () => void;
  onChangeBackgroundUrl: (nextUrl: string) => void;
  onResetData: () => void;
  hasWords: boolean;
}

const NavBar: React.FC<NavBarProps> = ({
  theme,
  onToggleTheme,
  backgroundEnabled,
  backgroundUrl,
  onToggleBackground,
  onChangeBackgroundUrl,
  onResetData,
  hasWords,
}) => {
  return (
    <header className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-600 dark:from-white dark:to-indigo-400">
            NeonVocab
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <div className="relative group">
            <button
              onClick={onToggleBackground}
              className={`p-2 rounded-lg border transition-colors bg-slate-100 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10`}
              aria-label="Toggle background image"
              title="Background image"
              type="button"
            >
              <ImageIcon className={`w-4 h-4 ${backgroundEnabled ? "text-indigo-500 dark:text-indigo-500" : ""}`} />
            </button>

            {backgroundEnabled && (
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity absolute right-0 top-full mt-0.5 w-[18rem]">
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg p-2">
                  <div className="flex items-stretch gap-2">
                    <input
                      value={backgroundUrl}
                      onChange={(e) => onChangeBackgroundUrl(e.target.value)}
                      placeholder="Image URL (optional)"
                      className="flex-1 min-w-0 text-sm px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label="Background image URL"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        onChangeBackgroundUrl(
                          `https://bing.img.run/rand.php?ts=${Date.now()}`
                        );
                      }}
                      className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                      aria-label="Use random Bing wallpaper"
                      title="Random"
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() =>
              window.open("https://github.com/mirpri/neonvocab", "_blank")
            }
            className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            aria-label="Open GitHub"
          >
            <Github className="w-4 h-4" />
          </button>

          <button
            onClick={onResetData}
            className="text-xs text-slate-500 dark:text-white/50 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
            type="button"
          >
            <Database className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
