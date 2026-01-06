import React, { useState } from 'react';
import { Plus, Save, RefreshCcw } from 'lucide-react';
import highschoolPreset from '../wordlists/Highschool.txt?raw';
import toeflPreset from '../wordlists/TOEFL.txt?raw';
import cetPreset from '../wordlists/CET.txt?raw';

interface ImporterProps {
  onImport: (text: string) => void;
  onStart: () => void;
  hasWords: boolean;
  onFlip?: () => void;
}

const Importer: React.FC<ImporterProps> = ({ onImport, onStart, hasWords, onFlip }) => {
  const [text, setText] = useState('');

  const handleImport = () => {
    if (text.trim()) {
      onImport(text);
      setText('');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-2xl mx-auto mt-10 transition-colors duration-300 relative">
      {hasWords && onFlip && (
        <button
          type="button"
          onClick={onFlip}
          className="absolute right-3 top-3 p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          aria-label="Flip back"
          title="Flip back to continue learning"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      )}
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Plus className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
        Add Words to Learn
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-4">
        Paste a list of words separated by commas, newlines, or spaces. We'll handle the rest.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => onImport(highschoolPreset)}
          className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-semibold text-sm transition-colors"
        >
          Import Highschool
        </button>
        <button
          type="button"
          onClick={() => onImport(cetPreset)}
          className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-semibold text-sm transition-colors"
        >
          Import CET-6
        </button>
        <button
          type="button"
          onClick={() => onImport(toeflPreset)}
          className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-semibold text-sm transition-colors"
        >
          Import TOEFL
        </button>
      </div>
      
      <textarea
        className="w-full h-40 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none font-mono text-sm mb-4"
        placeholder="e.g. ephemeral, serendipity, obsequious"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex gap-4">
        <button
          onClick={handleImport}
          disabled={!text.trim()}
          className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Add to List
        </button>
        
        {hasWords && (
          <button
            onClick={onStart}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            Start Learning
          </button>
        )}
      </div>
    </div>
  );
};

export default Importer;