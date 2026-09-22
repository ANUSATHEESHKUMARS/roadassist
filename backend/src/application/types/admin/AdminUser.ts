export type AdminUserStatus = "active" | "blocked"

export interface AdminUser {
    userId : string,
    fullName:string,
    email:string,
    phoneNumber:string,
    role:"user"|"mechanic"|"admin",
    authProvider:"LOCAL"|"GOOGLE",
    status:AdminUserStatus
}