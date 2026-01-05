# VocabMaster AI

A modern, AI-powered vocabulary learning application built with React 19, TypeScript, and Google Gemini. Master new words with an elegant, distraction-free interface featuring dynamic theming and smart progress tracking.

![VocabMaster AI Preview](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## ✨ Features

- **🧠 AI-Powered Definitions**: Automatically fetches definitions, parts of speech, and example sentences using Google's Gemini API.
- **📚 Smart Learning System**: 
  - Spaced repetition-inspired mastery tracking.
  - Words are marked as "Mastered" after 3 successful attempts.
  - "Stuck" prevention logic ensures you learn effectively.
- **🎨 Dynamic Theming**: 
  - Beautiful Light and Dark modes.
  - Animated, soothing gradient backgrounds (Paper White for Light, Deep Midnight for Dark).
  - Smooth transitions and glassmorphism effects.
- **⚡ Interactive Gameplay**:
  - Spelling challenges with immediate feedback.
  - Progressive Hint System (Length → Reveal Letters).
  - Shake animations for errors, confetti/pop effects for success.
- **📊 Stats & Progress**:
  - Track your daily streak.
  - Monitor learning velocity (words/minute).
  - Visualize total words mastered and days active.
- **💾 Local Persistence**: All your words, progress, and settings are saved automatically to your browser.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI Integration**: [Google GenAI SDK](https://www.npmjs.com/package/@google/genai)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key (Get one [here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vocabmaster-ai.git
   cd vocabmaster-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory according to `.env copy`

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to start learning!

## 📖 Usage

1. **Add Words**: Click the "Import" section to paste a list of words you want to learn.
2. **Start Session**: Click "Start Learning" to begin.
3. **Learn**: 
   - Read the definition and example sentence.
   - Type the word.
   - Use hints if you get stuck (Eye icon for "I don't know", Bulb icon for hints).
4. **Mastery**: Correctly answer a word 3 times to master it.
5. **Theme**: Toggle between Light and Dark mode using the sun/moon icon in the header.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).


