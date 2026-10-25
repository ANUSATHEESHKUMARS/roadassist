import apiClient from "../apiClient";
import type { AdminUser } from "@/types/admin/user";
import API_ROUTES from "../apiRoutes";

interface GetAdminsResponse {
    success: boolean;
    data: AdminUser[];
    pagination : {
        currentPage:number,
        totalPage:number,
        totalRecords:number,
        pageSize : number
    }
}
export const getAdmins = async (search : string = "", 
    page:number = 1,
    limit:number = 10
): Promise<GetAdminsResponse> => {
    const response = await apiClient.get<GetAdminsResponse>(API_ROUTES.SUPERADMIN.ADMINS,{
        params:{
            search ,
            page ,
            limit
        }
    })
    return response.data
}