import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },

    async (error: AxiosError) => {
        const originalRequest = error.config as
            | (InternalAxiosRequestConfig & { _retry?: boolean })
            | undefined;

        // If there is no request config, just reject
        if (!originalRequest) {
            return Promise.reject(error);
        }

        const isLoginRequest = originalRequest.url?.includes("/auth/login");
        const isRefreshRequest = originalRequest.url?.includes("/auth/refresh");

        
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isLoginRequest &&
            !isRefreshRequest
        ) {
            originalRequest._retry = true;

            try {
                await apiClient.post("/auth/refresh");

                return apiClient(originalRequest);

            } catch (refreshError) {
                useAuthStore.getState().logout();

                window.location.href = "/login";

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;