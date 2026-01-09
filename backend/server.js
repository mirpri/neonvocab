import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CACHE_ENABLED = String(process.env.CACHE_ENABLED ?? 'true').toLowerCase() !== 'false';

let selectDefinition;
let upsertDefinition;
if (CACHE_ENABLED) {
    const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), 'data/vocab.db');
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.exec(`CREATE TABLE IF NOT EXISTS definitions (
        word TEXT PRIMARY KEY,
        definition TEXT NOT NULL,
        partOfSpeech TEXT,
        exampleSentence TEXT,
        createdAt INTEGER NOT NULL
    )`);
    selectDefinition = db.prepare('SELECT definition, partOfSpeech, exampleSentence FROM definitions WHERE word = ?');
    upsertDefinition = db.prepare(`INSERT INTO definitions (word, definition, partOfSpeech, exampleSentence, createdAt)
        VALUES (@word, @definition, @partOfSpeech, @exampleSentence, @createdAt)
        ON CONFLICT(word) DO UPDATE SET
            definition=excluded.definition,
            partOfSpeech=excluded.partOfSpeech,
            exampleSentence=excluded.exampleSentence,
            createdAt=excluded.createdAt`);
}

// Allow requests from your frontend domain
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', 
    methods: ['GET']
}));

// --- GEMINI IMPLEMENTATION ---
const fetchGeminiDefinition = async (word) => {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");
    
    const genAI = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        baseUrl: process.env.GEMINI_BASE_URL 
    });

    const prompt = `Provide a dictionary definition for the word "${word}". 
    The definition should be clear and concise, suitable for a vocabulary learner. 
    Also provide the part of speech and a short example sentence using the word (but replace the target word with '_____' in the sentence).`;

    const response = await genAI.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    definition: { type: Type.STRING },
                    partOfSpeech: { type: Type.STRING },
                    exampleSentence: { type: Type.STRING }
                },
                required: ["definition", "partOfSpeech", "exampleSentence"]
            }
        }
    });

    const text = response.text();
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
};

// --- OPENAI IMPLEMENTATION ---
const fetchOpenAIDefinition = async (word) => {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    if (!apiKey) throw new Error("OPENAI_API_KEY missing");

    const prompt = `Provide a JSON object with a dictionary definition for the word "${word}". 
    Fields: "definition" (concise), "partOfSpeech", "exampleSentence" (replace word with '_____').`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: 'system', content: 'You are a helpful dictionary assistant. Output JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
         const errText = await response.text();
         throw new Error(`OpenAI API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) throw new Error("No content in OpenAI response");
    
    // Sanitize content
    const cleanedContent = content.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    return JSON.parse(cleanedContent);
};

app.get('/definition', async (req, res) => {
    const { word } = req.query;
    const normalizedWord = typeof word === 'string' ? word.trim().toLowerCase() : '';

    if (!normalizedWord) {
        return res.status(400).json({ error: "Word parameter is required" });
    }

    if (CACHE_ENABLED) {
        const cached = selectDefinition.get(normalizedWord);
        if (cached) {
            return res.json(cached);
        }
    }

    try {
        const provider = process.env.AI_PROVIDER || 'gemini';
        let result;

        if (provider === 'openai') {
            result = await fetchOpenAIDefinition(normalizedWord);
        } else {
            result = await fetchGeminiDefinition(normalizedWord);
        }

        if (CACHE_ENABLED) {
            upsertDefinition.run({
                word: normalizedWord,
                definition: result.definition,
                partOfSpeech: result.partOfSpeech,
                exampleSentence: result.exampleSentence,
                createdAt: Date.now()
            });
        }
        
        res.json(result);

    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ 
            definition: "Error fetching definition from backend.",
            partOfSpeech: "error",
            exampleSentence: "Please try again later."
        });
    }
});

app.get('/', (req, res) => {
    res.send('NeonVocab API is running.');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Provider: ${process.env.AI_PROVIDER || 'gemini'}`);
});
