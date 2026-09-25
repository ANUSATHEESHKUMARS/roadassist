import type { AuthUser } from "@/types/admin/auth";
import { create } from "zustand";

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    setUser: (user: AuthUser) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    setUser: (user) =>
        set({
            user,
            isAuthenticated: true
        }),
    logout: () =>
        set({
            user: null,
            isAuthenticated: false
        })
}))


