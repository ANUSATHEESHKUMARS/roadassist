import type { AdminUser } from "@/types/admin/user";
import apiClient from "../apiClient";

interface GetAdminUserResponse{
    succes : boolean,
    data : AdminUser[]
}

export const getAdminUser = async (): Promise<AdminUser[]> =>{
    const response = await apiClient.get<GetAdminUserResponse>('/admin/users')
    return response.data.data
}