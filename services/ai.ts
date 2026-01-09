import { GoogleGenAI, Type } from "@google/genai";
import { DefinitionResponse } from "../types";
import { config } from "../config";

const definitionMemoryCache = new Map<string, DefinitionResponse>();
const definitionInFlight = new Map<string, Promise<DefinitionResponse>>();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const withRetries = async <T>(
  fn: () => Promise<T>,
  { attempts = 3, baseDelayMs = 200 }: { attempts?: number; baseDelayMs?: number } = {}
): Promise<T> => {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      const jitter = Math.random() * 100;
      await sleep(baseDelayMs * attempt + jitter);
    }
  }
  throw lastError;
};

// --- GEMINI IMPLEMENTATION ---
const fetchGeminiDefinition = async (
  word: string
): Promise<DefinitionResponse> => {
  const ai = new GoogleGenAI({
    apiKey: config.gemini.apiKey,
  });

  try {
    const prompt = `Provide a dictionary definition for the word "${word}". 
        The definition should be clear and concise, suitable for a vocabulary learner. 
        Also provide the part of speech and a short example sentence using the word (but replace the target word with '_____' in the sentence).`;

    const response = await ai.models.generateContent({
      model: config.gemini.model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            definition: { type: Type.STRING },
            partOfSpeech: { type: Type.STRING },
            exampleSentence: { type: Type.STRING },
          },
          required: ["definition", "partOfSpeech", "exampleSentence"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as DefinitionResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

// --- OPENAI / COMPATIBLE IMPLEMENTATION ---
const fetchOpenAIDefinition = async (
  word: string
): Promise<DefinitionResponse> => {
  try {
    const prompt = `Provide a JSON object with a dictionary definition for the word "${word}". 
        Fields: "definition" (concise), "partOfSpeech", "exampleSentence" (replace word with '_____').`;

    const response = await fetch(`${config.openai.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: config.openai.model,
        messages: [
          {
            role: "system",
            content: "You are a helpful dictionary assistant. Output JSON.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error("No content in OpenAI response");

    // Sanitize content to remove markdown code blocks if present
    const cleanedContent = content
      .replace(/^```json\s*/, "")
      .replace(/^```\s*/, "")
      .replace(/\s*```$/, "");

    return JSON.parse(cleanedContent) as DefinitionResponse;
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw error;
  }
};

// --- PROXY / CUSTOM BACKEND IMPLEMENTATION ---
const fetchProxyDefinition = async (
  word: string
): Promise<DefinitionResponse> => {
  try {
    // Expects a backend that accepts { word: string } and returns DefinitionResponse
    const response = await fetch(
      `${config.apiBaseUrl}/definition?word=${encodeURIComponent(word)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Backend API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as DefinitionResponse;
  } catch (error) {
    console.error("Proxy API Error:", error);
    throw error;
  }
};

// --- MAIN EXPORT ---
export const fetchWordDefinition = async (
  word: string
): Promise<DefinitionResponse> => {
  const rawWord = word.trim();
  const cacheKey = rawWord.toLowerCase();

  const cached = definitionMemoryCache.get(cacheKey);
  if (cached) return cached;

  const inFlight = definitionInFlight.get(cacheKey);
  if (inFlight) return inFlight;

  const requestPromise = (async (): Promise<DefinitionResponse> => {
    try {
      let result: DefinitionResponse;
      const providerFn = (() => {
        if (config.provider === "openai") {
          console.log("Using OpenAI for definition");
          return () => fetchOpenAIDefinition(rawWord);
        }
        if (config.provider === "proxy") {
          console.log("Using proxy backend for definition:", config.apiBaseUrl);
          return () => fetchProxyDefinition(rawWord);
        }
        console.log("Using Gemini for definition");
        return () => fetchGeminiDefinition(rawWord);
      })();

      result = await withRetries(providerFn, { attempts: 3, baseDelayMs: 250 });

      definitionMemoryCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error fetching definition:", error);
      const fallback: DefinitionResponse = {
        definition: "Definition unavailable. Check network or API config.",
        partOfSpeech: "unknown",
        exampleSentence: "...",
      };
      return fallback;
    } finally {
      definitionInFlight.delete(cacheKey);
    }
  })();

  definitionInFlight.set(cacheKey, requestPromise);
  return requestPromise;
};
