
import { switchActiveRole } from "@/services/authService";
import type { AuthUser, UserRole } from "@/types/admin/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isSwitchingRole: boolean;

    setUser: (user: AuthUser) => void;
    switchRole: (role: UserRole) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isSwitchingRole: false,

            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: true,
                }),

            switchRole: async (role) => {
                const currentUser = get().user;

                if (!currentUser) {
                    throw new Error("User is not authenticated");
                }

                if (!currentUser.roles.includes(role)) {
                    throw new Error(
                        "You are not authorized for this role"
                    );
                }

                if (currentUser.activeRole === role) {
                    return;
                }

                set({ isSwitchingRole: true });

                try {
                    const response = await switchActiveRole(role);

                    set((state) => {
                        if (!state.user) {
                            return {
                                isSwitchingRole: false,
                            };
                        }

                        return {
                            user: {
                                ...state.user,
                                activeRole: response.data.activeRole,
                                roles: response.data.roles,
                            },
                            isSwitchingRole: false,
                        };
                    });
                } catch (error) {
                    set({ isSwitchingRole: false });
                    throw error;
                }
            },

            logout: () =>
                set({
                    user: null,
                    isAuthenticated: false,
                    isSwitchingRole: false,
                }),
        }),
        {
            name: "roadassist-auth",
        }
    )
);

export default useAuthStore;
