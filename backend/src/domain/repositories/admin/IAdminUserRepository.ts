import { AdminUser } from "../../../application/types/admin/AdminUser.js";
import { AccountStatus } from "../../User/entities/User.js";

export interface IAdminUserRepository{
    findAllUser(search : string | undefined,
        page:number,
        limit:number
    ):Promise<{
    users:AdminUser[];
        totalRecords:number
    }>
    updateUserStatus(
        userId:string,
        status:AccountStatus
    ):Promise<AdminUser | null>
}