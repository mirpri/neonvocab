import React from 'react';
import { Github, Moon, Sun, Database, University } from 'lucide-react';

interface NavBarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onResetData: () => void;
  hasWords: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ theme, onToggleTheme, onResetData, hasWords }) => {
  return (
    <header className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <University className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-600 dark:from-white dark:to-indigo-200">
            NeonVocab
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => window.open('https://github.com/mirpri/neonvocab', '_blank')}
            className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            aria-label="Open GitHub"
          >
            <Github className="w-4 h-4" />
          </button>

          {hasWords && (
            <button
              onClick={onResetData}
              className="text-xs text-slate-500 dark:text-white/50 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <Database className="w-3 h-3" /> Reset Data
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
