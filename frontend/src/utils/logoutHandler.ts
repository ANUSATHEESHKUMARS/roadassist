import { logout as logoutApi } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

export const handleLogout = async () => {
    try {
        await logoutApi();
    } catch (error) {
        console.error("Logout API failed:", error);
    } finally {
        useAuthStore.getState().logout();
    }
};