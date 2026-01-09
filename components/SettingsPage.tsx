import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY_PROVIDER = 'vocab-ai-provider';
const STORAGE_KEY_API_BASE_URL = 'vocab-api-base-url';
const STORAGE_KEY_GEMINI_KEY = 'vocab-gemini-key';
const STORAGE_KEY_GEMINI_MODEL = 'vocab-gemini-model';
const STORAGE_KEY_OPENAI_KEY = 'vocab-openai-key';
const STORAGE_KEY_OPENAI_BASE_URL = 'vocab-openai-base-url';
const STORAGE_KEY_OPENAI_MODEL = 'vocab-openai-model';

export default function SettingsPage() {
    const navigate = useNavigate();
    const [provider, setProvider] = useState<string>('proxy');
    const [apiBaseUrl, setApiBaseUrl] = useState<string>('');
    const [geminiKey, setGeminiKey] = useState<string>('');
    const [geminiModel, setGeminiModel] = useState<string>('gemini-1.5-flash');
    const [openaiKey, setOpenaiKey] = useState<string>('');
    const [openaiBaseUrl, setOpenaiBaseUrl] = useState<string>('https://api.openai.com/v1');
    const [openaiModel, setOpenaiModel] = useState<string>('gpt-4o-mini');

    useEffect(() => {
        // Load settings from localStorage or defaults
        setProvider(localStorage.getItem(STORAGE_KEY_PROVIDER) || 'proxy');
        setApiBaseUrl(localStorage.getItem(STORAGE_KEY_API_BASE_URL) || '');
        setGeminiKey(localStorage.getItem(STORAGE_KEY_GEMINI_KEY) || '');
        setGeminiModel(localStorage.getItem(STORAGE_KEY_GEMINI_MODEL) || 'gemini-1.5-flash');
        setOpenaiKey(localStorage.getItem(STORAGE_KEY_OPENAI_KEY) || '');
        setOpenaiBaseUrl(localStorage.getItem(STORAGE_KEY_OPENAI_BASE_URL) || 'https://api.openai.com/v1');
        setOpenaiModel(localStorage.getItem(STORAGE_KEY_OPENAI_MODEL) || 'gpt-4o-mini');
    }, []);

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY_PROVIDER, provider);
        localStorage.setItem(STORAGE_KEY_API_BASE_URL, apiBaseUrl);
        localStorage.setItem(STORAGE_KEY_GEMINI_KEY, geminiKey);
        localStorage.setItem(STORAGE_KEY_GEMINI_MODEL, geminiModel);
        localStorage.setItem(STORAGE_KEY_OPENAI_KEY, openaiKey);
        localStorage.setItem(STORAGE_KEY_OPENAI_BASE_URL, openaiBaseUrl);
        localStorage.setItem(STORAGE_KEY_OPENAI_MODEL, openaiModel);
        alert('Settings saved successfully!');
        window.location.reload();
    };

    return (
        <div className="text-slate-900 dark:text-slate-100 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="mr-4 p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold">Settings</h1>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 space-y-8">

                    {/* AI Provider Selection */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">AI Provider</h2>
                        <div className="grid grid-cols-3 gap-4">
                            {['proxy', 'gemini', 'openai'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setProvider(p)}
                                    className={`py-3 px-4 rounded-lg border-2 capitalize font-medium transition-all ${provider === p
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        {provider === 'proxy' && (
                            <p className="mt-2 text-sm text-slate-500">
                                Uses the configured backend proxy server.
                            </p>
                        )}
                    </section>

                    {/* Proxy Settings */}
                    {provider === 'proxy' && (
                        <section className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <h2 className="text-xl font-semibold">Proxy Configuration</h2>
                            <div>
                                <label className="block text-sm font-medium mb-1">Backend API URL</label>
                                <input
                                    type="text"
                                    value={apiBaseUrl}
                                    onChange={(e) => setApiBaseUrl(e.target.value)}
                                    placeholder="https://your-backend-api.com"
                                    className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">Leave empty to use default</p>
                            </div>
                        </section>
                    )}

                    {/* Gemini Settings */}
                    {provider === 'gemini' && (
                        <section className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <h2 className="text-xl font-semibold">Google Gemini Configuration</h2>
                            <div>
                                <label className="block text-sm font-medium mb-1">API Key</label>
                                <input
                                    type="password"
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    placeholder="AIza..."
                                    className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Model Name</label>
                                <input
                                    type="text"
                                    value={geminiModel}
                                    onChange={(e) => setGeminiModel(e.target.value)}
                                    placeholder="gemini-1.5-flash"
                                    className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </section>
                    )}

                    {/* OpenAI Settings */}
                    {provider === 'openai' && (
                        <section className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <h2 className="text-xl font-semibold">OpenAI / Compatible Configuration</h2>
                            <div>
                                <label className="block text-sm font-medium mb-1">API Key</label>
                                <input
                                    type="password"
                                    value={openaiKey}
                                    onChange={(e) => setOpenaiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Base URL</label>
                                <input
                                    type="text"
                                    value={openaiBaseUrl}
                                    onChange={(e) => setOpenaiBaseUrl(e.target.value)}
                                    placeholder="https://api.openai.com/v1"
                                    className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Model Name</label>
                                <input
                                    type="text"
                                    value={openaiModel}
                                    onChange={(e) => setOpenaiModel(e.target.value)}
                                    placeholder="gpt-4o-mini"
                                    className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </section>
                    )}

                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
