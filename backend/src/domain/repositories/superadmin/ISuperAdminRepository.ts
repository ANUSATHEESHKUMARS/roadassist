import { AdminUser } from "../../../application/types/admin/AdminUser.js";

export interface ISuperAdminRepository {
    findAdmins(search : string | undefined,
        page:number,
        limit:number
    ):Promise<{
        admins:AdminUser[];
        totalRecords:number
    }>
}