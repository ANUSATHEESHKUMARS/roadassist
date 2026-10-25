import type { AdminUser } from "@/types/admin/user";
import apiClient from "../apiClient";



export type AdminUserStatus = 'active' | "blocked"


export interface UpdateUserStatusResponse {
    message: string,
    user: {
        userId: string;
        fullName: string;
        email: string;
        phoneNumber: string;
        role: "user" | "mechanic" | "admin" | "superadmin";
        authProvider: "LOCAL" | "GOOGLE";
        status: AdminUserStatus
    }
}




interface GetAdminUserResponse {
    succes: boolean,
    data: AdminUser[];
    pagination: {
        currentPage: number;
        totalPage: number,
        totalRecords: number,
        pageSize: number
    }
}



export const getAdminUser = async (search: string = "",
    page = 1,
    limit = 10
): Promise<GetAdminUserResponse> => {
    const response = await apiClient.get<GetAdminUserResponse>('/admin/users', {
        params: {
            search,
            page,
            limit
        }
    })
    return response.data
}

export const blockAdminUser = async (
    userId: string,
): Promise<UpdateUserStatusResponse> => {
    const response = await apiClient.patch<UpdateUserStatusResponse>(`/admin/user/${userId}/block`)
    return response.data
}

export const unblockAdminuser = async (
    userId: string
): Promise<UpdateUserStatusResponse> => {
    const resposne = await apiClient.patch<UpdateUserStatusResponse>(`/admin/user/${userId}/unblock`)
    return resposne.data
}