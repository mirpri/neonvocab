
import { config } from "@/config";
import { useVocabStore } from "../store/vocabStore";
import { useUserStore } from "../store/userStore";

const SYNC_ENDPOINT = config.apiBaseUrl + "/sync";

export interface SyncResult {
    status: 'success' | 'updated' | 'conflict' | 'error';
    message?: string;
    data?: any;
    timestamp?: number;
}

/**
 * Returns true if the local store holds meaningful user data that would be
 * lost by blindly pulling server data. A brand-new store (fresh install or
 * right after login, before any imports/progress) returns false.
 */
export function hasLocalData(): boolean {
    const s = useVocabStore.getState();
    const anyWords = Array.isArray(s.wordlists)
        && s.wordlists.some((wl) => wl.id !== 'daily-challenge' && (wl.words?.length ?? 0) > 0);
    const anyDaily = s.dailyStats && Object.keys(s.dailyStats).length > 0;
    const anyStats = (s.stats?.totalWordsLearned ?? 0) > 0 || (s.stats?.streak ?? 0) > 0;
    const anyChallenge = s.dailyChallengeScores && Object.keys(s.dailyChallengeScores).length > 0;
    return Boolean(anyWords || anyDaily || anyStats || anyChallenge);
}

export async function syncData(accessToken: string, force = false): Promise<SyncResult> {
    const store = useVocabStore.getState();

    // We only need to persist the 'persisted' parts of the store.
    const payloadData = {
        wordlists: store.wordlists,
        activeWordlistId: store.activeWordlistId,
        wordSort: store.wordSort,
        stats: store.stats,
        dailyStats: store.dailyStats,
        definitionCache: store.definitionCache,
        lastSessionGoal: store.lastSessionGoal,
        dailyChallengeScores: store.dailyChallengeScores,
        lastModified: store.lastModified || 0,
        lastSyncTime: store.lastSyncTime || 0,
    };

    const payload = {
        token: accessToken,
        timestamp: payloadData.lastModified,
        lastSynced: payloadData.lastSyncTime,
        force: force,
        data: JSON.stringify(payloadData),
    };

    try {
        const response = await fetch(SYNC_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            if (response.status === 401) {
                const body = await response.json().catch(() => ({}));
                if (body.error === 'token_expired') {
                    useUserStore.getState().logout();
                    return { status: 'error', message: 'Session expired — please log in again' };
                }
            }
            throw new Error(`Sync failed: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.status === 'conflict') {
            // Safety net: if we have nothing meaningful locally, there is no
            // real conflict — just adopt the server's data. This prevents the
            // "conflict" prompt right after logging into an existing account
            // on a fresh device.
            if (!hasLocalData()) {
                const dataStr = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
                store.replaceData(dataStr);
                return { status: 'updated', message: "Data loaded from your account" };
            }

            return {
                status: 'conflict',
                message: 'Data conflict detected',
                data: result.data,
                timestamp: result.timestamp
            };
        }

        if (result.data) {
            // Server has newer data
            const dataStr = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
            store.replaceData(dataStr);
            return { status: 'updated', message: "Data updated from server" };
        } else {
            // Update lastSyncTime to now (or use server timestamp if we had one)
            useVocabStore.setState({ lastSyncTime: Date.now() });
            return { status: 'success', message: "Server updated successfully" };
        }
    } catch (error: any) {
        console.error("Sync error:", error);
        return { status: 'error', message: error.message || "Sync failed" };
    }
}

/**
 * Background sync used by automatic triggers (login, debounced local edits).
 * Coalesces concurrent calls and never surfaces prompts: a genuine conflict
 * (local data AND diverging server data) is left untouched for the user to
 * resolve manually via the Sync button.
 */
let autoInFlight = false;

export async function autoSync(accessToken: string | null | undefined): Promise<SyncResult | null> {
    if (!accessToken || autoInFlight) return null;
    autoInFlight = true;
    try {
        return await syncData(accessToken);
    } finally {
        autoInFlight = false;
    }
}
