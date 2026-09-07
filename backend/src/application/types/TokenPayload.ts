export interface TokenPayload {
    userId : string,
    email : string,
    role : "user"| "mechanic" | "admin" | "super_admin"
}


