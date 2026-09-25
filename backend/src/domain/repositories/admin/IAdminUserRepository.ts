import { AdminUser } from "../../../application/types/admin/AdminUser.js";

export interface IAdminUserRepository{
    findAllUser(search? : string):Promise<AdminUser[]>
}