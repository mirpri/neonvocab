# NeonVocab

A modern, AI-powered vocabulary learning application built with React 19, TypeScript, and Google Gemini. Master new words with an elegant, distraction-free interface featuring dynamic theming and smart progress tracking. Not just a web app—now a blazing fast desktop application powered by **Tauri**.

Experience web version: https://mirpri.github.io/neonvocab

![Screenshot](res/screenshot1.png)

Built with the help of
![Google Ai Studio](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## ✨ Features

- **🧠 AI-Powered Definitions**: Automatically fetches definitions, parts of speech, and example sentences using Google's Gemini API.
- **🖥️ Desktop Native Experience**:
  - **Tauri Integration**: Lightweight, secure, and fast desktop application.
  - **Custom Settings**: Configure your AI provider (Gemini/OpenAI/Proxy) and API keys directly in the app.
  - **Immersive Mode**: Press **F11** to toggle fullscreen for a distraction-free learning session.
  - **Secure**: Right-click context menus and developer tools are disabled for a focused, app-like feel.
- **📚 Smart Learning System**: 
  - Spaced repetition-inspired mastery tracking.
  - Words are marked as "Mastered" after 3 successful attempts.
  - "Stuck" prevention logic ensures you learn effectively.
- **🎨 Dynamic Theming**: 
  - Beautiful Light and Dark modes.
  - Animated, soothing gradient backgrounds.
  - Custom scrollbar styling and optimized UI.
- **⚡ Interactive Gameplay**:
  - Spelling challenges with immediate feedback.
  - Progressive Hint System.
  - Shake animations and confetti celebrations.
- **📊 Stats & Progress**:
  - Track daily streaks and learning velocity.
  - Visualize mastery progress.
- **💾 Local Persistence**: All data and settings are saved locally on your device.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Desktop Engine**: [Tauri v2](https://tauri.app/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI Integration**: [Google GenAI SDK](https://www.npmjs.com/package/@google/genai)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Rust (for Tauri development)
- A Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mirpri/neonvocab.git
   cd neonvocab
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run Desktop App (Tauri)**
   ```bash
   npm run tauri dev
   # or
   yarn tauri dev
   ```

4. **Run Web App Only**
   ```bash
   npm run dev
   ```

### Configuration
You can configure your AI provider directly within the app:
1. Click the **Settings** (gear icon) in the navigation bar.
2. Choose your provider: **Proxy**, **Gemini**, or **OpenAI**.
3. Enter your API Key/Base URL if required.
4. Save to persist settings locally.

## Keyboard Shortcuts
- **F11**: Toggle Fullscreen
- **Escape**: End Learning Session
- **Enter**: Submit Answer / Next Word

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
