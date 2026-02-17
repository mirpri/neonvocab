
import { config } from "@/config";
import { useVocabStore } from "../store/vocabStore";

const SYNC_ENDPOINT = config.apiBaseUrl;

interface SyncResponse {
    status?: string;
    message?: string;
    data?: any; // The store data
    timestamp?: number;
}

export async function syncData(accessToken: string): Promise<string> {
    const store = useVocabStore.getState();

    // We only need to persist the 'persisted' parts of the store.
    // Zustand's persist middleware stores this in localStorage, so we can grab it from there
    // OR we can manually construct it from the state.
    // Constructing it ensures we send what we expect.

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
    };

    const payload = {
        token: accessToken,
        timestamp: payloadData.lastModified,
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

        const result: SyncResponse = await response.json();

        if (result.data) {
            const dataStr = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
            store.replaceData(dataStr);
            return "Data updated from server";
        } else {
            return "Server updated successfully";
        }
    } catch (error: any) {
        console.error("Sync error:", error);
        throw new Error(error.message || "Sync failed");
    }
}
