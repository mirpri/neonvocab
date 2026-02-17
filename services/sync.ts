
import { config } from "@/config";
import { useVocabStore } from "../store/vocabStore";

const SYNC_ENDPOINT = config.apiBaseUrl + "/sync";

export interface SyncResult {
    status: 'success' | 'updated' | 'conflict' | 'error';
    message?: string;
    data?: any;
    timestamp?: number;
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
            throw new Error(`Sync failed: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.status === 'conflict') {
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
