
export const config = {
  // Optional: Custom Backend URL (overrides provider choice if set)
  apiBaseUrl: process.env.VITE_API_BASE_URL || 'https://nvapis.puppygoapp.com',

  // Provider choice: 'gemini' | 'openai' | 'proxy'
  provider: (process.env.AI_PROVIDER as 'gemini' | 'openai' | 'proxy') || 'proxy',

  // Gemini Configuration
  gemini: {
    // API Key is loaded from environment variable in standard setup, 
    // but can be overridden here if needed (not recommended for public repos)
    apiKey: process.env.GEMINI_API_KEY || '',
    model: 'gemini-3-flash-preview'
  },

  // OpenAI / Compatible Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
  }
};
