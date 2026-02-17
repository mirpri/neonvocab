import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Github,
  Moon,
  Sun,
  Image as ImageIcon,
  Shuffle,
  Trophy,
  Home,
  LogIn,
  LogOut,
  Palette,
  RefreshCcw
} from "lucide-react";
import { useVocabStore, selectTodayChallengeScore } from "../store/vocabStore";
import { useUserStore } from "../store/userStore";
import { syncData } from "../services/sync";
import { generateCodeVerifier, sha256, generateState } from "../services/auth"
import { config } from "@/config";

interface NavBarProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  backgroundEnabled: boolean;
  backgroundUrl: string;
  onToggleBackground: () => void;
  onChangeBackgroundUrl: (nextUrl: string) => void;
  onResetData: () => void;
  hasWords: boolean;
}

const NavBar: React.FC<NavBarProps> = ({
  theme,
  onToggleTheme,
  backgroundEnabled,
  backgroundUrl,
  onToggleBackground,
  onChangeBackgroundUrl,
  onResetData,
  hasWords,
}) => {
  const iconButtonStyle =
    "rounded-lg bg-slate-100/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-transparent";

  const navigate = useNavigate();
  const location = useLocation();
  const isOnChallenge = location.pathname === "/challenge";
  const todayScore = useVocabStore(selectTodayChallengeScore);
  const lastModified = useVocabStore((state) => state.lastModified);
  const hasChallengeScore = todayScore !== undefined;

  const { isAuthenticated, user, logout, accessToken } = useUserStore();
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = async () => {
    if (!accessToken) return;
    setIsSyncing(true);
    try {
      const result = await syncData(accessToken);

      if (result.status === 'conflict') {
        const replaceLocal = window.confirm(
          "Conflict detected: The data on the server is newer than when you last synced, but you also have local changes.\n\n" +
          "Click OK to REPLACE local data with server data (lose local changes).\n" +
          "Click Cancel to OVERWRITE server data with local data (keep local changes)."
        );

        if (replaceLocal) {
          // User chose server data
          const dataStr = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
          useVocabStore.getState().replaceData(dataStr);
          alert("Local data replaced with server data.");
        } else {
          // User chose local data - force push
          const forceResult = await syncData(accessToken, true);
          alert(forceResult.message);
        }
      } else {
        alert(result.message);
      }

    } catch (e: any) {
      alert("Sync failed: " + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleChallengeClick = () => {
    navigate(isOnChallenge ? "/" : "/challenge");
  };

  const handleLoginClick = async () => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await sha256(codeVerifier);
    localStorage.setItem("pkce_code_verifier", codeVerifier);
    localStorage.setItem("oauth_state", state);
    const params = new URLSearchParams({
      response_type: "code",
      client_id: "Zm0kyCXZ4pSr-be6TZAhj",
      redirect_uri: `${window.location.origin + window.location.pathname}#`,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256"
    });
    window.location.href =
      `https://mirpass-api.puppygoapp.com/oauth2/authorize?${params.toString()}`;
  }

  return (
    <header className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-600 dark:from-white dark:to-indigo-400">
            NeonVocab
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleChallengeClick}
            className={
              `p-2 ${(isOnChallenge || hasChallengeScore) ? iconButtonStyle : "rounded-lg bg-indigo-100/60 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/10 transition-colors border border-transparent"}`
            }
            aria-label={isOnChallenge ? "Back home" : "Daily Challenge"}
            title={isOnChallenge ? "Back home" : "Daily Challenge"}
          >
            {isOnChallenge ? <Home className="w-4 h-4" /> : <Trophy className={`w-4 h-4 ${!hasChallengeScore ? "animate-bounce" : ""}`} />}
          </button>

          {/* Theme Menu */}
          <div className="relative group">
            <button
              className={`p-2 ${iconButtonStyle}`}
              aria-label="Theme Settings"
              title="Theme Settings"
            >
              <Palette className="w-4 h-4" />
            </button>
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute right-0 top-full mt-2 w-48 transform origin-top-right z-50">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl p-2 flex flex-col gap-1">
                <button
                  onClick={onToggleTheme}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm text-slate-700 dark:text-slate-200 w-full text-left"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </button>

                <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />

                <div className="px-2 py-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Background</div>

                <button
                  onClick={onToggleBackground}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm text-slate-700 dark:text-slate-200 w-full text-left"
                >
                  <ImageIcon className={`w-4 h-4 ${backgroundEnabled ? "text-indigo-500" : "text-slate-400"}`} />
                  <span>{backgroundEnabled ? "Enabled" : "Disabled"}</span>
                </button>

                {backgroundEnabled && (
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg mt-1 space-y-2">
                    <input
                      value={backgroundUrl}
                      onChange={(e) => onChangeBackgroundUrl(e.target.value)}
                      placeholder="Image URL..."
                      className="w-full text-xs px-2 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => onChangeBackgroundUrl(`https://picsum.photos/seed/${Date.now()}/2560/1440`)}
                      className="flex items-center justify-center gap-2 w-full px-2 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                    >
                      <Shuffle className="w-3 h-3" /> Randomize
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Profile */}
          {isAuthenticated && user ? (
            <div className="relative group">
              <button className="flex items-center">
                <img
                  src={user.avatarUrl}
                  alt={user.nickname || user.username}
                  className={iconButtonStyle + " w-[33.33px] h-[33.33px]"}
                />
              </button>

              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute right-0 top-full mt-2 w-64 transform origin-top-right z-50">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl}
                      alt={user.nickname}
                      className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate">{user.nickname}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">@{user.username}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Last modified: {lastModified ? new Date(lastModified).toLocaleString() : "Never"}</p>

                  <div className="h-px bg-slate-200 dark:bg-slate-700" />

                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    <RefreshCcw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                    <span>{isSyncing ? "Syncing..." : "Sync Data"}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to logout?")) {
                        logout();
                      }
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleLoginClick}
              className={`p-2 ${iconButtonStyle}`}
              aria-label="Log in"
              title="Log in"
            >
              <LogIn className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() =>
              window.open("https://github.com/mirpri/neonvocab", "_blank")
            }
            className={`p-2 ${iconButtonStyle}`}
            aria-label="Open GitHub"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
