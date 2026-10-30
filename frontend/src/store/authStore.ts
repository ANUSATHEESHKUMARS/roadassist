import type { AuthUser } from "@/types/admin/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    setUser: (user: AuthUser) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,

            setUser: (user) =>
                set({
                    // Normalize: backend sends `activeRole`, frontend uses `role`
                    user: {
                        ...user,
                        role: user.activeRole ?? user.role,
                    },
                    isAuthenticated: true
                }),

            logout: () =>
                set({
                    user: null,
                    isAuthenticated: false
                })
        }),
        {
            name: "roadassist-auth",
            onRehydrateStorage: () => (state) => {
                // Normalize stale persisted data where `role` may be missing
                if (state?.user && !state.user.role && state.user.activeRole) {
                    state.user.role = state.user.activeRole;
                }
            }
        }
    )
);

export default useAuthStore;

