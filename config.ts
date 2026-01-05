
export const config = {
  // Provider choice: 'gemini' | 'openai'
  provider: (process.env.AI_PROVIDER as 'gemini' | 'openai') || 'gemini',

  // Gemini Configuration
  gemini: {
    // API Key is loaded from environment variable in standard setup, 
    // but can be overridden here if needed (not recommended for public repos)
    apiKey: process.env.GEMINI_API_KEY || '',
    model: 'gemini-3-flash-preview'
  },

  // OpenAI / Compatible Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_KEY', // Replace with your key
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1', // Change for compatible endpoints (e.g. LocalAI, Groq)
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
  }
};
