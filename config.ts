const getStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

export const config = {
  // Optional: Custom Backend URL (overrides provider choice if set)
  apiBaseUrl: getStorage('vocab-api-base-url') || process.env.VITE_API_BASE_URL || 'https://nvapis.puppygoapp.com',

  // Provider choice: 'gemini' | 'openai' | 'proxy'
  provider: (getStorage('vocab-ai-provider') as 'gemini' | 'openai' | 'proxy') || (process.env.AI_PROVIDER as 'gemini' | 'openai' | 'proxy') || 'proxy',

  // Gemini Configuration
  gemini: {
    // API Key is loaded from environment variable in standard setup, 
    // but can be overridden here if needed (not recommended for public repos)
    apiKey: getStorage('vocab-gemini-key') || process.env.GEMINI_API_KEY || '',
    model: getStorage('vocab-gemini-model') || 'gemini-1.5-flash'
  },

  // OpenAI / Compatible Configuration
  openai: {
    apiKey: getStorage('vocab-openai-key') || process.env.OPENAI_API_KEY || '',
    baseUrl: getStorage('vocab-openai-base-url') || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: getStorage('vocab-openai-model') || process.env.OPENAI_MODEL || 'gpt-4o-mini'
  }
};
