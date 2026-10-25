import type { AdminUser } from "@/types/admin/user";
import apiClient from "../apiClient";
import API_ROUTES from "../apiRoutes";



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
    const response = await apiClient.get<GetAdminUserResponse>(API_ROUTES.ADMIN.USERS, {
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
    const response = await apiClient.patch<UpdateUserStatusResponse>(API_ROUTES.ADMIN.BLOCK_USER(userId))
    return response.data
}

export const unblockAdminuser = async (
    userId: string
): Promise<UpdateUserStatusResponse> => {
    const resposne = await apiClient.patch<UpdateUserStatusResponse>(API_ROUTES.ADMIN.UNBLOCK_USER(userId))
    return resposne.data
}