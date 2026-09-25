import type { AdminUser } from "@/types/admin/user";
import apiClient from "../apiClient";

interface GetAdminUserResponse{
    succes : boolean,
    data : AdminUser[]
}

export const getAdminUser = async (search? : string): Promise<AdminUser[]> =>{
    const response = await apiClient.get<GetAdminUserResponse>('/admin/users',{params: {search}})
    return response.data.data
}