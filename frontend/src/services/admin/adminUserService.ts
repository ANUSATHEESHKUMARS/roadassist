import type { AdminUser } from "@/types/admin/user";
import apiClient from "../apiClient";

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

export const getAdminUser = async (search:string =  "",
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