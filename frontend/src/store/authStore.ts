import type { AuthUser, UserRole } from "@/types/admin/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    setUser: (user: AuthUser) => void;
    updateActiveRole: (role: UserRole, roles?: UserRole[]) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,

            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: true,
                }),

            updateActiveRole: (role, roles) =>
                set((state) => {
                    if (!state.user) return state;
                    return {
                        user: {
                            ...state.user,
                            activeRole: role,
                            ...(roles ? { roles } : {}),
                        },
                    };
                }),

            logout: () =>
                set({
                    user: null,
                    isAuthenticated: false,
                }),
        }),
        {
            name: "roadassist-auth",
        }
    )
);

export default useAuthStore;