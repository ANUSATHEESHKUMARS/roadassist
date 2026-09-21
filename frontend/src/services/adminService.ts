import type { GetUsersResponseDto } from "@/types/admin";
import apiClient from "./apiClient";


export const getUsers = async():Promise<GetUsersResponseDto[]> =>{
    const respose = await apiClient.get('/admin/users')
    return respose.data.data
}


