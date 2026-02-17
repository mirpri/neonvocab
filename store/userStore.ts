
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserInfo } from "../services/auth";

interface UserState {
    accessToken: string | null;
    user: UserInfo | null;
    isAuthenticated: boolean;
    login: (accessToken: string, user: UserInfo) => void;
    logout: () => void;
    updateUser: (user: Partial<UserInfo>) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            accessToken: null,
            user: null,
            isAuthenticated: false,
            login: (accessToken, user) =>
                set({ accessToken, user, isAuthenticated: true }),
            logout: () =>
                set({ accessToken: null, user: null, isAuthenticated: false }),
            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                })),
        }),
        {
            name: "vocab-user-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
