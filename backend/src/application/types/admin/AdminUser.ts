import { UserRole } from "../../../domain/User/entities/User.js"

export type AdminUserStatus = "active" | "blocked"

export interface AdminUser {
    userId : string,
    fullName:string,
    email:string,
    phoneNumber:string,
    roles:UserRole[]
    authProvider:"LOCAL"|"GOOGLE",
    status:AdminUserStatus
}


