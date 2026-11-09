import type { AuthUser , UserRole} from "@/types/admin/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    setUser: (user: AuthUser) => void;
    switchRole:(role:UserRole) => void
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set,get) => ({
            user: null,
            isAuthenticated: false,

            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: true,
                }),
                switchRole:(role:UserRole)=>{
                    const user = get().user;
                    if(!user || !user.roles.includes(role)){
                        return
                    }
                    set({
                        user:{
                            ...user,
                            activeRole:role
                        }
                    })
                },

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