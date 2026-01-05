import React, { useState, useEffect, useRef } from 'react';
import { WordItem, GameState, DefinitionResponse } from '../types';
import { ArrowRight, Eye, Lightbulb } from 'lucide-react';

interface LearningSessionProps {
  wordItem: WordItem;
  definitionData?: DefinitionResponse;
  onResult: (success: boolean, resetStreak: boolean, resetWordProgress?: boolean) => void;
  onNext: () => void;
}

const LearningSession: React.FC<LearningSessionProps> = ({ wordItem, definitionData, onResult, onNext }) => {
  const [input, setInput] = useState('');
  const [state, setState] = useState<GameState>(GameState.LOADING_DEFINITION);
  const [hintLevel, setHintLevel] = useState(0); // 0: None, 1: Length, 2+: Letters
  const [isShaking, setIsShaking] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize state based on definition availability
  useEffect(() => {
    setInput('');
    setHintLevel(0);
    setMistakes(0);
    setState(definitionData ? GameState.WAITING_FOR_INPUT : GameState.LOADING_DEFINITION);
    if (definitionData) {
       setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [wordItem.id, definitionData]);

  const checkHintLimit = (level: number): boolean => {
      // Logic: If half of word hinted, go to error.
      // hintLevel 2 means 1 char revealed.
      const charsRevealed = level > 1 ? level - 1 : 0;
      const wordLength = wordItem.word.length;
      if (charsRevealed >= wordLength / 2) {
          return true; // Limit exceeded
      }
      return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state !== GameState.WAITING_FOR_INPUT) return;

    const cleanInput = input.trim().toLowerCase();
    const cleanTarget = wordItem.word.trim().toLowerCase();

    if (cleanInput === cleanTarget) {
      setState(GameState.SUCCESS);
      
      // Success Logic:
      // If hint steps < 2 (meaning 0 or 1 - no letters revealed), treat as success.
      // Mistakes (wrong tries) do not invalidate success if hints are low.
      const isSuccess = hintLevel <= 2;
      
      if (isSuccess) {
          // Success! Increment count, don't reset streak.
          onResult(true, false);
      } else {
          // Correct answer but too many hints.
          // Not a success (don't increment), but don't reset streak or word progress either.
          onResult(false, false, false);
      }
    } else {
      triggerError();
    }
  };

  const triggerError = () => {
    setIsShaking(false);
    setTimeout(() => setIsShaking(true), 10);
    setTimeout(() => setIsShaking(false), 510);
    
    // Register mistake
    setMistakes(prev => prev + 1);

    const nextHintLevel = hintLevel + 1;
    
    // Check if next hint level exceeds 50%
    if (checkHintLimit(nextHintLevel)) {
         handleGiveUp();
         return;
    }
    
    setHintLevel(nextHintLevel);
    setTimeout(() => inputRef.current?.focus(), 20);
  };

  const handleGiveUp = () => {
    setState(GameState.SHOWING_ANSWER);
    // Give up: Not success, reset streak, reset word progress.
    onResult(false, true, true); 
  };

  const handleHint = () => {
    const nextHintLevel = hintLevel + 1;
    if (checkHintLimit(nextHintLevel)) {
        // If requesting a hint pushes over the limit, trigger failure
        handleGiveUp();
    } else {
        setHintLevel(nextHintLevel);
        inputRef.current?.focus();
    }
  };

  const getHintText = () => {
    if (hintLevel === 0) return null;
    
    const word = wordItem.word;
    const length = word.length;

    if (hintLevel === 1) {
        // Show length placeholder
        const placeholder = Array(length).fill('_').join(' ');
        return `${placeholder} (${length} letters)`;
    }

    // hintLevel 2 -> 1 letter revealed
    const charsToShow = hintLevel - 1;
    const safeCharsToShow = Math.min(charsToShow, length);
    
    let display = "";
    for (let i = 0; i < length; i++) {
        if (i < safeCharsToShow || word[i] === ' ' || word[i] === '-') {
            display += word[i] + " ";
        } else {
            display += "_ ";
        }
    }
    return display.trim();
  };

  if (state === GameState.LOADING_DEFINITION) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl animate-pulse border border-slate-200 dark:border-slate-700">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
        <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded w-full mb-6"></div>
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
      </div>
    );
  }

  // Determine card style based on state
  let cardStyle = "bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border transition-all duration-300 relative overflow-hidden ";
  if (state === GameState.SUCCESS) {
      cardStyle += "border-green-500 shadow-[0_0_60px_rgba(34,197,94,0.4)]";
  } else if (state === GameState.SHOWING_ANSWER) {
      cardStyle += "border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]";
  } else {
      cardStyle += "border-slate-200 dark:border-slate-700";
  }

  if (isShaking) {
      cardStyle += " animate-shake border-red-500";
  }

  return (
    <div className="w-full max-w-2xl mx-auto relative px-4">
      <div className={cardStyle}>
        
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className={`h-2 w-12 rounded-full transition-colors duration-500 ${i < wordItem.successCount ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-slate-200 dark:bg-slate-700'}`} 
            />
          ))}
        </div>

        {/* Question Area */}
        <div className="mb-8 text-center">
            <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                {definitionData?.partOfSpeech}
            </span>
            <h2 className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-slate-100 leading-relaxed mb-6">
                {definitionData?.definition}
            </h2>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border-l-4 border-indigo-500 text-left">
                <p className="text-slate-600 dark:text-slate-400 italic text-lg">
                    "{definitionData?.exampleSentence}"
                </p>
            </div>
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={state === GameState.SUCCESS || state === GameState.SHOWING_ANSWER}
            placeholder="Type the word..."
            className={`w-full bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl p-5 text-center text-2xl font-bold tracking-wide outline-none transition-all
                ${state === GameState.SUCCESS ? 'border-green-500 text-green-600 dark:text-green-400 bg-green-500/10' : ''}
                ${state === GameState.SHOWING_ANSWER ? 'border-yellow-500 text-yellow-600 dark:text-yellow-500' : ''}
                ${state === GameState.WAITING_FOR_INPUT && !isShaking ? 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:shadow-[0_0_20px_rgba(99,102,241,0.3)]' : ''}
                ${isShaking ? 'border-red-500 text-red-500 dark:text-red-400' : ''}
            `}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          
          {state === GameState.WAITING_FOR_INPUT && input.length > 0 && (
             <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors text-white">
                 <ArrowRight className="w-5 h-5" />
             </button>
          )}
        </form>

        {/* Hint Display */}
        {hintLevel > 0 && state === GameState.WAITING_FOR_INPUT && (
            <div className="mt-4 text-center animate-pop">
                 <p className="text-indigo-600 dark:text-indigo-300 font-mono text-lg tracking-widest">{getHintText()}</p>
                 <p className="text-xs text-slate-500 mt-1">
                    {mistakes > 0 ? 'Be careful, mistakes reset progress!' : 'Hint active'}
                 </p>
            </div>
        )}

        {/* Answer Reveal (Only on Give Up or Success) */}
        {(state === GameState.SHOWING_ANSWER) && (
            <div className="mt-6 text-center animate-pop">
                <p className="text-slate-500 dark:text-slate-400 mb-2">The correct word was:</p>
                <h3 className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-4 tracking-wider">{wordItem.word}</h3>
            </div>
        )}
        
        {state === GameState.SUCCESS && (
            <div className="mt-6 text-center animate-pop">
                <p className="text-green-600 dark:text-green-400 font-bold text-xl">Correct!</p>
                {mistakes > 0 && <p className="text-xs text-red-500 dark:text-red-400 mt-2">Mistakes made: Progress reset.</p>}
            </div>
        )}

        {/* Controls */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
            {state === GameState.WAITING_FOR_INPUT && (
                <>
                    <button 
                        type="button"
                        onClick={handleGiveUp}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors font-medium text-sm"
                    >
                        <Eye className="w-4 h-4" /> I don't know
                    </button>
                    <button 
                        type="button"
                        onClick={handleHint}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-indigo-300 transition-colors font-medium text-sm"
                    >
                        <Lightbulb className="w-4 h-4" /> {hintLevel === 0 ? 'Get Hint' : 'More Hint'}
                    </button>
                </>
            )}

            {(state === GameState.SUCCESS || state === GameState.SHOWING_ANSWER) && (
                <button 
                    onClick={onNext}
                    autoFocus
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold shadow-lg transform transition hover:scale-105 active:scale-95"
                >
                    {state === GameState.SUCCESS ? 'Next Word' : 'Continue'} <ArrowRight className="w-5 h-5" />
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default LearningSession;