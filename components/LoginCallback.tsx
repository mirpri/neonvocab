
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { exchangeCodeForToken, fetchUserInfo } from "../services/auth";
import { useUserStore } from "../store/userStore";

const LoginCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useUserStore();
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("Processing login...");

    const processingRef = React.useRef(false);

    useEffect(() => {
        if (processingRef.current) return;
        processingRef.current = true;

        const handleCallback = async () => {
            const code = searchParams.get("code");
            const state = searchParams.get("state");
            const storedState = localStorage.getItem("oauth_state");
            const codeVerifier = localStorage.getItem("pkce_code_verifier");

            if (!code || !state) {
                setError("Missing code or state in callback URL.");
                return;
            }

            if (state !== storedState) {
                setError("State mismatch. Potential CSRF attack.");
                return;
            }

            if (!codeVerifier) {
                setError("Missing code verifier in local storage.");
                return;
            }

            try {
                setStatus("Exchanging code for token...");
                const tokenData = await exchangeCodeForToken(code, codeVerifier);

                setStatus("Fetching user info...");
                const userInfo = await fetchUserInfo(tokenData.access_token);

                // User info is now correctly extracted in the service
                const mappedUser = {
                    username: userInfo.username,
                    nickname: userInfo.nickname,
                    avatarUrl: userInfo.avatarUrl || "https://picsum.photos/200"
                };

                login(tokenData.access_token, mappedUser);

                // Clear temporary auth data
                localStorage.removeItem("oauth_state");
                localStorage.removeItem("pkce_code_verifier");

                // Redirect to home
                navigate("/", { replace: true });
            } catch (err: any) {
                console.error("Login failed:", err);
                setError(err.message || "An unknown error occurred during login.");
            }
        };

        handleCallback();
    }, [searchParams, navigate, login]);

    if (error) {
        return (
            <div className="fixed bottom-4 right-4 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-red-200 dark:border-red-900/50 flex items-start gap-3 max-w-sm">
                    <div className="text-red-500 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-red-600 dark:text-red-400 text-sm">Login Failed</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{error}</p>
                        <button
                            onClick={() => navigate("/", { replace: true })}
                            className="mt-2 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 pointer-events-auto"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-2xl border border-indigo-100 dark:border-indigo-500/20 flex items-center gap-3">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{status}</span>
            </div>
        </div>
    );
};

export default LoginCallback;
