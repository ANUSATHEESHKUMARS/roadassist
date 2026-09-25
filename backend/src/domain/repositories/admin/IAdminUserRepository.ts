import { AdminUser } from "../../../application/types/admin/AdminUser.js";

export interface IAdminUserRepository{
    findAllUser(search : string | undefined,
        page:number,
        limit:number
    ):Promise<{
        users:AdminUser[];
        totalRecords:number
    }>
}