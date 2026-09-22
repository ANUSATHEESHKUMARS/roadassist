import { AdminUser } from "../../../application/types/admin/AdminUser.js";

export interface IAdminUserRepository{
    findAllUser():Promise<AdminUser[]>
}