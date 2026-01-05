import React, { useState } from 'react';
import { Plus, Save } from 'lucide-react';

interface ImporterProps {
  onImport: (text: string) => void;
  onStart: () => void;
  hasWords: boolean;
}

const Importer: React.FC<ImporterProps> = ({ onImport, onStart, hasWords }) => {
  const [text, setText] = useState('');

  const handleImport = () => {
    if (text.trim()) {
      onImport(text);
      setText('');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-2xl mx-auto mt-10 transition-colors duration-300">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Plus className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
        Add Words to Learn
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-4">
        Paste a list of words separated by commas, newlines, or spaces. We'll handle the rest.
      </p>
      
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
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25"
          >
            Start Learning
          </button>
        )}
      </div>
    </div>
  );
};

export default Importer;