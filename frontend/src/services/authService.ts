import apiClient from "./apiClient";
import type { RegisterRequest } from "@/types/auth";



export const register = async (data : RegisterRequest) => {
    const response = await apiClient.post('/auth/register', data)
    console.log(response)
    return response
}



