import React, { useState } from 'react';
import { Plus, Save, RefreshCcw, Check } from 'lucide-react';
import highschoolPreset from '../wordlists/Highschool.txt?raw';
import toeflPreset from '../wordlists/TOEFL.txt?raw';
import cetPreset from '../wordlists/CET.txt?raw';

interface ImporterProps {
  onImport: (text: string) => void;
  hasWords: boolean;
  onFlip?: () => void;
}

const Importer: React.FC<ImporterProps> = ({ onImport, hasWords, onFlip }) => {
  const [text, setText] = useState('');
  const [loadedPreset, setLoadedPreset] = useState<string | null>(null);

  const handleImport = () => {
    if (text.trim()) {
      onImport(text);
      setText('');
      setLoadedPreset(null);
    }
  };

  const loadPreset = (name: string, content: string) => {
    setText(content);
    setLoadedPreset(name);
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
          onClick={() => loadPreset('highschool', highschoolPreset)}
          disabled={loadedPreset === 'highschool'}
          className={`px-3 py-1.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-1.5 ${
            loadedPreset === 'highschool'
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white"
          }`}
        >
          {loadedPreset === 'highschool' && <Check className="w-3.5 h-3.5" />}
          Import Highschool
        </button>
        <button
          type="button"
          onClick={() => loadPreset('cet', cetPreset)}
          disabled={loadedPreset === 'cet'}
          className={`px-3 py-1.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-1.5 ${
            loadedPreset === 'cet'
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white"
          }`}
        >
          {loadedPreset === 'cet' && <Check className="w-3.5 h-3.5" />}
          Import CET-6
        </button>
        <button
          type="button"
          onClick={() => loadPreset('toefl', toeflPreset)}
          disabled={loadedPreset === 'toefl'}
          className={`px-3 py-1.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-1.5 ${
            loadedPreset === 'toefl'
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white"
          }`}
        >
          {loadedPreset === 'toefl' && <Check className="w-3.5 h-3.5" />}
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
      </div>
    </div>
  );
};

export default Importer;